import * as starknet from 'starknet';
import fs from "fs";
import path from 'path';
import * as tokenAbi from './abis/erc20.json'
import { Token } from './token';
import { BigNumber } from '@ethersproject/bignumber';

export type Account = {
    id: string
    account: string
    token: string
    balance: number
    rawBalance: BigInt
    modified: number
    tx: string
}

export async function newAccount(accountId: string, mysql): Promise<boolean> {
    const newAccount = await mysql.queryAsync(`SELECT * FROM accounttokens WHERE id = ?`, [accountId]);
    if (newAccount.length)
      return (false);
    else
      return (true)
}
  
export async function createAccount(token, rawEvent, accountAddress: string, tx, block): Promise<Account> {
    const accountId = rawEvent.from_address + '-' + accountAddress;
    const account: Account = {
        id: accountId,
        account: accountAddress,
        token: rawEvent.from_address,
        balance: 10,
        rawBalance: BigInt(rawEvent.data[2]),
        modified: block.timestamp / 1000,
        tx: tx.transaction_hash
    };
    return (account)
}

export async function loadAccount(accountId: string, mysql) {
   return await mysql.queryAsync(`SELECT * FROM accountTokens WHERE id = ${accountId}`);
}