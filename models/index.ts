/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { AddressModelInit } from './address'
import { BasketModelInit } from './basket'
import { BasketItemModelInit } from './basketitem'
import { CaptchaModelInit } from './captcha'
import { CardModelInit } from './card'
import { ComplaintModelInit } from './complaint'
import { DeliveryModelInit } from './delivery'
import { FeedbackModelInit } from './feedback'
import { ImageCaptchaModelInit } from './imageCaptcha'
import { MemoryModelInit } from './memory'
import { PrivacyRequestModelInit } from './privacyRequests'
import { ProductModelInit } from './product'
import { QuantityModelInit } from './quantity'
import { RecycleModelInit } from './recycle'
import { relationsInit } from './relations'
import { SecurityAnswerModelInit } from './securityAnswer'
import { SecurityQuestionModelInit } from './securityQuestion'
import { UserModelInit } from './user'
import { WalletModelInit } from './wallet'
import { Sequelize, Transaction } from 'sequelize'

/* jslint node: true */
const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  retry: {
    match: [/SQLITE_BUSY/],
    name: 'query',
    max: 5
  },
  transactionType: Transaction.TYPES.IMMEDIATE,
  storage: 'data/juiceshop.sqlite',
  logging: false
})
AddressModelInit(sequelize)
BasketModelInit(sequelize)
BasketItemModelInit(sequelize)
CaptchaModelInit(sequelize)
CardModelInit(sequelize)
ComplaintModelInit(sequelize)
DeliveryModelInit(sequelize)
FeedbackModelInit(sequelize)
ImageCaptchaModelInit(sequelize)
MemoryModelInit(sequelize)
PrivacyRequestModelInit(sequelize)
ProductModelInit(sequelize)
QuantityModelInit(sequelize)
RecycleModelInit(sequelize)
SecurityAnswerModelInit(sequelize)
SecurityQuestionModelInit(sequelize)
UserModelInit(sequelize)
WalletModelInit(sequelize)

relationsInit(sequelize)

export { sequelize }
