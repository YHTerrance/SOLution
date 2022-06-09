# SOLution

<p align="center">
  <img src="./app/public/android-chrome-192x192.png" />
</p>

## Concept

Our goal is to create a place for people to ask questions and get valuable answers incentivized by novel business model of answer-to-earn a.k.a. Answer-to-Earn. You are welcome to use markdown or Latex to ask your questions too!

What you can do:

* Ask Questions: You need to pay for the rent, the base fee and the reward fee for each question you asked. The base fee will be returned to you later and the reward fee will be given to the best answer.

* Answer: You can submit the answer in the question's thread with the rent.

* Earn:
  * If you are the asker, you can select the best answer as the solution and **retrieve the base fee**.
  * If you are the answerer and your answer is selected as the solution, you can **earn the reward** from the asker. However, don't worry about your answer not being selected, you can delete your answer to get back the rent.

<p align="center">
<img src="https://assets.akaswap.com/ipfs/QmWcdx2MKkDnPEPdopRnTih1DpgykNt3N3xea7PFVevX1T" alt="poster" width="500"/>
</p>

### Demo Video

[![SOLution Demo Video](./assets/Screenshot.png)](https://www.youtube.com/watch?v=eipn0sjSXEc)

## Play with the app

1. Install your wallet for Solana (Phantom or Solflare Supported).
2. Airdrop yourself from SOL using `solana-cli` or [Sol Faucet](solfaucet.com).
3. Enjoy the app! ([Demo Link](http://solution-solana-webapp.s3-website-us-west-2.amazonaws.com/#/)).

## Important: Before you start

Please follow the following best practice for all development on this project.

- Backend (Smart Contract): Should follow the test-driven approach. Write tests and make sure all the tests pass.
- Frontend: If you are unfamiliar with Vue, follow this [tutorial](https://vuejs.org/tutorial/#step-1). Note that the project is developed using **composition** and **SFC**.

## Project Structure

* **`app/`**: frontend Vuejs application
* **`programs/`**: Rust backend smart contract
* **`target/`**: target directory for deployment, generated after `anchor build`
  * **`target/deploy/so_lution-keypair.json`**: the private key that proves you own the contract
  * **`target/idl/so_lution.json`**: an interface description language file used to specify the interface between frontend and backend, like a schema
* **`tests/`**: tests that are run against the Rust backend
* **`Anchor.toml`**: the main configuration file for Anchor

## Resources

* [Private Developer Docs](https://hackmd.io/vNTooMzwQ_uJdSPPijLu0w)
* [Create a Solana Dapp from scratch](https://lorisleiva.com/create-a-solana-dapp-from-scratch)
* [Anchor Book](https://book.anchor-lang.com/introduction/introduction.html)
* [Solana Cookbook](https://solanacookbook.com/#contributing)
* [Anchor Related Documentation](https://github.com/project-serum/anchor)
* [Soldev Tutorials](https://soldev.app/library/tutorials)
* [Solana Official Docs](https://docs.solana.com)

## Development Cycle

```bash
# Make sure you’re on the localnet.
solana config set --url localhost
# And check your Anchor.toml file. (check keypair path and network of use)

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

# Push your code to the remote repository.
git push
```
