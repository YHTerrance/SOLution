import { useWorkspace } from "@/composables";
import { fetchAnswers, targetQuestionFilter } from "./fetch-answers";
import { pollConfirmation } from "./utils";
import { deleteAnswer } from "./delete-answer";

export const deleteQuestion = async (question, ticks) => {
  const { wallet, program, connection } = useWorkspace();

  // Fetch answers at start
  let answers = await fetchAnswers([
    targetQuestionFilter(question.publicKey.toBase58()),
  ]);
  console.log(answers);
  for (let answer of answers) {
    console.log("Deleting sub-answers iteratively......");
    console.log(answer);
    try {
      await deleteAnswer(answer);
    } catch (error) {
      console.log("Delete answer error", error);
      return;
    }
  }

  const signature = await program.value.rpc.deleteQuestion({
    accounts: {
      author: wallet.value.publicKey,
      question: question.publicKey,
    },
  });

  await pollConfirmation(connection, signature, ticks);
};
