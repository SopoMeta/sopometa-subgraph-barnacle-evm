import { Transaction } from '../types'
import { FrontierEvmEvent } from '@subql/contract-processors/dist/frontierEvm'

import { BigNumber } from 'ethers'

import { AddressZero } from '../const'

// Setup types from ABI
type TransferEventArgs = [string, string, BigNumber] & { from: string; to: string; tokenId: BigNumber }

export async function handleTransferEvent(event: FrontierEvmEvent<TransferEventArgs>): Promise<void> {
  const { tokenId, from, to } = event.args

  if (from.toLowerCase() === AddressZero.toLowerCase()) {
    // Mint NFT
    const transaction = new Transaction(tokenId.toString())

    transaction.tokenId = tokenId.toBigInt()
    transaction.from = from
    transaction.to = to
    transaction.contractAddress = event.address

    await transaction.save()
  } else if (to.toLowerCase() === AddressZero.toLowerCase()) {
    // Burn NFT
    Transaction.remove(tokenId.toString())
  }
}
