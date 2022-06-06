import { Nft } from '../types'
import { FrontierEvmEvent } from '@subql/contract-processors/dist/frontierEvm'

import { BigNumber } from 'ethers'

import { AddressZero } from '../const'

// Setup types from ABI
type TransferEventArgs = [string, string, BigNumber] & { from: string; to: string; tokenId: BigNumber }

type MintEventArgs = [string, BigNumber, string] & { owner: string; nft_id: BigNumber; tokenuri: string }

export async function handleMintEvent(event: FrontierEvmEvent<MintEventArgs>): Promise<void> {
  const { owner, nft_id, tokenuri } = event.args
  const nft = new Nft(event.address + '-' + nft_id.toString())

  nft.owner = owner
  nft.tokenId = nft_id.toBigInt()
  nft.tokenUri = tokenuri

  await nft.save()
}

export async function handleTransferEvent(event: FrontierEvmEvent<TransferEventArgs>): Promise<void> {
  const { tokenId, from, to } = event.args
  const nft = await Nft.get(event.address + '-' + tokenId.toString())

  // Normally transfer
  if (from.toLowerCase() !== AddressZero.toLowerCase()) {
    nft.owner = to

    await nft.save()
  }

  // Burn token
  if (to.toLowerCase() === AddressZero.toLowerCase()) {
    await Nft.remove(event.address + '-' + tokenId.toString())
  }
}
