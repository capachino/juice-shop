/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'

import { reviewsCollection } from '../data/mongodb'
import * as utils from '../lib/utils'

export function createProductReviews () {
  return async (req: Request, res: Response) => {
    try {
      await reviewsCollection.insert({
        product: req.params.id,
        message: req.body.message,
        author: req.body.author,
        likesCount: 0,
        likedBy: []
      })
      return res.status(201).json({ status: 'success' })
    } catch (err: unknown) {
      return res.status(500).json(utils.getErrorMessage(err))
    }
  }
}
