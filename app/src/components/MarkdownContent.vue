<script setup>
import markdownItLatex from "markdown-it-latex";
import MarkdownHighlightJs from "markdown-it-highlightjs";
import Markdown from "vue3-markdown-it";
import "highlight.js";
import "highlight.js/styles/xcode.css";
import "markdown-it-latex/dist/index.css";
import { toRefs, ref } from "vue";

const props = defineProps({
	text: String,
});
const { text } = toRefs(props);
const plugins = ref([
	{
		plugin: markdownItLatex,
	},
	{
		plugin: MarkdownHighlightJs,
	},
]);
</script>

<style>
div#md ul {
	list-style-position: inside;
	list-style-type: circle;
}
/* Assume light mode by default */
@import "highlight.js/styles/xcode.css" screen;
/* Supersede dark mode when applicable */
@import "highlight.js/styles/tokyo-night-dark.css" screen and
	(prefers-color-scheme: dark);
</style>

<template>
	<div>
		<Markdown class="dark" :source="text" :plugins="plugins" id="md" />
	</div>
</template>
