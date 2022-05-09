# SOLution

# Important !!

When developing this project, please follow the following best practice.

* Backend (Smart Contract): Should follow the test-driven approach. Write tests and make sure all the tests pass.
* Frontend: If you are unfamiliar with Vue, follow this [tutorial](https://vuejs.org/tutorial/#step-1). Note that the project is developed using **composition** and **SFC**.

Main reference tutorial: [Link](https://lorisleiva.com/create-a-solana-dapp-from-scratch)

[Demo Link](http://solution-solana-webapp.s3-website-us-west-2.amazonaws.com/#/)

## Project Structure

-   **`app/`**: frontend Vuejs application
-   **`programs/`**: Rust backend smart contract
-   **`target/`**: target directory for deployment, generated after `anchor build`
    -   **`target/deploy/so_lution-keypair.json`**: private key that proves you own the contract
    -   **`target/idl/so_lution.json`**: interface description (used to specify the interface between frontend and backend, like a schema)
-   **`tests/`**: tests that is run against the Rust backend
-   **`Anchor.toml`**: main configuration file for Anchor

## Development Cycle

```bash
# Make sure you’re on the localnet.
solana config set --url localhost
# And check your Anchor.toml file.

# Code…

# Run the tests. (builds, deploys, tests all at once)
anchor test

# Build, deploy and start a local ledger.
anchor localnet
# Or

# -r resets the validator to genesis (or it will preload from test-ledger/)
solana-test-validator [-r]
anchor build
anchor deploy

# Run tests on the created local server to generate dummy data (Note that it will probably fail if your validator is not freshly created)
anchor run test


# Copy the new IDL to the frontend.
anchor run copy-idl

# Serve your frontend application locally.
yarn run serve

# Switch to the devnet cluster to deploy there.
solana config set --url devnet
# And update your Anchor.toml file.

# Airdrop yourself some money if necessary. (Do this multiple times likely need 2 ~ 4)
solana airdrop 2

# Build and deploy to devnet.
anchor build
anchor deploy

# Push your code to the main branch to auto-deploy on AWS S3.
git push
```

## Useful Documentation

-   [@project-serum/anchor](https://github.com/project-serum/anchor)
