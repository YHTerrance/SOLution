import { useWorkspace } from "@/composables";

export const updateQuestion = async (question, topic, content) => {
  const { wallet, program } = useWorkspace();
  await program.value.rpc.updateQuestion(topic, content, {
    accounts: {
      author: wallet.value.publicKey,
      question: question.publicKey,
    },
  });

  question.topic = topic;
  question.content = content;
};
