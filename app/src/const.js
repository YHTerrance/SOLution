import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const BASE_FEE_LAMPORTS = LAMPORTS_PER_SOL / 1000;

export { BASE_FEE_LAMPORTS };

export const FILTER = {
  discriminator_length: 8,
  public_key_length: 32,
  timestamp_length: 8,
  string_length_prefix: 4,
  max_topic_length: 50 * 4,
  max_content_length: 280 * 4,
  amount_length: 8,
  bool_length: 1,
};
