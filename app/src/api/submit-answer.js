import { web3 } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";
import { Answer } from "@/models";
import { pollConfirmation } from "./utils";

export const submitAnswer = async (
  targetQuestionPublicKey,
  targetAuthorPublicKey,
  content,
  ticks
) => {
  const { wallet, program, connection } = useWorkspace();

  const answer = web3.Keypair.generate();

  console.log("Submitting targetAuthorPublicKey", targetAuthorPublicKey);

  const signature = await program.value.rpc.submitAnswer(
    targetQuestionPublicKey,
    targetAuthorPublicKey,
    content,
    {
      accounts: {
        author: wallet.value.publicKey,
        answer: answer.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [answer],
    }
  );
  await pollConfirmation(connection, signature, ticks);

  const answerAccount = await program.value.account.answer.fetch(
    answer.publicKey
  );

  return new Answer(answer.publicKey, answerAccount);
};
