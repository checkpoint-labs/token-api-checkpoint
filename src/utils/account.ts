import * as starknet from 'starknet';
import fs from 'fs';
import path from 'path';
import { Token } from './token';
import { BigNumber } from '@ethersproject/bignumber';
import { convertToDecimal, hexToStr } from './utils';

const provider = new starknet.Provider({
  sequencer: {
    baseUrl: 'https://alpha4.starknet.io',
    feederGatewayUrl: 'feeder_gateway',
    gatewayUrl: 'gateway',
    network: 'goerli-alpha'
  }
});

export type Account = {
  id: string;
  account: string;
  token: string;
  balance: number;
  // rawBalance: bigint;
  modified: number;
  tx: string;
};

export async function newAccount(accountId: string, mysql): Promise<boolean> {
  const newAccount = await mysql.queryAsync(`SELECT * FROM accounttokens WHERE id = ?`, [
    accountId
  ]);
  if (newAccount.length) return false;
  else return true;
}

export async function createAccount(
  token: Token,
  accountAddress: string,
  tx,
  block
): Promise<Account> {
  const accountId = token.id + '-' + accountAddress;
  const account: Account = {
    id: accountId,
    account: accountAddress,
    token: token.id,
    balance: convertToDecimal(0, token.decimals),
    // rawBalance: balance.res.low,
    modified: block.timestamp / 1000,
    tx: tx.transaction_hash
  };
  return account;
}

export async function loadAccount(accountId: string, mysql) {
  let account = await mysql.queryAsync(`SELECT * FROM accounttokens WHERE id = ${accountId}`);
  return account[0];
}
