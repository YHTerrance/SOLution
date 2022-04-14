<script setup>
import { useRoute } from "vue-router";
import TheSidebar from "./components/TheSidebar";
import {
	PhantomWalletAdapter,
	SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { initWallet } from "solana-wallets-vue";
import { initWorkspace, useWorkspace } from "./composables";
import ToastItem from "@/components/atoms/ToastItem.vue";
import { watch } from "vue";

const route = useRoute();

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

initWallet({ wallets, autoConnect: true });
initWorkspace();
const { status } = useWorkspace();
status.value.activate("asdasd", "asdsad");
watch(
	status,
	(x) => {
		console.log(x);
	},
	{ deep: true }
);
</script>

<template>
	<div class="w-full max-w-3xl lg:max-w-4xl mx-auto">
		<the-sidebar
			class="py-4 md:py-8 md:pl-4 md:pr-8 fixed w-20 md:w-64"
		></the-sidebar>

		<!-- Main -->
		<main class="flex-1 border-r border-l ml-20 md:ml-64 min-h-screen">
			<header
				class="flex space-x-6 items-center justify-between px-8 py-4 border-b"
			>
				<div class="text-xl font-bold" v-text="route.name"></div>
			</header>
			<router-view></router-view>
		</main>
		<toast-item
			class="mx-auto sm:w-3/4 md:w-2/4 fixed inset-x-0 bottom-10"
			:status="status"
		></toast-item>
	</div>
</template>
