<script setup>
import { toRefs, computed } from 'vue'

const props = defineProps({
    answers: Object,
    authorRoute: Object
})

const { answers, authorRoute } = toRefs(props)

const orderedAnswers = computed(() => {
    return answers.value.slice().sort((a, b) => b.timestamp - a.timestamp)
})
</script>


<template>
<div class="mt-6 pl-4 border-l-2 border-pink-100">
  <div v-for="answer in orderedAnswers" :key="answer.key">
    <div>
      <h3 class="inline font-semibold" :title="answer.author">
        <router-link :to="authorRoute" class="hover:underline">
          {{ answer.author_display }}
        </router-link>
      </h3>
      <span class="text-gray-500"> • </span>
      <time class="text-gray-500 text-sm" :title="answer.created_at">
        {{ answer.created_ago }}
      </time>
    </div>
    <p class="whitespace-pre-wrap" v-text="answer.content"></p>
  </div>
</div>

</template>
