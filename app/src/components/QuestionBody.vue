<script setup>
import { toRefs } from "vue";
import IconEdit from "@/components/atoms/IconEdit.vue";
import IconDelete from "@/components/atoms/IconDelete.vue";
import IconSpinner from "@/components/atoms/IconSpinner.vue";

const props = defineProps({
  question: Object,
  authorRoute: Object,
  isMyQuestion: Boolean,
  onDelete: Function,
  loading_delete: Boolean,
  ticks_delete: Number,
});

const { question, authorRoute, isMyQuestion, onDelete } = toRefs(props);
// Actions.
const emit = defineEmits(["edit"]);
</script>

<template>
  <div class="flex justify-between pb-2">
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
    </div>
    <div class="flex" v-if="isMyQuestion">
      <button
        @click="emit('edit')"
        class="flex px-2 rounded-full text-gray-500 hover:text-pink-500 hover:bg-gray-100"
        title="Update question"
      >
        <icon-edit></icon-edit>
      </button>
      <button
        @click="onDelete"
        class="flex px-2 rounded-full text-gray-500 hover:text-pink-500 hover:bg-gray-100"
      >
        <!-- Show spinner when delete button is clicked -->
        <icon-spinner
          v-if="loading_delete && ticks_delete < 4"
          class="text-pink-500"
        ></icon-spinner>
        <icon-spinner v-else-if="loading_delete" class="text-green-500"></icon-spinner>
        <icon-delete v-else></icon-delete>
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
