import { convertToDecimal } from './utils';
import { AccountToken, AccountNft, Token, NftCollection } from '../../.checkpoint/models';

export async function createAccountToken(
  token: Token,
  accountId: string,
  tx,
  block
): Promise<AccountToken> {
  const account = new AccountToken(accountId);
  account.account = accountId.split('-')[1];
  account.token = token.id;
  account.balance = convertToDecimal(0, token.decimals!);
  account.rawBalance = '0';
  account.modified = block.timestamp / 1000;
  account.tx = tx.transaction_hash;

  return account;
}

export async function createAccountNft(
  nft: NftCollection,
  accountId: string,
  tx,
  block
): Promise<AccountNft> {
  const account = new AccountNft(accountId);
  account.account = accountId.split('-')[1];
  account.collection = nft.id;
  account.tokenId = nft.id;
  account.balance = 0;
  account.name = 'test';
  account.modified = block.timestamp / 1000;
  account.tx = tx.transaction_hash;

  return account;
}