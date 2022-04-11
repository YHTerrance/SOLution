<script setup>
import { toRefs } from "vue";

const props = defineProps({
  question: Object,
  authorRoute: Object,
});

const { question, authorRoute } = toRefs(props);
</script>

<template>
  <div>
    <h3 class="inline font-semibold" :title="question.author">
      <!-- TODO: Link to author page or the profile page if it's our own question. -->
      <router-link :to="authorRoute" class="hover:underline">
        {{ question.author_display }}
      </router-link>
    </h3>
    <span class="text-gray-500"> • </span>
    <time class="text-gray-500 text-sm" :title="question.created_at">
      <!-- TODO: Link to the question page. -->
      <router-link
        :to="{
          name: 'Question',
          params: { question: question.publicKey.toBase58() },
        }"
        class="hover:underline"
      >
        {{ question.created_at }}
      </router-link>
    </time>
  </div>
  <p class="whitespace-pre-wrap" v-text="question.content"></p>
  <router-link
    v-if="question.topic"
    :to="{ name: 'Topics', params: { topic: question.topic } }"
    class="inline-block mt-2 text-pink-500 hover:underline justify-self-start"
  >
    #{{ question.topic }}
  </router-link>
  <div v-else></div>
</template>
