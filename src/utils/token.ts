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
  const newToken = await mysql.queryAsync(`SELECT * FROM tokens WHERE id = ?`, [
    tokenAddress
  ]);
  if (newToken.length) return false;
  else return true;
}

export async function createToken(tokenAddress: string): Promise<Token> {
  const tokenAbi = JSON.parse(
    fs.readFileSync(path.join(__dirname, './abis/erc20.json')).toString('ascii')
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
  let token = await mysql.queryAsync(`SELECT * FROM tokens WHERE id = ?`, [
    tokenAddress
  ]);
  return token[0];
}
