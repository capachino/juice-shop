/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { UserModel } from '../models/user'
import { WalletModel } from '../models/wallet'
import { FeedbackModel } from '../models/feedback'
import { ComplaintModel } from '../models/complaint'
import { Op } from 'sequelize'
import logger from '../lib/logger'
import config from 'config'
import * as utils from '../lib/utils'
import { reviewsCollection, ordersCollection } from '../data/mongodb'
import * as Prometheus from 'prom-client'
import onFinished from 'on-finished'

const register = Prometheus.register

const fileUploadsCountMetric = new Prometheus.Counter({
  name: 'file_uploads_count',
  help: 'Total number of successful file uploads grouped by file type.',
  labelNames: ['file_type']
})

const fileUploadErrorsMetric = new Prometheus.Counter({
  name: 'file_upload_errors',
  help: 'Total number of failed file uploads grouped by file type.',
  labelNames: ['file_type']
})

export function observeRequestMetricsMiddleware () {
  const httpRequestsMetric = new Prometheus.Counter({
    name: 'http_requests_count',
    help: 'Total HTTP request count grouped by status code.',
    labelNames: ['status_code']
  })

  return (req: Request, res: Response, next: NextFunction) => {
    onFinished(res, () => {
      const statusCode = `${Math.floor(res.statusCode / 100)}XX`
      httpRequestsMetric.labels(statusCode).inc()
    })
    next()
  }
}

export function observeFileUploadMetricsMiddleware () {
  return ({ file }: Request, res: Response, next: NextFunction) => {
    onFinished(res, () => {
      if (file != null) {
        res.statusCode < 400 ? fileUploadsCountMetric.labels(file.mimetype).inc() : fileUploadErrorsMetric.labels(file.mimetype).inc()
      }
    })
    next()
  }
}

export function serveMetrics () {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  }
}

export function observeMetrics () {
  const app = config.get<string>('application.customMetricsPrefix')
  Prometheus.collectDefaultMetrics({})
  register.setDefaultLabels({ app })

  const versionMetrics = new Prometheus.Gauge({
    name: `${app}_version_info`,
    help: `Release version of ${config.get<string>('application.name')}.`,
    labelNames: ['version', 'major', 'minor', 'patch']
  })

  const orderMetrics = new Prometheus.Gauge({
    name: `${app}_orders_placed_total`,
    help: `Number of orders placed in ${config.get<string>('application.name')}.`
  })

  const userMetrics = new Prometheus.Gauge({
    name: `${app}_users_registered`,
    help: 'Number of registered users grouped by customer type.',
    labelNames: ['type']
  })

  const userTotalMetrics = new Prometheus.Gauge({
    name: `${app}_users_registered_total`,
    help: 'Total number of registered users.'
  })

  const walletMetrics = new Prometheus.Gauge({
    name: `${app}_wallet_balance_total`,
    help: 'Total balance of all users\' digital wallets.'
  })

  const interactionsMetrics = new Prometheus.Gauge({
    name: `${app}_user_social_interactions`,
    help: 'Number of social interactions with users grouped by type.',
    labelNames: ['type']
  })

  const updateLoop = () => setInterval(() => {
    try {
      const version = utils.version()
      const { major, minor, patch } = version.match(/(?<major>\d+).(?<minor>\d+).(?<patch>\d+)/).groups
      versionMetrics.set({ version, major, minor, patch }, 1)

      ordersCollection.count({}).then((orderCount: number) => {
        if (orderCount) orderMetrics.set(orderCount)
      })

      reviewsCollection.count({}).then((reviewCount: number) => {
        if (reviewCount) interactionsMetrics.set({ type: 'review' }, reviewCount)
      })

      void UserModel.count({ where: { role: { [Op.eq]: 'customer' } } }).then((count: number) => {
        if (count) userMetrics.set({ type: 'standard' }, count)
      })

      void UserModel.count({ where: { role: { [Op.eq]: 'deluxe' } } }).then((count: number) => {
        if (count) userMetrics.set({ type: 'deluxe' }, count)
      })

      void UserModel.count().then((count: number) => {
        if (count) userTotalMetrics.set(count)
      })

      void WalletModel.sum('balance').then((totalBalance: number) => {
        if (totalBalance) walletMetrics.set(totalBalance)
      })

      void FeedbackModel.count().then((count: number) => {
        if (count) interactionsMetrics.set({ type: 'feedback' }, count)
      })

      void ComplaintModel.count().then((count: number) => {
        if (count) interactionsMetrics.set({ type: 'complaint' }, count)
      })
    } catch (e: unknown) {
      logger.warn('Error during metrics update loop: + ' + utils.getErrorMessage(e))
    }
  }, 5000)

  return {
    register,
    updateLoop
  }
}
