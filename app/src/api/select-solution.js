import { useWorkspace } from "@/composables";

export const selectSolution = async (question, answer) => {
  const { wallet, program } = useWorkspace();
  await program.value.rpc.selectSolution({
    accounts: {
      question: question.publicKey,
      answer: answer.publicKey,
      author: wallet.value.publicKey,
    },
  });
};
