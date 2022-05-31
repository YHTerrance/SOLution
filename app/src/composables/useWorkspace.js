import { computed, watchEffect, ref } from "vue";
import { useAnchorWallet } from "solana-wallets-vue";
import { Connection, PublicKey } from "@solana/web3.js";
import { Provider, Program } from "@project-serum/anchor";
// import { OCR2Feed } from "@chainlink/solana-sdk";

import idl from "@/idl/so_lution.json";
import { OCR2Feed } from "@chainlink/solana-sdk";

const clusterUrl = process.env.VUE_APP_CLUSTER_URL;
const preflightCommitment = "processed";
const commitment = "processed";
const programID = new PublicKey(idl.metadata.address);

let workspace = null;

export const useWorkspace = () => workspace;

export const initWorkspace = async () => {
  const wallet = useAnchorWallet();
  const connection = new Connection(clusterUrl, commitment);
  const provider = computed(
    () =>
      new Provider(connection, wallet.value, {
        preflightCommitment,
        commitment,
      })
  );

  const program = computed(() => new Program(idl, programID, provider.value));

  // Chainlink pricefeed for SOL
  const CHAINLINK_FEED_ADDRESS = "HgTtcbcmp5BeThax5AU8vg4VwK79qAvAKKFMs8txMLW6";

  const CHAINLINK_PROGRAM_ID = new PublicKey(
    "cjg3oHmg9uuPsP8D6g29NWvhySJkdYdAo9D25PRbKXJ"
  );
  const feedAddress = new PublicKey(CHAINLINK_FEED_ADDRESS); //ETH-USD Devnet

  //load the data feed account
  let SOLPrice = ref(null);

  async function loadListener() {
    try {
      let dataFeed = await OCR2Feed.load(CHAINLINK_PROGRAM_ID, provider.value);

      //listen for events agains the price feed, and grab the latest rounds price data
      dataFeed.onRound(feedAddress, (event) => {
        // console.log(event.answer.toNumber());
        SOLPrice.value = event.answer.toNumber();
      });
    } catch (error) {
      console.log(error);
    }
  }

  watchEffect(loadListener);

  workspace = {
    wallet,
    connection,
    provider,
    program,
    SOLPrice,
  };
};
