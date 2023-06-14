import * as starknet from 'starknet';
import { convertToDecimal, hexToStr } from './utils';
import nftAbi from '../abis/erc721.json';
import { NftCollection } from '../../.checkpoint/models';

const provider = new starknet.Provider({
  sequencer: {
    baseUrl: 'https://alpha4.starknet.io',
    feederGatewayUrl: 'feeder_gateway',
    gatewayUrl: 'gateway',
    network: 'goerli-alpha'
  }
});

export async function createNft(nftAddress: string): Promise<NftCollection> {
  const erc721 = new starknet.Contract(nftAbi, nftAddress, provider);

  const symbol = await erc721.symbol();
  const name = await erc721.name();
  const totalSupply = await erc721.totalSupply();

  let nft = new NftCollection(nftAddress);
  nft.symbol = hexToStr(symbol.symbol.toString(16));
  nft.name = hexToStr(name.name.toString(16));
  nft.totalSupply = totalSupply.totalSupply.low;

  return nft;

}

export async function isErc721(address: string, block_number: number) {
  const desiredFunctions = ['tokenURI', 'name', 'totalSupply'];
  const undesiredFunctions = ['none'];

  const classHash = await provider.getClassHashAt(address, block_number);
  const contractClass = await provider.getClassByHash(classHash);

  const hasFunctions = desiredFunctions.every(func =>
    contractClass.abi?.find(nft => nft.name === func && nft.type === 'function')
  );
  const hasNoFunctions = undesiredFunctions.every(
    func => !contractClass.abi?.find(nft => nft.name === func && nft.type === 'function')
  );

  const result = hasFunctions && hasNoFunctions;
  console.log(
    result,
    `Erc721 smart contract ${result ? 'matches' : "doesn't match"} desired functions`
  );

  return result;
}
