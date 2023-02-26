import { convertToDecimal, getEvent, hexToStr, toAddress } from './utils/utils';
import type { CheckpointWriter } from '@snapshot-labs/checkpoint';
import { createToken, isErc20, loadToken, newToken, Token } from './utils/token';
import { createAccount, newAccount, Account, loadAccount } from './utils/account';

export async function handleTransfer({
  block,
  tx,
  rawEvent,
  mysql
}: Parameters<CheckpointWriter>[0]) {
  if (!rawEvent) return;
  if (!(await isErc20(rawEvent.from_address, block.block_number))) return;
  const format = 'from, to, value(uint256)';
  const data: any = getEvent(rawEvent.data, format);
  let token: Token;
  let fromAccount: Account;
  let toAccount: Account;

  // If token isn't indexed yet we add it, else we load it
  if (await newToken(rawEvent.from_address, mysql)) {
    token = await createToken(rawEvent.from_address);
    await mysql.queryAsync(`INSERT IGNORE INTO tokens SET ?`, [token]);
  } else {
    token = await loadToken(rawEvent.from_address, mysql);
  }

  // If accounts aren't indexed yet we add them, else we load them
  // First with fromAccount
  const fromId: string = (token.id).slice(2) + '-' + (data.from).slice(2);
  if (await newAccount(fromId, mysql)) {
    fromAccount = await createAccount(token, fromId, tx, block);
    await mysql.queryAsync(`INSERT IGNORE INTO accounttokens SET ?`, [fromAccount]);
  } else {
    fromAccount = await loadAccount(fromId, mysql);
  }

  // Then with toAccount
  const toId: string = (token.id).slice(2) + '-' + (data.to).slice(2);
  if (await newAccount(toId, mysql)) {
    toAccount = await createAccount(token, toId, tx, block);
    await mysql.queryAsync(`INSERT IGNORE INTO accounttokens SET ?`, [toAccount]);
  } else {
    toAccount = await loadAccount(toId, mysql);
  }

  // Updating balances
  fromAccount.balance -= convertToDecimal(data.value, token.decimals);
  toAccount.balance += convertToDecimal(data.value, token.decimals);
  // Updating raw balances
  fromAccount.rawBalance = BigInt(fromAccount.rawBalance) - BigInt(data.value);
  toAccount.rawBalance = BigInt(toAccount.rawBalance) + BigInt(data.value);
  // Updating modified field
  fromAccount.modified = block.timestamp;
  toAccount.modified = block.timestamp;
  // Updating tx field
  fromAccount.tx = tx.transaction_hash!;
  toAccount.tx = tx.transaction_hash!;

  // Indexing accounts
  await mysql.queryAsync(`UPDATE accounttokens SET balance=${fromAccount.balance}, rawBalance=${fromAccount.rawBalance.toString()}, modified=${fromAccount.modified}, tx='${fromAccount.tx}' WHERE id='${fromAccount.id}'`);
  await mysql.queryAsync(`UPDATE accounttokens SET balance=${toAccount.balance}, rawBalance=${toAccount.rawBalance.toString()}, modified=${toAccount.modified}, tx='${toAccount.tx}' WHERE id='${toAccount.id}'`);
}
