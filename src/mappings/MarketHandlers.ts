import { SopoItem, Offer, Order } from '../types'
import { MoonbeamEvent } from '@subql/contract-processors/dist/moonbeam'
import { BigNumber } from 'ethers'

// Listed(
//   address indexed from,
//   address to,
//   uint256 indexed sopo_id,
//   uint256 nft_id,
//   address indexed nft_programe_address
// );
type ListEventArgs = [string, string, BigNumber, BigNumber, string] & {
  from: string
  to: string
  sopo_id: BigNumber
  nft_id: BigNumber
  nft_programe_address: string
}

// Listandforsell(
//   address indexed from,
//   address to,
//   uint256 sopo_id,
//   uint256 nft_id,
//   address indexed nft_programe_address,
//   uint256 indexed price
// );
type ListAndForSellEventArgs = [string, string, BigNumber, BigNumber, string, BigNumber] & {
  from: string
  to: string
  sopo_id: BigNumber
  nft_id: BigNumber
  nft_programe_address: string
  price: BigNumber
}

// Forsell(uint256 indexed sopo_id, uint256 indexed price);
type ForsellEventArgs = [BigNumber, BigNumber] & {
  sopo_id: BigNumber
  price: BigNumber
}

// Newoffer(
//   address indexed from,
//   address indexed to,
//   uint256 sopo_id,
//   uint256 indexed price
// );
type NewOfferEventArgs = [string, string, BigNumber, BigNumber] & {
  from: string
  to: string
  sopo_id: BigNumber
  price: BigNumber
}

// Withdraw(
//   address indexed from,
//   address to,
//   uint256 sopo_id,
//   uint256 nft_id,
//   address indexed nft_programe_address,
//   uint32 indexed withdrawout_at
// );
type WithdrawEventArgs = [string, string, BigNumber, BigNumber, string, BigNumber] & {
  from: string
  to: string
  sopo_id: BigNumber
  nft_id: BigNumber
  nft_programe_address: string
  withdrawout_at: BigNumber
}

//  Selled(address indexed from, address to, uint256 sopo_id, uint32 indexed selled_at, uint256 nft_id, address indexed nft_programe_address, address owner, uint256 price)
type SelledEventArgs = [string, string, BigNumber, BigNumber, BigNumber, string, string, BigNumber] & {
  from: string
  to: string
  sopo_id: BigNumber
  selled_at: BigNumber
  nft_id: BigNumber
  nft_programe_address: string
  owner: string
  price: BigNumber
}

export async function handleListedEvent(event: MoonbeamEvent<ListEventArgs>): Promise<void> {
  const sopoItem = new SopoItem(event.args.sopo_id.toString())

  sopoItem.owner = event.args.from
  sopoItem.contractAddress = event.args.nft_programe_address
  sopoItem.onSale = false
  sopoItem.price = 0
  sopoItem.tokenId = event.args.nft_id.toBigInt()
  sopoItem.sopoId = event.args.sopo_id.toBigInt()

  await sopoItem.save()
}

export async function handleListAndSellEvent(event: MoonbeamEvent<ListAndForSellEventArgs>): Promise<void> {
  const sopoItem = new SopoItem(event.args.sopo_id.toString())

  sopoItem.owner = event.args.from
  sopoItem.contractAddress = event.args.nft_programe_address
  sopoItem.onSale = true
  sopoItem.price = event.args.price.toNumber()
  sopoItem.tokenId = event.args.nft_id.toBigInt()
  sopoItem.sopoId = event.args.sopo_id.toBigInt()

  await sopoItem.save()
}

export async function handleSellEvent(event: MoonbeamEvent<ForsellEventArgs>): Promise<void> {
  const sopoItem = await SopoItem.get(event.args.sopo_id.toString())

  sopoItem.onSale = true
  sopoItem.price = event.args.price.toNumber()

  await sopoItem.save()
}

export async function handleNewOfferEvent(event: MoonbeamEvent<NewOfferEventArgs>): Promise<void> {
  const offer = new Offer(event.args.sopo_id.toString() + '-' + event.args.from + '-' + event.args.price.toNumber())

  offer.sopoId = event.args.sopo_id.toBigInt()
  offer.price = event.args.price.toNumber()
  offer.maker = event.args.from

  await offer.save()
}

// remove listed NFT
export async function handleWithdrawEvent(event: MoonbeamEvent<WithdrawEventArgs>): Promise<void> {
  const sopoItem = await SopoItem.get(event.args.sopo_id.toString())

  if (!sopoItem) {
    return
  }

  await SopoItem.remove(event.args.sopo_id.toString())
}

// const offerId = event.args.sopo_id.toString() + '-' + event.args.to + '-' + event.args

export async function handleSelledEvent(event: MoonbeamEvent<SelledEventArgs>): Promise<void> {
  const sopoItem = await SopoItem.get(event.args.sopo_id.toString())
  const order = new Order(event.transactionHash)

  order.buyer = event.args.to
  order.owner = event.args.owner
  order.contractAddress = event.args.nft_programe_address
  order.tokenId = event.args.nft_id.toBigInt()
  order.sopoId = event.args.sopo_id.toBigInt()

  await order.save()

  if (!sopoItem) {
    return
  }

  await SopoItem.remove(event.args.sopo_id.toString())
}
