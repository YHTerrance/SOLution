import { web3, BN } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";
import { Question } from "@/models";
import { pollConfirmation } from "./utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const askQuestion = async (topic, content, amount, ticks) => {
  const { wallet, program, connection } = useWorkspace();

  console.log(amount);

  const question = web3.Keypair.generate();

  const signature = await program.value.rpc.askQuestion(
    topic,
    content,
    new BN(amount * LAMPORTS_PER_SOL),
    {
      accounts: {
        author: wallet.value.publicKey,
        question: question.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [question],
    }
  );

  await pollConfirmation(connection, signature, ticks);

  const questionAccount = await program.value.account.question.fetch(
    question.publicKey
  );

  return new Question(question.publicKey, questionAccount);
};
