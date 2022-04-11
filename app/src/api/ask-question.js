import { web3 } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";
import { Question } from "@/models";
import { pollConfirmation } from "./utils";

export const askQuestion = async (topic, content, ticks) => {
  const { wallet, program, connection } = useWorkspace();

  const question = web3.Keypair.generate();

  const signature = await program.value.rpc.askQuestion(topic, content, {
    accounts: {
      author: wallet.value.publicKey,
      question: question.publicKey,
      systemProgram: web3.SystemProgram.programId,
    },
    signers: [question],
  });

  await pollConfirmation(connection, signature, ticks);

  const questionAccount = await program.value.account.question.fetch(
    question.publicKey
  );

  return new Question(question.publicKey, questionAccount);
};
