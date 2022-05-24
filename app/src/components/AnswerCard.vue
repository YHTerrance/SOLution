<script setup>
import { toRefs, computed, ref } from "vue";
import IconEdit from "@/components/atoms/IconEdit.vue";
import IconDelete from "@/components/atoms/IconDelete.vue";
import IconSpinner from "@/components/atoms/IconSpinner.vue";
import IconCheck from "@/components/atoms/IconCheck.vue";
import AnswerModalUpdate from "@/components/AnswerModalUpdate.vue";
import { deleteAnswer } from "@/api";
import { selectSolution } from "@/api";
import { useWorkspace } from "@/composables";

const props = defineProps({
  question: Object,
  answer: Object,
  isSolution: Boolean,
});
const { wallet } = useWorkspace();
const { question, answer, isSolution } = toRefs(props);

const isEditing = ref(false);

const loading_delete = ref(false);
const ticks_delete = ref(0);

const isMyAnswer = computed(
  () =>
    wallet.value &&
    wallet.value.publicKey.toBase58() === answer.value.author.toBase58()
);

const isMyQuestion = computed(
  () =>
    wallet.value &&
    wallet.value.publicKey.toBase58() === question.value.author.toBase58()
);

const authorRoute = computed(() => {
  if (isMyAnswer.value) {
    return { name: "Profile" };
  } else {
    return {
      name: "Users",
      params: { author: answer.value.author.toBase58() },
    };
  }
});

// Actions.
const emit = defineEmits(["delete", "fail", "select"]);

const onDelete = async () => {
  console.log("Deleting answer...");
  loading_delete.value = true;
  try {
    await deleteAnswer(answer.value, ticks_delete);
    emit("delete", answer.value);
  } catch (error) {
    console.log(error);
  } finally {
    loading_delete.value = false;
  }
};

// TODO: make sure only the author can choose the best answer
const onSelect = async () => {
  try {
    await selectSolution(question, answer.value.publicKey);
    question.value.solution = answer.value.publicKey;
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <div>
    <answer-modal-update
      :answer="answer"
      @close="isEditing = false"
      v-if="isEditing"
    >
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
    </answer-modal-update>

    <div :class="isSolution ? 'bg-pink-100 p-4 rounded-lg' : 'p-4'">
      <div
        v-if="isSolution"
        class="underline p-2 pt-0 ml-[-8px] mb-2 text-pink-700 font-bold"
      >
        Solution
      </div>

      <div class="flex justify-between pb-2">
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

        <div class="flex">
          <div class="flex" v-if="isMyAnswer">
            <button
              @click="isEditing = true"
              class="flex px-2 rounded-full text-gray-500 hover:text-pink-500 hover:bg-gray-100"
              title="Update answer"
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
              <icon-spinner
                v-else-if="loading_delete"
                class="text-green-500"
              ></icon-spinner>
              <icon-delete v-else></icon-delete>
            </button>
          </div>
          <button
            v-if="isSolution"
            class="flex py-[3px] px-2 rounded-full text-pink-700"
            title="Select answer"
            disabled
          >
            <icon-check></icon-check>
          </button>
          <button
            v-else-if="isMyQuestion"
            @click="onSelect"
            class="flex py-[3px] px-2 rounded-full text-gray-500 hover:text-pink-500 hover:bg-gray-100"
            title="Select answer"
          >
            <icon-check></icon-check>
          </button>
          <button
            v-else
            class="flex py-[3px] px-2 rounded-full text-gray-500"
            title="Select answer"
            disabled
          >
            <icon-check></icon-check>
          </button>
        </div>
      </div>
      <p class="whitespace-pre-wrap" v-text="answer.content"></p>
    </div>
  </div>
</template>
