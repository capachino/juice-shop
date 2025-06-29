/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'

export function repeatNotification () {
  return ({ query }: Request, res: Response) => {
    res.sendStatus(200)
  }
}
