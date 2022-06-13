<script setup>
import { ref, watchEffect } from "vue";
import { authorFilter, paginateQuestions } from "@/api";
import QuestionList from "@/components/QuestionList";
import { useWorkspace } from "@/composables";
import { useWallet } from "solana-wallets-vue";

const questions = ref([]);
const { wallet } = useWorkspace();
const { connected } = useWallet();
const filters = ref([]);

const onNewPage = (newQuestions) => questions.value.push(...newQuestions);
const { prefetch, hasNextPage, getNextPage, loading } = paginateQuestions(
  filters,
  5,
  onNewPage
);

watchEffect(() => {
  if (!wallet.value) return;
  questions.value = [];
  filters.value = [authorFilter(wallet.value.publicKey.toBase58())];
  prefetch().then(getNextPage);
});

// watchEffect(async () => {
//   try {
//     loading.value = true;
//     allQuestions.value = await fetchQuestions();
//   } catch (e) {
//     hasError.value = true;
//     console.trace(e);
//   }

//   for (const question of allQuestions.value) {
//     if (
//       wallet.value.publicKey.toBase58() !== question.author.toBase58() ||
//       question.timestamp <= START_TIME
//     ) {
//       // not my question, skip
//       continue;
//     }

//     const answers = await fetchAnswers([
//       targetQuestionFilter(question.publicKey.toBase58()),
//     ]);
//     if (answers.length === 0) {
//       // no answers, skip
//       continue;
//     }

//     const solution = answers.filter(
//       (answer) => answer.key === question.solution.toBase58()
//     )[0];
//     if (solution !== undefined && solution.amount <= 0) {
//       // already has solution and no rewards to claim, skip
//       continue;
//     }

//     myQuestions.value.push(question);
//   }

//   myQuestions.value.sort((a, b) => {
//     return dayjs.unix(b.timestamp) - dayjs.unix(a.timestamp);
//   });

//   loading.value = false;
// });

const topTextClass =
  "p-8 text-gray-500 dark:text-white bg-pink-100/10 text-center border-b";
</script>

<template>
  <div class="dark:text-white">
    <div v-if="!connected" :class="topTextClass">
      Connect your wallet to see your rewards
    </div>
    <div v-else-if="loading" :class="topTextClass">Loading...</div>
    <div v-else-if="questions.length === 0" :class="topTextClass">
      There are currently no rewards to claim. Go ask questions!
    </div>
    <div v-else>
      <div :class="topTextClass">
        These are the claimable rewards below. Claim them as you want!
      </div>
      <question-list
        :questions="questions"
        :loading="loading"
        :has-more="hasNextPage"
        @more="getNextPage"
      ></question-list>
    </div>
  </div>
</template>
