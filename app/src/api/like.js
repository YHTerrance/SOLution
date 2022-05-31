import { useWorkspace } from "@/composables";

export const like = async (question) => {
  const { wallet, program } = useWorkspace();
  await program.value.rpc.like({
    accounts: {
      question: question.publicKey,
      fan: wallet.value.publicKey,
    },
  });
  // TODO: Seems like it does not successfully record
  // the fan publickey into the solana chain. But the same
  // functino works in tests. Can not figure out why.

  question.likes.push(wallet.value.publicKey);
};
