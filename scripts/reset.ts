import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";
import { SoLution } from "../target/types/so_lution";
import { assert } from "chai";

describe("SOLution", () => {
	anchor.setProvider(anchor.Provider.env());
	const program = anchor.workspace.SoLution as Program<SoLution>;
	describe("# Privileged", () => {
		it("can delete all answers", async () => {
			let answerAccounts = await program.account.answer.all();
			for (const answerAccount of answerAccounts) {
				await program.rpc.deleteAnswer({
					accounts: {
						answer: answerAccount.publicKey,
						receiver: answerAccount.account.author,
						authority: program.provider.wallet.publicKey,
					},
				});
			}
			answerAccounts = await program.account.answer.all();
			assert.equal(answerAccounts.length, 0);
		});

		it("can delete all questions", async () => {
			let questionAccounts = await program.account.question.all();
			for (const questionAccount of questionAccounts) {
				await program.rpc.deleteQuestion({
					accounts: {
						question: questionAccount.publicKey,
						receiver: questionAccount.account.author,
						authority: program.provider.wallet.publicKey,
					},
				});
			}
			questionAccounts = await program.account.question.all();
			assert.equal(questionAccounts.length, 0);
		});
	});
});
