import { web3 } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";
import { Answer } from "@/models";

export const submitAnswer = async (targetQuestionBase58PublicKey, content) => {
  const { wallet, program } = useWorkspace();

  const answer = web3.Keypair.generate();

  await program.value.rpc.submitAnswer(targetQuestionBase58PublicKey, content, {
    accounts: {
      author: wallet.value.publicKey,
      answer: answer.publicKey,
      systemProgram: web3.SystemProgram.programId,
    },
    signers: [answer],
  });

  const answerAccount = await program.value.account.answer.fetch(
    answer.publicKey
  );

  return new Answer(answer.publicKey, answerAccount);
};
