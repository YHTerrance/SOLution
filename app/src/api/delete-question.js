import { useWorkspace } from "@/composables";
import { pollConfirmation } from "./utils";

export const deleteQuestion = async (question, ticks) => {
  const { wallet, program, connection } = useWorkspace();
  const signature = await program.value.rpc.deleteQuestion({
    accounts: {
      author: wallet.value.publicKey,
      question: question.publicKey,
    },
  });

  await pollConfirmation(connection, signature, ticks);
};
