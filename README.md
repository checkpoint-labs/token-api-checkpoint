# StarkNet token api

This repo is a [Checkpoint](https://checkpoint.fyi) template that allows to retrieve all token holders from StarkNet using the `global_events` feature available since the `v^0.1.0-beta.14` of Checkpoint.

## Getting started

Create a copy of this repository by clicking **'Use this template'** button or clicking [this
link](https://github.com/snapshot-labs/token-api-checkpoint/generate).

**Requirements**

- Node.js (>= 16.x.x)
- Docker with `docker-compose`
- Yarn

> You can also use npm, just make sure to replace the subsequent 'yarn' commands with their npm equivalent.

After cloning this project, run the following command to install dependencies:

```bash
yarn # or 'npm install'
```

Next, you'll need a MySQL server running and a connection string available as environment variable `DATABASE_URL`.
You can use `docker-compose` to set up default MySQL server in container:

```bash
docker-compose up -d
```

> For local development, you can create a .env file from the .env.example file and the application will read the values on startup.

Next, start up the server:

```bash
yarn dev # for local development or else `yarn start` for production build.
```

This will expose a GraphQL API endpoint locally at http://localhost:3000. You can easily interact with this endpoint using the graphiql interface by visiting http://localhost:3000 in your browser.

To fetch a list of Account's and their holdings try the following query:

```graphql
query {
  accounttokens {
    id
    account
    token {
      id
      name
      symbol
      decimals
      totalSupply
    }
    balance
    rawBalance
    modified
    tx
  }
}
```

To learn more about the different ways you can query the GraphQL API, visit the Checkpoint documentation [here](https://docs.checkpoint.fyi/).

## Test it

After starting the indexer locally on port `3000`. You can use [this](https://checkpoint-token-api-ui.vercel.app/) deployed user interface to test it. Try with your account or with some whales from [Starkscan](https://starkscan.co/accounts).

## License

MIT
