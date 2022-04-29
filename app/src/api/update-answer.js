import { useWorkspace } from "@/composables";

export const updateAnswer = async (answer, content) => {
  const { wallet, program } = useWorkspace();
  await program.value.rpc.updateAnswer(content, {
    accounts: {
      author: wallet.value.publicKey,
      answer: answer.publicKey,
    },
  });

  answer.content = content;

  return answer;
};
