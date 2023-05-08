import * as starknet from 'starknet';
import { convertToDecimal, hexToStr } from './utils';
import nftAbi from '../abis/erc721.json';

const provider = new starknet.Provider({
  sequencer: {
    baseUrl: 'https://alpha4.starknet.io',
    feederGatewayUrl: 'feeder_gateway',
    gatewayUrl: 'gateway',
    network: 'goerli-alpha'
  }
});

export type Nft = {
  id: string;
  name: string;
  symbol: string;
  totalSupply: number;
};

export async function newNft(nftAddress: string, mysql): Promise<boolean> {
  const newNft = await loadNft(nftAddress, mysql);
  return !newNft;
}

export async function createNft(nftAddress: string): Promise<Nft> {
  const erc721 = new starknet.Contract(nftAbi, nftAddress, provider);

  const symbol = await erc721.symbol();
  const name = await erc721.name();
  const totalSupply = await erc721.totalSupply();

  return {
    id: nftAddress,
    symbol: hexToStr(symbol.symbol.toString(16)),
    name: hexToStr(name.name.toString(16)),
    totalSupply: totalSupply.totalSupply.low
  };
}

export async function loadNft(nftAddress: string, mysql): Promise<Nft> {
  const nft = await mysql.queryAsync(`SELECT * FROM nftcollections WHERE id = ?`, [nftAddress]);

  return nft[0];
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
