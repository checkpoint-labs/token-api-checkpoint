import { Model } from '@snapshot-labs/checkpoint';

export class AccountToken extends Model {
  static tableName = 'accounttokens';

  constructor(id: string) {
    super(AccountToken.tableName);

    this.initialSet('id', id);
    this.initialSet('account', null);
    this.initialSet('token', null);
    this.initialSet('balance', null);
    this.initialSet('rawBalance', null);
    this.initialSet('modified', null);
    this.initialSet('tx', null);
  }

  static async loadEntity(id: string): Promise<AccountToken | null> {
    const entity = await super.loadEntity(AccountToken.tableName, id);
    if (!entity) return null;

    const model = new AccountToken(id);
    model.setExists();

    for (const key in entity) {
      model.set(key, entity[key]);
    }

    return model;
  }

  get id(): string {
    return this.get('id');
  }

  set id(value: string) {
    this.set('id', value);
  }

  get account(): string | null {
    return this.get('account');
  }

  set account(value: string | null) {
    this.set('account', value);
  }

  get token(): string | null {
    return this.get('token');
  }

  set token(value: string | null) {
    this.set('token', value);
  }

  get balance(): number | null {
    return this.get('balance');
  }

  set balance(value: number | null) {
    this.set('balance', value);
  }

  get rawBalance(): string | null {
    return this.get('rawBalance');
  }

  set rawBalance(value: string | null) {
    this.set('rawBalance', value);
  }

  get modified(): number | null {
    return this.get('modified');
  }

  set modified(value: number | null) {
    this.set('modified', value);
  }

  get tx(): string | null {
    return this.get('tx');
  }

  set tx(value: string | null) {
    this.set('tx', value);
  }
}

export class AccountNft extends Model {
  static tableName = 'accountnfts';

  constructor(id: string) {
    super(AccountNft.tableName);

    this.initialSet('id', id);
    this.initialSet('account', null);
    this.initialSet('collection', null);
    this.initialSet('tokenId', null);
    this.initialSet('balance', null);
    this.initialSet('name', null);
    this.initialSet('modified', null);
    this.initialSet('tx', null);
  }

  static async loadEntity(id: string): Promise<AccountNft | null> {
    const entity = await super.loadEntity(AccountNft.tableName, id);
    if (!entity) return null;

    const model = new AccountNft(id);
    model.setExists();

    for (const key in entity) {
      model.set(key, entity[key]);
    }

    return model;
  }

  get id(): string {
    return this.get('id');
  }

  set id(value: string) {
    this.set('id', value);
  }

  get account(): string | null {
    return this.get('account');
  }

  set account(value: string | null) {
    this.set('account', value);
  }

  get collection(): string | null {
    return this.get('collection');
  }

  set collection(value: string | null) {
    this.set('collection', value);
  }

  get tokenId(): string | null {
    return this.get('tokenId');
  }

  set tokenId(value: string | null) {
    this.set('tokenId', value);
  }

  get balance(): number | null {
    return this.get('balance');
  }

  set balance(value: number | null) {
    this.set('balance', value);
  }

  get name(): string | null {
    return this.get('name');
  }

  set name(value: string | null) {
    this.set('name', value);
  }

  get modified(): number | null {
    return this.get('modified');
  }

  set modified(value: number | null) {
    this.set('modified', value);
  }

  get tx(): string | null {
    return this.get('tx');
  }

  set tx(value: string | null) {
    this.set('tx', value);
  }
}

export class Token extends Model {
  static tableName = 'tokens';

  constructor(id: string) {
    super(Token.tableName);

    this.initialSet('id', id);
    this.initialSet('decimals', null);
    this.initialSet('name', null);
    this.initialSet('symbol', null);
    this.initialSet('totalSupply', null);
  }

  static async loadEntity(id: string): Promise<Token | null> {
    const entity = await super.loadEntity(Token.tableName, id);
    if (!entity) return null;

    const model = new Token(id);
    model.setExists();

    for (const key in entity) {
      model.set(key, entity[key]);
    }

    return model;
  }

  get id(): string {
    return this.get('id');
  }

  set id(value: string) {
    this.set('id', value);
  }

  get decimals(): number | null {
    return this.get('decimals');
  }

  set decimals(value: number | null) {
    this.set('decimals', value);
  }

  get name(): string | null {
    return this.get('name');
  }

  set name(value: string | null) {
    this.set('name', value);
  }

  get symbol(): string | null {
    return this.get('symbol');
  }

  set symbol(value: string | null) {
    this.set('symbol', value);
  }

  get totalSupply(): bigint | null {
    return this.get('totalSupply');
  }

  set totalSupply(value: bigint | null) {
    this.set('totalSupply', value);
  }
}

export class NftCollection extends Model {
  static tableName = 'nftcollections';

  constructor(id: string) {
    super(NftCollection.tableName);

    this.initialSet('id', id);
    this.initialSet('name', null);
    this.initialSet('symbol', null);
    this.initialSet('totalSupply', null);
  }

  static async loadEntity(id: string): Promise<NftCollection | null> {
    const entity = await super.loadEntity(NftCollection.tableName, id);
    if (!entity) return null;

    const model = new NftCollection(id);
    model.setExists();

    for (const key in entity) {
      model.set(key, entity[key]);
    }

    return model;
  }

  get id(): string {
    return this.get('id');
  }

  set id(value: string) {
    this.set('id', value);
  }

  get name(): string | null {
    return this.get('name');
  }

  set name(value: string | null) {
    this.set('name', value);
  }

  get symbol(): string | null {
    return this.get('symbol');
  }

  set symbol(value: string | null) {
    this.set('symbol', value);
  }

  get totalSupply(): number | null {
    return this.get('totalSupply');
  }

  set totalSupply(value: number | null) {
    this.set('totalSupply', value);
  }
}
