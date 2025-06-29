import { type Request, type Response } from 'express'
import { WebSocketProvider, Contract } from 'ethers'

import { nftABI } from '../data/static/contractABIs'
import * as utils from '../lib/utils'

const nftAddress = '0x41427790c94E7a592B17ad694eD9c06A02bb9C39'
const addressesMinted = new Set()
let isEventListenerCreated = false

export function nftMintListener () {
  return async (req: Request, res: Response) => {
    try {
      const provider = new WebSocketProvider('wss://eth-sepolia.g.alchemy.com/v2/FZDapFZSs1l6yhHW4VnQqsi18qSd-3GJ')
      const contract = new Contract(nftAddress, nftABI, provider)
      if (!isEventListenerCreated) {
        void contract.on('NFTMinted', (minter: string) => {
          if (!addressesMinted.has(minter)) {
            addressesMinted.add(minter)
          }
        })
        isEventListenerCreated = true
      }
      res.status(200).json({ success: true, message: 'Event Listener Created' })
    } catch (error) {
      res.status(500).json(utils.getErrorMessage(error))
    }
  }
}
