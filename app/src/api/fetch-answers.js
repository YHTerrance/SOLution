import { useWorkspace } from "@/composables";
import { Answer } from "@/models";
import { FILTER } from "@/const";
import { BN } from "@project-serum/anchor";
import * as bs58 from "bs58";

export const fetchAnswers = async (filters = []) => {
  const { program } = useWorkspace();
  const answers = await program.value.account.answer.all(filters);
  return answers.map((answer) => new Answer(answer.publicKey, answer.account));
};

export const targetQuestionFilter = (targetQuestionBase58PublicKey) => ({
  memcmp: {
    offset:
      FILTER.discriminator_length + // Discriminator
      FILTER.public_key_length + // Author
      FILTER.timestamp_length + // timestamp
      FILTER.bool_length, // isSolution
    bytes: targetQuestionBase58PublicKey,
  },
});

export const answerAuthorFilter = (authorBase58PublicKey) => ({
  memcmp: {
    offset: FILTER.discriminator_length, // Discriminator
    bytes: authorBase58PublicKey,
  },
});

export const isSolutionFilter = () => ({
  memcmp: {
    offset:
      8 + // Discriminator.
      32 + // Author public key.
      8, // Timestamp.
    bytes: bs58.encode(new BN(1, "le").toArray()),
  },
});
