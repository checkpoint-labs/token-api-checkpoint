import * as starknet from 'starknet';
import fs from "fs";
import path from 'path';
import * as tokenAbi from './abis/erc20.json'
import { Token } from './token';
import { BigNumber } from '@ethersproject/bignumber';

const provider = new starknet.Provider()

export type Account = {
    id: string
    account: string
    token: Token
    balance: number
    rawBalance: BigInt
    modified: number
    tx: string
}

export async function newAccount(accountId: string, mysql): Promise<boolean> {
    if (await mysql.queryAsync(`SELECT * FROM accounts WHERE id = '?'`, [accountId]))
      return (false);
    else
      return (true)
}
  
export async function createAccount(token: Token, accountAddress: string): Promise<Account> {
    const accountId = token.id + accountAddress;
    const account: Account = {
        id: accountId,
        account: accountAddress,
        token: token,
        balance: 0,
        rawBalance: BigInt(10),
        modified: 0,
        tx: 'test'
    };
    return (account)
}

export async function loadAccount(accountId: string, mysql) {
   return await mysql.queryAsync(`SELECT * FROM accountTokens WHERE id = '${accountId}'`);
}