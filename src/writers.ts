
import { getEvent, toAddress } from './utils/utils';
import type { CheckpointWriter } from '@snapshot-labs/checkpoint';
import { createToken, loadToken, newToken, Token } from './utils/token';
import { createAccount, newAccount, Account, loadAccount } from './utils/account';

export async function handleTransfer({
  block,
  tx,
  rawEvent,
  mysql
}: Parameters<CheckpointWriter>[0]) {
  if (!rawEvent) return;
  const format = 'from, to, value(uint256)';
  const data: any = getEvent(rawEvent.data, format);
  let token: Token;
  let account: Account;

  // If token isn't indexed yet we add it, else we load it
  if (await newToken(toAddress(rawEvent.from_address), mysql)) {
    token = await createToken(toAddress(rawEvent.from_address));
    await mysql.queryAsync(`INSERT IGNORE INTO tokens SET '${token}'`);
  } else {
    token = await loadToken(toAddress(rawEvent.from_address), mysql)
  }

  // If account isn't indexed yet we add it, else we load it
  const accountId = token.id + '-' + toAddress(data.from);
  if (await newAccount(accountId, mysql)) {
    account = await createAccount(token, toAddress(data.from));
    await mysql.queryAsync(`INSERT IGNORE INTO tokens SET '${account}'`);
  } else {
    account = await loadAccount(accountId, mysql);
  }

  // Once account is fetched we update it
  
}