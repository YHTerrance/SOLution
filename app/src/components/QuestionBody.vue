<script setup>
import { toRefs } from "vue";
import IconEdit from "@/components/atoms/IconEdit.vue";
import MarkdownContent from "@/components/MarkdownContent.vue";

const props = defineProps({
  question: Object,
  authorRoute: Object,
  isMyQuestion: Boolean,
  loading_delete: Boolean,
  ticks_delete: Number,
});

const { question, authorRoute, isMyQuestion } = toRefs(props);
// Actions.
const emit = defineEmits(["edit"]);
</script>

<template>
  <div>
    <div class="flex justify-between pb-2">
      <div>
        <h3
          class="inline font-semibold dark:text-white"
          :title="question.author"
        >
          <router-link :to="authorRoute" class="hover:underline">
            {{ question.author_display }}
          </router-link>
        </h3>
        <span class="text-gray-500 dark:text-gray-300"> • </span>
        <time
          class="text-gray-500 dark:text-gray-300 text-sm"
          :title="question.created_at"
        >
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
      <div class="flex" v-if="isMyQuestion">
        <button
          @click="emit('edit')"
          class="flex w-6 h-6 rounded-full text-gray-500 dark:text-gray-300 hover:text-pink-500 dark:hover:text-midnight-900 hover:bg-gray-100 dark:hover:bg-pink-200"
          title="Update question"
        >
          <icon-edit></icon-edit>
        </button>
      </div>
    </div>

    <MarkdownContent
      :text="question.content"
      class="dark:text-white"
    ></MarkdownContent>

    <router-link
      v-if="question.topic"
      :to="{ name: 'Topics', params: { topic: question.topic } }"
      class="inline-block mt-2 text-pink-700 font-bold hover:underline justify-self-start"
    >
      #{{ question.topic }}
    </router-link>
    <div v-else></div>
  </div>
</template>
