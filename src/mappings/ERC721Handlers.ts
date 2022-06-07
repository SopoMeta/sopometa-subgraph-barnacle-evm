import { Nft } from '../types'
import { FrontierEvmEvent } from '@subql/contract-processors/dist/frontierEvm'

import { BigNumber } from 'ethers'

import { AddressZero } from '../const'

// Setup types from ABI
type TransferEventArgs = [string, string, BigNumber] & { from: string; to: string; tokenId: BigNumber }
export async function handleTransferEvent(event: FrontierEvmEvent<TransferEventArgs>): Promise<void> {
  const { tokenId, from, to } = event.args

  // Mint
  if (from.toLowerCase() === AddressZero.toLowerCase()) {
    const nft = new Nft(event.address + '-' + tokenId)

    nft.owner = to
    nft.tokenId = tokenId.toBigInt()
    nft.contractAddress = event.address

    await nft.save()
  }

  // Burn
  if (to.toLowerCase() === AddressZero.toLowerCase()){
    const nftId = event.address + '-' + tokenId
    await Nft.remove(nftId)
  }
}

// export async function handleMintCall(callArgs: FrontierEvmCall<MintCallArgs>): Promise<void> {
//   const minted = new Minted(callArgs.hash)

//   minted.to = callArgs.args.owner
//   minted.tokenUri = callArgs.args.tokenuri

//   minted.save()
// }
