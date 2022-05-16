<script setup>
import { toRefs, computed, ref } from "vue";
import IconEdit from "@/components/atoms/IconEdit.vue";
import IconDelete from "@/components/atoms/IconDelete.vue";
import IconSpinner from "@/components/atoms/IconSpinner.vue";
import AnswerModalUpdate from "@/components/AnswerModalUpdate.vue";
import { deleteAnswer } from "@/api";
import { useWorkspace } from "@/composables";

const props = defineProps({
  answer: Object,
});
const { wallet } = useWorkspace();
const { answer } = toRefs(props);

const isEditing = ref(false);

const loading_delete = ref(false);
const ticks_delete = ref(0);

const isMyAnswer = computed(
  () =>
    wallet.value && wallet.value.publicKey.toBase58() === answer.value.author.toBase58()
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
const emit = defineEmits(["delete", "fail"]);

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
</script>

<template>
  <answer-modal-update :answer="answer" @close="isEditing = false" v-if="isEditing">
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

  <div class="flex justify-between py-2">
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
        <icon-spinner v-else-if="loading_delete" class="text-green-500"></icon-spinner>
        <icon-delete v-else></icon-delete>
      </button>
    </div>
  </div>
  <p class="whitespace-pre-wrap" v-text="answer.content"></p>
</template>
