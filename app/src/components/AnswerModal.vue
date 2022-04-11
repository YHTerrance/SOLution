<script setup>
  import { toRefs, defineEmits, ref, computed } from 'vue'
  import { useAutoresizeTextarea, useCountCharacterLimit } from '@/composables'
  import IconSpinner from "@/components/atoms/IconSpinner.vue"
  import { useWallet } from 'solana-wallets-vue'
  import { submitAnswer } from '@/api'

  function close_modal() {
    emit("close")
  }
  const props = defineProps({
    show: Boolean,
    targetQuestion: Object
  })

  const { show, targetQuestion } = toRefs(props)

  // Form data.
  const content = ref('')

  // Auto-resize the content's textarea.
  const textarea = ref()
  useAutoresizeTextarea(textarea)

  // Character limit / count-down.
  const characterLimit = useCountCharacterLimit(content, 280)
  const characterLimitColour = computed(() => {
      if (characterLimit.value < 0) return 'text-red-500'
      if (characterLimit.value <= 10) return 'text-yellow-500'
      return 'text-gray-400'
  })

  // Permissions.
  const { connected } = useWallet()
  const canSubmit = computed(() => content.value && characterLimit.value > 0)

  // Actions.
  const loading = ref(false)
  const emit = defineEmits(['added', 'failed', 'close'])
  const status = ref('')
  const showToast = ref(false)
  const submit = async () => {
      if (! canSubmit.value) return
      loading.value = true
      let answer
      try {
          answer = await submitAnswer(targetQuestion.value.publicKey.toBase58(), content.value)
          status.value = "success"
          showToast.value = true
          emit('added', answer)
      }
      catch (error) {
          console.log(error)
          status.value = "danger"
          showToast.value = true
          emit('failed', answer)
      }
      finally {
          loading.value = false
          content.value = ''
          setTimeout(() => showToast.value = false, 5000)
      }
  }
</script>

<template>

    <div v-if="show" class="fixed w-full h-full top-0 left-0 flex items-center justify-center">
        <div @click.self="close_modal()" class="absolute w-full h-full bg-gray-800 opacity-50"></div>

        <div class="bg-white w-11/12 md:max-w-md mx-auto rounded-lg shadow-lg z-50 overflow-y-auto">
            <div class="py-4 text-left px-6">

                <div class="flex-col pb-3">
                  <h1 class="text-xl font-bold mt-2 mb-4">Answering...</h1>
                  <slot>Loading slot</slot>
                    <div v-if="connected" class="px-8 py-4 border-b">
                      <!-- Content field. -->
                      <textarea
                          ref="textarea"
                          rows="1"
                          class="text-xl w-full focus:outline-none resize-none mb-3 border-none focus:ring-transparent"
                          placeholder="What's your solution?"
                          v-model="content"
                      ></textarea>
                    </div>
                  <div class="flex items-center space-x-6 m-2 ml-auto">
                    <!-- Character limit. -->
                    <div :class="characterLimitColour">
                        {{ characterLimit }} left
                    </div>
                    <!-- submit button. -->
                    <button v-if="! loading"
                        class="text-white px-4 py-2 rounded-full font-semibold" :disabled="! canSubmit"
                        :class="canSubmit ? 'bg-pink-500' : 'bg-pink-300 cursor-not-allowed'"
                        @click="submit"
                    >
                        Ask
                    </button>
                    <button v-else
                        type="button"
                        class="inline-flex text-center items-center text-white px-4 py-2 rounded-full font-semibold bg-pink-300 cursor-not-allowed"
                        disabled
                    >
                        <icon-spinner></icon-spinner>
                        Processing...
                    </button>
                  </div>
                </div>
            </div>
        </div>
    </div>

</template>
