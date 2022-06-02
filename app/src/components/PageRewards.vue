<script setup>
import { ref, watchEffect } from "vue";
import { fetchQuestions, fetchAnswers, targetQuestionFilter } from "@/api";
import { useWorkspace } from "@/composables";
import { START_TIME } from "@/const";
import QuestionCard from "@/components/QuestionCard";
import dayjs from "dayjs";

const { wallet } = useWorkspace();
const loading = ref(false);
const hasError = ref(false);
const allQuestions = ref([]);
const myQuestions = ref([]);

watchEffect(async () => {
  try {
    loading.value = true;
    allQuestions.value = await fetchQuestions();
  } catch (e) {
    hasError.value = true;
    console.trace(e);
  }

  for (const question of allQuestions.value) {
    if (
      wallet.value.publicKey.toBase58() !== question.author.toBase58() ||
      question.timestamp <= START_TIME
    ) {
      // not my question, skip
      continue;
    }

    const answers = await fetchAnswers([
      targetQuestionFilter(question.publicKey.toBase58()),
    ]);
    if (answers.length === 0) {
      // no answers, skip
      continue;
    }

    const solution = answers.filter(
      (answer) => answer.key === question.solution.toBase58()
    )[0];
    if (solution !== undefined && solution.amount <= 0) {
      // already has solution and no rewards to claim, skip
      continue;
    }

    myQuestions.value.push(question);
  }

  myQuestions.value.sort((a, b) => {
    return dayjs.unix(b.timestamp) - dayjs.unix(a.timestamp);
  });

  loading.value = false;
});

const topTextClass = "p-8 text-gray-500 text-center border-b";
</script>

<template>
  <div class="dark:text-white">
    <div v-if="loading" :class="topTextClass">Loading...</div>
    <div v-else-if="hasError" :class="topTextClass">
      Error on loading questions QQ
    </div>
    <div v-else-if="myQuestions.length === 0" :class="topTextClass">
      There is currently no rewards to claim. Go ask questions!
    </div>
    <div v-else>
      <div
        class="p-8 text-gray-500 dark:text-gray-300 text-center text-lg border-b"
      >
        These are the claimable rewards below. Claim them as you want!
      </div>
      <question-card
        v-for="question in myQuestions"
        :key="question.key"
        :question="question"
      ></question-card>
    </div>
  </div>
</template>
