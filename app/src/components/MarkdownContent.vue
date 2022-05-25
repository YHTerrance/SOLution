<script setup>
import markdownItLatex from 'markdown-it-latex'
import Markdown from 'vue3-markdown-it';
import 'markdown-it-latex/dist/index.css';
import { toRefs, ref } from "vue";
const props = defineProps({
  text: String,
});
const { text} = toRefs(props);
const plugins = ref([
        {
          plugin: markdownItLatex
        }
      ])
</script>

<template>
  <div>
    <Markdown :source="text" :plugins="plugins" />
  </div>
</template>

