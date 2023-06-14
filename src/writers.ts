import type { CheckpointWriter } from '@snapshot-labs/checkpoint';
import { convertToDecimal, getEvent } from './utils/utils';
import { createToken, isErc20 } from './utils/erc20';
import { createAccountToken, createAccountNft } from './utils/account';
import { createNft, isErc721 } from './utils/erc721';
import { AccountToken, AccountNft, Token, NftCollection } from '../.checkpoint/models';

export async function handleTransfer({ block, tx, rawEvent }: Parameters<CheckpointWriter>[0]) {
  if (!rawEvent || !block) return;

  if (await isErc20(rawEvent.from_address, block.block_number)) {
    const format = 'from, to, value(uint256)';
    const data: any = getEvent(rawEvent.data, format);

    let token = await Token.loadEntity(rawEvent.from_address) ? await createToken(rawEvent.from_address) : await Token.loadEntity(rawEvent.from_address);
    if (!token || !data) return;

    const fromId = `${token.id.slice(2)}-${data.from.slice(2)}`;
    let fromAccount = new AccountToken(fromId) ? await createAccountToken(token, fromId, tx, block) : await AccountToken.loadEntity(fromId);

    const toId = `${token.id.slice(2)}-${data.to.slice(2)}`;
    let toAccount = new AccountToken(toId) ? await createAccountToken(token, toId, tx, block) : await AccountToken.loadEntity(toId);

    if (!fromAccount || !toAccount) return;

    fromAccount.balance! -= convertToDecimal(data.value, token.decimals || 0);
    toAccount.balance! += convertToDecimal(data.value, token.decimals || 0);

    fromAccount.rawBalance = (BigInt(fromAccount.rawBalance || "0") - BigInt(data.value)).toString();
    toAccount.rawBalance = (BigInt(toAccount.rawBalance || "0") + BigInt(data.value)).toString();

    fromAccount.modified = block.timestamp;
    toAccount.modified = block.timestamp;

    fromAccount.tx = tx.transaction_hash || '';
    toAccount.tx = tx.transaction_hash || '';

    await fromAccount.save();
    await toAccount.save();
  } 
  else if (await isErc721(rawEvent.from_address, block.block_number)) {
    const format = 'from, to, value(uint256)';
    const data: any = getEvent(rawEvent.data, format);

    let nft = new NftCollection(rawEvent.from_address) ? await createNft(rawEvent.from_address) : await NftCollection.loadEntity(rawEvent.from_address);
    if (!nft || !data) return;

    const fromId = `${nft.id.slice(2)}-${data.from.slice(2)}`;
    let fromAccount = new AccountNft(fromId) ? await createAccountNft(nft, fromId, tx, block) : await AccountNft.loadEntity(fromId);

    const toId = `${nft.id.slice(2)}-${data.to.slice(2)}`;
    let toAccount = new AccountNft(toId) ? await createAccountNft(nft, toId, tx, block) : await AccountNft.loadEntity(toId);

    if (!fromAccount || !toAccount) return;

    fromAccount.balance! -= data.value;
    toAccount.balance += data.value;

    fromAccount.modified = block.timestamp;
    toAccount.modified = block.timestamp;

    fromAccount.tx = tx.transaction_hash || '';
    toAccount.tx = tx.transaction_hash || '';

    await fromAccount.save();
    await toAccount.save();
  }
}
