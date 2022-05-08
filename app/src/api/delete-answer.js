import { useWorkspace } from "@/composables";
import { pollConfirmation } from "./utils";

export const deleteAnswer = async (answer, ticks) => {
  const { wallet, program, connection } = useWorkspace();

  console.assert(
    answer.targetAuthor.toBase58() == wallet.value.publicKey.toBase58()
  );

  const signature = await program.value.rpc.deleteAnswer({
    accounts: {
      author: wallet.value.publicKey,
      answer: answer.publicKey,
      receiver: answer.author,
    },
  });

  await pollConfirmation(connection, signature, ticks);
};
