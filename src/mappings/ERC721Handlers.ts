import { Transaction } from '../types'
import { FrontierEvmEvent } from '@subql/contract-processors/dist/frontierEvm'

import { BigNumber } from 'ethers'

import { AddressZero } from '../const'

// Setup types from ABI
type TransferEventArgs = [string, string, BigNumber] & { from: string; to: string; tokenId: BigNumber }
export async function handleTransferEvent(event: FrontierEvmEvent<TransferEventArgs>): Promise<void> {
  const { tokenId, from, to } = event.args

  // Mint
  if (from.toLowerCase() === AddressZero.toLowerCase()) {
    const nft = new Transaction(event.address + '-' + tokenId)

    nft.from = from
    nft.tokenId = tokenId.toBigInt()
    nft.to = to
    nft.contractAddress = event.address

    await nft.save()
  }

  // Burn
  if (to.toLowerCase() === AddressZero.toLowerCase()){
    const nftId = event.address + '-' + tokenId
    await Transaction.remove(nftId)
  }
}

// export async function handleMintCall(callArgs: FrontierEvmCall<MintCallArgs>): Promise<void> {
//   const minted = new Minted(callArgs.hash)

//   minted.to = callArgs.args.owner
//   minted.tokenUri = callArgs.args.tokenuri

//   minted.save()
// }
