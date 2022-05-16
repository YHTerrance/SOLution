<script setup>
import { toRefs, computed } from "vue";
import AnswerCard from "@/components/AnswerCard.vue";

const props = defineProps({
  answers: Object,
});

const { answers } = toRefs(props);

const orderedAnswers = computed(() => {
  return answers.value.slice().sort((a, b) => a.timestamp - b.timestamp);
});

const emit = defineEmits(["update:answers"]);

const onDelete = async (deletedAnswer) => {
  const filteredAnswers = answers.value.filter(
    (answer) => answer.publicKey.toBase58() !== deletedAnswer.publicKey.toBase58()
  );
  emit("update:answers", filteredAnswers);
};
</script>

<template>
  <div class="mt-6 pl-4 border-l-2 border-pink-100">
    <div v-for="answer in orderedAnswers" :key="answer.key">
      <answer-card :answer="answer" @delete="onDelete"></answer-card>
    </div>
  </div>
</template>
