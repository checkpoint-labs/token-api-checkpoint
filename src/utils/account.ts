import { Token } from './erc20';
import { Nft } from './erc721';
import { convertToDecimal } from './utils';

export type AccountToken = {
  id: string;
  account: string;
  token: string;
  balance: number;
  rawBalance: bigint;
  modified: number;
  tx: string;
};

export type AccountNft = {
  id: string;
  account: string;
  collection: string;
  tokenId: string;
  balance: number;
  name: string;
  modified: number;
  tx: string;
};

export async function newAccountToken(accountId: string, mysql): Promise<boolean> {
  const newAccount = await loadAccountToken(accountId, mysql);

  return !newAccount;
}

export async function newAccountNft(accountId: string, mysql): Promise<boolean> {
  const newAccount = await loadAccountToken(accountId, mysql);

  return !newAccount;
}

export async function createAccountToken(
  token: Token,
  accountId: string,
  tx,
  block
): Promise<AccountToken> {
  return {
    id: accountId,
    account: accountId.split('-')[1],
    token: token.id,
    balance: convertToDecimal(0, token.decimals),
    rawBalance: BigInt(0),
    modified: block.timestamp / 1000,
    tx: tx.transaction_hash
  };
}

export async function createAccountNft(
  nft: Nft,
  accountId: string,
  tx,
  block
): Promise<AccountNft> {
  return {
    id: accountId,
    account: accountId.split('-')[1],
    collection: nft.id,
    tokenId: nft.id,
    balance: 0,
    name: 'test',
    modified: block.timestamp / 1000,
    tx: tx.transaction_hash
  };
}

export async function loadAccountToken(accountId: string, mysql): Promise<AccountToken> {
  const account: AccountToken = await mysql.queryAsync(`SELECT * FROM accounttokens WHERE id = ?`, [
    accountId
  ]);

  return account[0];
}

export async function loadAccountNft(accountId: string, mysql): Promise<AccountNft> {
  const account: AccountNft = await mysql.queryAsync(`SELECT * FROM accountnfts WHERE id = ?`, [
    accountId
  ]);

  return account[0];
}
