import { useWorkspace } from "@/composables";

export const redeemReward = async (answer) => {
  const { wallet, program } = useWorkspace();
  await program.value.rpc.redeemReward({
    accounts: {
      author: wallet.value.publicKey,
      answer: answer.publicKey,
    },
  });
};
