
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
  console.log(rawEvent.data[2])
  const format = 'from, to, value(uint256)';
  const data: any = getEvent(rawEvent.data, format);
  let token: Token;
  let fromAccount: Account;
  let toAccount: Account;

  // If token isn't indexed yet we add it, else we load it
  if (await newToken(toAddress(rawEvent.from_address), mysql)) {
    token = await createToken(toAddress(rawEvent.from_address));
    await mysql.queryAsync(`INSERT IGNORE INTO tokens SET ?`, [token]);
  } else {
    token = await loadToken(toAddress(rawEvent.from_address), mysql)
  }


  // If accounts aren't indexed yet we add them, else we load them
  // First with fromAccount
  const fromId = token.id + '-' + toAddress(data.from);
  if (await newAccount(fromId, mysql)) {
    fromAccount = await createAccount(token, rawEvent, toAddress(data.from), tx, block);
    await mysql.queryAsync(`INSERT IGNORE INTO accounttokens SET ?`, [fromAccount]);
  } else {
    fromAccount = await loadAccount(fromId, mysql);
  }
  // Then with toAccount
  const toId = token.id + '-' + toAddress(data.to);
  if (await newAccount(toId, mysql)) {
    toAccount = await createAccount(token, rawEvent, toAddress(data.to), tx, block);
    await mysql.queryAsync(`INSERT IGNORE INTO accounttokens SET ?`, [toAccount]);
  } else {
    toAccount = await loadAccount(toId, mysql);
  }

  // Updating balances
  fromAccount.balance -= data.value
  toAccount.balance += data.value;
  // Updating raw balances
  fromAccount.rawBalance -= data.value
  toAccount.rawBalance += data.value;
  // Updating modified field
  fromAccount.modified = block.timestamp;
  toAccount.modified = block.timestamp;
  // Updating tx field
  fromAccount.tx = tx.transaction_hash!;
  toAccount.tx = tx.transaction_hash!;

  // Indexing accounts

}