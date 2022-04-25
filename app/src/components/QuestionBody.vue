<script setup>
import { toRefs } from "vue";
import IconEdit from "@/components/atoms/IconEdit.vue";

const props = defineProps({
  question: Object,
  authorRoute: Object,
  isMyQuestion: Boolean,
});

const { question, authorRoute, isMyQuestion } = toRefs(props);

// Actions.
const emit = defineEmits(["edit"]);
</script>

<template>
  <div>
    <h3 class="inline font-semibold" :title="question.author">
      <router-link :to="authorRoute" class="hover:underline">
        {{ question.author_display }}
      </router-link>
    </h3>
    <span class="text-gray-500"> • </span>
    <time class="text-gray-500 text-sm" :title="question.created_at">
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
    <div class="inline-block pt-1" v-if="isMyQuestion">
      <button
        @click="emit('edit')"
        class="flex px-2 rounded-full text-gray-500 hover:text-pink-500 hover:bg-gray-100"
        title="Update question"
      >
        <icon-edit></icon-edit>
      </button>
    </div>
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
