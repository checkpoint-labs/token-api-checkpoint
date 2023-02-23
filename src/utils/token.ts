import * as starknet from 'starknet';
import fs from 'fs';
import path from 'path';
import { hexToStr } from './utils';

const provider = new starknet.Provider({
  sequencer: {
    baseUrl: 'https://alpha4.starknet.io',
    feederGatewayUrl: 'feeder_gateway',
    gatewayUrl: 'gateway',
    network: 'goerli-alpha'
  }
});

export type Token = {
  id: string;
  decimals: number;
  name: string;
  symbol: string;
  totalSupply: bigint;
};

export async function newToken(tokenAddress: string, mysql): Promise<boolean> {
  const newToken = await mysql.queryAsync(`SELECT * FROM tokens WHERE id = ?`, [tokenAddress]);
  if (newToken.length) return false;
  else return true;
}

export async function createToken(tokenAddress: string): Promise<Token> {
  const tokenAbi = JSON.parse(
    fs.readFileSync(path.join(__dirname, './contracts/abis/erc20.json')).toString('ascii')
  );
  const erc20 = new starknet.Contract(tokenAbi, tokenAddress, provider);
  const symbol = await erc20.symbol();
  const name = await erc20.name();
  const decimals = await erc20.decimals();
  const totalSupply = await erc20.totalSupply();

  const metadata: Token = {
    id: tokenAddress,
    symbol: hexToStr(symbol.res.toString(16)),
    name: hexToStr(name.res.toString(16)),
    decimals: decimals.res.toNumber(),
    totalSupply: BigInt(parseInt(totalSupply.res.low.toString(16), 16))
  };
  return metadata;
}

export async function loadToken(tokenAddress: string, mysql): Promise<Token> {
  let token = await mysql.queryAsync(`SELECT * FROM tokens WHERE id = ?`, [tokenAddress]);
  return token[0];
}

export async function isErc20(address: string, block_number) {
  const desiredFunctions = [
    'name',
    'decimals',
    'totalSupply',
    'balanceOf',
    'transfer',
    'transferFrom',
    'approve',
    'allowance'
  ];
  const undesiredFunctions = ['tokenURI'];

  const classHash = await provider.getClassHashAt(address, block_number);
  const contractClass = await provider.getClassByHash(classHash);

  const hasAllDesiredFunctions = desiredFunctions.every(func =>
    contractClass.abi?.find(token => token.name === func && token.type === 'function')
  );
  const hasNoUndesiredFunctions = undesiredFunctions.every(
    func => !contractClass.abi?.find(token => token.name === func && token.type === 'function')
  );

  const result = hasAllDesiredFunctions && hasNoUndesiredFunctions;
  console.log(result, `Smart contract ${result ? 'matches' : "doesn't match"} desired functions`);
  return result;
}
