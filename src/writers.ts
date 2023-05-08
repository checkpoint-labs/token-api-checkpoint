import type { CheckpointWriter } from '@snapshot-labs/checkpoint';
import { convertToDecimal, getEvent } from './utils/utils';
import { createToken, isErc20, loadToken, newToken, Token } from './utils/erc20';
import {
  createAccountToken,
  createAccountNft,
  newAccountNft,
  AccountToken,
  newAccountToken,
  loadAccountToken,
  AccountNft,
  loadAccountNft
} from './utils/account';
import { createNft, isErc721, loadNft, newNft, Nft } from './utils/erc721';

export async function handleTransfer({
  block,
  tx,
  rawEvent,
  mysql
}: Parameters<CheckpointWriter>[0]) {
  if (!rawEvent) return;

  // We check if it's an erc20/erc721
  if (await isErc20(rawEvent.from_address, block.block_number)) {
    const format = 'from, to, value(uint256)';
    const data: any = getEvent(rawEvent.data, format);
    let token: Token;
    let fromAccount: AccountToken;
    let toAccount: AccountToken;

    // If token isn't indexed yet we add it, else we load it
    if (await newToken(rawEvent.from_address, mysql)) {
      token = await createToken(rawEvent.from_address);
      await mysql.queryAsync(`INSERT IGNORE INTO tokens SET ?`, [token]);
    } else {
      token = await loadToken(rawEvent.from_address, mysql);
    }

    // If accounts aren't indexed yet we add them, else we load them
    // First with fromAccount
    const fromId = `${token.id.slice(2)}-${data.from.slice(2)}`;
    if (await newAccountToken(fromId, mysql)) {
      fromAccount = await createAccountToken(token, fromId, tx, block);
      await mysql.queryAsync(`INSERT IGNORE INTO accounttokens SET ?`, [fromAccount]);
    } else {
      fromAccount = await loadAccountToken(fromId, mysql);
    }

    // Then with toAccount
    const toId = `${token.id.slice(2)}-${data.to.slice(2)}`;
    if (await newAccountToken(toId, mysql)) {
      toAccount = await createAccountToken(token, toId, tx, block);
      await mysql.queryAsync(`INSERT IGNORE INTO accounttokens SET ?`, [toAccount]);
    } else {
      toAccount = await loadAccountToken(toId, mysql);
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
    fromAccount.tx = tx.transaction_hash || '';
    toAccount.tx = tx.transaction_hash || '';

    // Indexing accounts
    await mysql.queryAsync(
      `UPDATE accounttokens SET balance=${
        fromAccount.balance
      }, rawBalance=${fromAccount.rawBalance.toString()}, modified=${fromAccount.modified}, tx='${
        fromAccount.tx
      }' WHERE id='${fromAccount.id}'`
    );
    await mysql.queryAsync(
      `UPDATE accounttokens SET balance=${
        toAccount.balance
      }, rawBalance=${toAccount.rawBalance.toString()}, modified=${toAccount.modified}, tx='${
        toAccount.tx
      }' WHERE id='${toAccount.id}'`
    );
  } else if (await isErc721(rawEvent.from_address, block.block_number)) {
    const format = 'from, to, value(uint256)';
    const data: any = getEvent(rawEvent.data, format);
    let nft: Nft;
    let fromAccount: AccountNft;
    let toAccount: AccountNft;

    // If nft isn't indexed yet we add it, else we load it
    if (await newNft(rawEvent.from_address, mysql)) {
      nft = await createNft(rawEvent.from_address);
      console.log(nft);
      await mysql.queryAsync(`INSERT IGNORE INTO nftcollections SET ?`, [nft]);
    } else {
      nft = await loadNft(rawEvent.from_address, mysql);
    }

    // If accounts aren't indexed yet we add them, else we load them
    // First with fromAccount
    const fromId = `${nft.id.slice(2)}-${data.from.slice(2)}`;
    if (await newAccountNft(fromId, mysql)) {
      fromAccount = await createAccountNft(nft, fromId, tx, block);
      await mysql.queryAsync(`INSERT IGNORE INTO accountnfts SET ?`, [fromAccount]);
    } else {
      fromAccount = await loadAccountNft(fromId, mysql);
    }

    // Then with toAccount
    const toId = `${nft.id.slice(2)}-${data.to.slice(2)}`;
    if (await newAccountNft(toId, mysql)) {
      toAccount = await createAccountNft(nft, toId, tx, block);
      await mysql.queryAsync(`INSERT IGNORE INTO accountnfts SET ?`, [toAccount]);
    } else {
      toAccount = await loadAccountNft(toId, mysql);
    }

    // Updating balances
    console.log(data.value);
    fromAccount.balance -= data.value;
    toAccount.balance += data.value;
    // Updating modified field
    fromAccount.modified = block.timestamp;
    toAccount.modified = block.timestamp;
    // Updating tx field
    fromAccount.tx = tx.transaction_hash || '';
    toAccount.tx = tx.transaction_hash || '';

    // Indexing accounts
    await mysql.queryAsync(
      `UPDATE accountnfts SET balance=${fromAccount.balance}, modified=${fromAccount.modified}, tx='${fromAccount.tx}' WHERE id='${fromAccount.id}'`
    );
    await mysql.queryAsync(
      `UPDATE accountnfts SET balance=${toAccount.balance}, modified=${toAccount.modified}, tx='${toAccount.tx}' WHERE id='${toAccount.id}'`
    );
  }
}
