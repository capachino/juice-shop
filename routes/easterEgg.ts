/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { type Request, type Response } from 'express'

export function serveEasterEgg () {
  return (req: Request, res: Response) => {
    res.sendFile(path.resolve('frontend/dist/frontend/assets/private/threejs-demo.html'))
  }
}
