import { useWorkspace } from "@/composables";

export const selectSolution = async (question, answerPublicKey) => {
  const { wallet, program } = useWorkspace();
  await program.value.rpc.selectSolution(answerPublicKey, {
    accounts: {
      author: wallet.value.publicKey,
      question: question.value.publicKey,
    },
  });

  question.solution = answerPublicKey;
};
