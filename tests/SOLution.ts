import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";
import { assert } from "chai";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as bs58 from "bs58";
import { SoLution } from "../target/types/so_lution";

const RENT_MAX_APPROX = 15000000;
const BASE_FEE_LAMPORTS = LAMPORTS_PER_SOL / 1000;

describe("SOLution", () => {
	// Configure the client to use the local cluster.
	anchor.setProvider(anchor.Provider.env());

	const program = anchor.workspace.SoLution as Program<SoLution>;

	// Function that returns balance of public key
	const getBalance = async (publicKey) => {
		return await program.provider.connection.getBalance(publicKey);
	};

	// Function that wraps the logic of asking questions
	const askQuestion = async (
		author,
		topic,
		content,
		amount = new BN(LAMPORTS_PER_SOL)
	) => {
		const question = anchor.web3.Keypair.generate();
		const signers =
			author == program.provider.wallet ? [question] : [question, author];

		await program.rpc.askQuestion(topic, content, amount, {
			accounts: {
				question: question.publicKey,
				author: author.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			},
			signers: signers,
		});
		return question;
	};

	// Function that wraps the logic of submitting answers
	const submitAnswer = async (
		author,
		targetQuestion,
		targetAuthor,
		content
	) => {
		const answer = anchor.web3.Keypair.generate();
		const signers =
			author == program.provider.wallet ? [answer] : [answer, author];

		await program.rpc.submitAnswer(targetQuestion, targetAuthor, content, {
			accounts: {
				answer: answer.publicKey,
				author: author.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			},
			signers: signers,
		});
		return answer;
	};

	describe("# Create and Fetch Questions", () => {
		it("can ask a question", async () => {
			const testTopic = "cns";
			const testContent =
				"Can anyone explain what is homomorphic encryption?";
			let author = program.provider.wallet;

			let before_balance = await getBalance(author.publicKey);

			let amount = new BN(LAMPORTS_PER_SOL);
			const question = await askQuestion(
				author,
				testTopic,
				testContent,
				amount
			);
			const questionAccount = await program.account.question.fetch(
				question.publicKey
			);

			let after_balance = await getBalance(author.publicKey);

			assert.closeTo(
				before_balance - after_balance,
				amount.toNumber(),
				RENT_MAX_APPROX
			);
			assert.equal(
				questionAccount.author.toBase58(),
				program.provider.wallet.publicKey.toBase58()
			);
			assert.equal(questionAccount.topic, testTopic);
			assert.equal(questionAccount.content, testContent);
			assert.ok(questionAccount.timestamp);
		});
		it("can ask a question without a topic", async () => {
			const testTopic = "";
			const testContent =
				"Is pallier encryption some kind of homomorphic encryption?";

			const question = await askQuestion(
				program.provider.wallet,
				testTopic,
				testContent
			);
			const questionAccount = await program.account.question.fetch(
				question.publicKey
			);

			assert.equal(
				questionAccount.author.toBase58(),
				program.provider.wallet.publicKey.toBase58()
			);
			assert.equal(questionAccount.topic, testTopic);
			assert.equal(questionAccount.content, testContent);
			assert.ok(questionAccount.timestamp);
		});

		it("can ask a question as a different author", async () => {
			const testTopic = "cns";
			const testContent =
				"Why does impermanent loss happen in AMMs like Uniswap? (Oops i thought this was defi)";

			const otherUser = anchor.web3.Keypair.generate();
			const signature = await program.provider.connection.requestAirdrop(
				otherUser.publicKey,
				10000000000
			);
			await program.provider.connection.confirmTransaction(signature);

			const question = await askQuestion(
				otherUser,
				testTopic,
				testContent
			);

			const questionAccount = await program.account.question.fetch(
				question.publicKey
			);

			assert.equal(
				questionAccount.author.toBase58(),
				otherUser.publicKey.toBase58()
			);
			assert.equal(questionAccount.topic, testTopic);
			assert.equal(questionAccount.content, testContent);
			assert.ok(questionAccount.timestamp);
		});

		it("cannot provide a topic with more than 50 characters", async () => {
			try {
				const topicWith51Chars = "x".repeat(51);
				const testContent = "Hummus, am I right?";

				const question = await askQuestion(
					program.provider.wallet,
					topicWith51Chars,
					testContent
				);
			} catch (error) {
				assert.equal(
					error.msg,
					"The provided topic should be 50 characters long maximum."
				);
				return;
			}
			assert.fail(
				"The instruction should have failed with a 51-character topic."
			);
		});

		it("cannot provide a content with more than 280 characters", async () => {
			try {
				const contentWith281Chars = "x".repeat(281);
				const testTopic = "veganism";
				const question = await askQuestion(
					program.provider.wallet,
					testTopic,
					contentWith281Chars
				);
			} catch (error) {
				assert.equal(
					error.msg,
					"The provided content should be 280 characters long maximum."
				);
				return;
			}

			assert.fail(
				"The instruction should have failed with a 281-character content."
			);
		});

		it("can fetch all questions", async () => {
			const questionAccounts = await program.account.question.all();
			assert.equal(questionAccounts.length, 3);
		});
	});

	describe("# Create and Fetch Answers", () => {
		it("can submit an answer", async () => {
			const testContent =
				"Homomorphic encryption satisfies the following simple formula: D(E(x1) * E(x2)) = x1 + x2";
			const questionAccounts = await program.account.question.all();
			const answer = await submitAnswer(
				program.provider.wallet,
				questionAccounts[0].publicKey,
				questionAccounts[0].account.author,
				testContent
			);
			const answerAccount = await program.account.answer.fetch(
				answer.publicKey
			);

			assert.equal(
				answerAccount.author.toBase58(),
				program.provider.wallet.publicKey.toBase58()
			);
			assert.equal(
				answerAccount.targetQuestion.toBase58(),
				questionAccounts[0].publicKey.toBase58()
			);
			assert.equal(answerAccount.content, testContent);
			assert.ok(answerAccount.timestamp);
		});

		it("can submit an answer as a different author", async () => {
			const testContent = "i dont think this is a relevant question";

			const otherUser = anchor.web3.Keypair.generate();
			const signature = await program.provider.connection.requestAirdrop(
				otherUser.publicKey,
				10000000000
			);
			await program.provider.connection.confirmTransaction(signature);

			const questionAccounts = await program.account.question.all();

			const answer = await submitAnswer(
				otherUser,
				questionAccounts[1].publicKey,
				questionAccounts[1].account.author,
				testContent
			);
			const answerAccount = await program.account.answer.fetch(
				answer.publicKey
			);

			assert.equal(
				answerAccount.author.toBase58(),
				otherUser.publicKey.toBase58()
			);
			assert.equal(
				answerAccount.targetQuestion.toBase58(),
				questionAccounts[1].publicKey.toBase58()
			);
			assert.equal(answerAccount.content, testContent);
			assert.ok(answerAccount.timestamp);
		});

		it("can fetch all answers", async () => {
			const answerAccounts = await program.account.answer.all();
			assert.equal(answerAccounts.length, 2);
		});
	});

	describe("# Filtering", () => {
		it("can filter questions and answers by author", async () => {
			const authorPublicKey = program.provider.wallet.publicKey;
			const questionAccounts = await program.account.question.all([
				{
					memcmp: {
						offset: 8, // Discriminator
						bytes: authorPublicKey.toBase58(),
					},
				},
			]);
			const answerAccounts = await program.account.answer.all([
				{
					memcmp: {
						offset: 8, // Discriminator
						bytes: authorPublicKey.toBase58(),
					},
				},
			]);
			assert.equal(questionAccounts.length, 2);
			assert.equal(answerAccounts.length, 1);
		});

		it("can filter answers by target_question", async () => {
			const questionAccounts = await program.account.question.all();
			const targetQuestionPublicKey = questionAccounts[0].publicKey;
			const answerAccounts = await program.account.answer.all([
				{
					memcmp: {
						offset: 8 + 32 + 8 + 1, // Discriminator + Author + timestamp + isSolution
						bytes: targetQuestionPublicKey.toBase58(),
					},
				},
			]);
			assert.equal(answerAccounts.length, 1);
		});

		it("can filter questions by topic", async () => {
			const testTopic = "cns";
			const questionAccounts = await program.account.question.all([
				{
					memcmp: {
						offset:
							8 + // Discriminator.
							32 + // Author public key.
							8 + // Timestamp.
							1 + // has_solution
							32 + // Solution public key
							8 + // amount
							4, // Topic string prefix.
						bytes: bs58.encode(Buffer.from(testTopic)),
					},
				},
			]);
			assert.equal(questionAccounts.length, 2);
			assert.ok(
				questionAccounts.every((questionAccount) => {
					return questionAccount.account.topic === testTopic;
				})
			);
		});
	});

	describe("# Update and Delete", () => {
		it("can update a question and its answer", async () => {
			const topic = "babydoge";
			const content = "to the moon or not?";
			const author = program.provider.wallet;

			// Create question and an answer under the question
			const question = await askQuestion(author, topic, content);
			const questionAccount = await program.account.question.fetch(
				question.publicKey
			);

			assert.equal(questionAccount.topic, topic);
			assert.equal(questionAccount.content, content);

			const answer = await submitAnswer(
				author,
				question.publicKey,
				questionAccount.author,
				content
			);
			const answerAccount = await program.account.answer.fetch(
				answer.publicKey
			);
			assert.equal(answerAccount.content, content);

			const new_topic = "shiba inu";
			const new_content = "to mars <3";

			// Update question
			await program.rpc.updateQuestion(new_topic, new_content, {
				accounts: {
					question: question.publicKey,
					author: author.publicKey,
				},
			});

			const updatedQuestionAccount = await program.account.question.fetch(
				question.publicKey
			);

			assert.equal(updatedQuestionAccount.topic, new_topic);
			assert.equal(updatedQuestionAccount.content, new_content);

			// Update Answer
			await program.rpc.updateAnswer(new_content, {
				accounts: {
					answer: answer.publicKey,
					author: author.publicKey,
				},
			});

			const updatedAnswerAccount = await program.account.answer.fetch(
				answer.publicKey
			);
			assert.equal(updatedAnswerAccount.content, new_content);
		});

		it("cannot update someone else's question or answer", async () => {
			const topic = "fantom";
			const content = "Fantom is wonderful";
			const author = program.provider.wallet;
			const question = await askQuestion(author, topic, content);
			const answer = await submitAnswer(
				author,
				question.publicKey,
				author.publicKey,
				content
			);

			try {
				await program.rpc.updateQuestion(
					"solana",
					"solana as in on Solana beach",
					{
						accounts: {
							question: question.publicKey,
							author: anchor.web3.Keypair.generate().publicKey,
						},
					}
				);
				assert.fail("We were able to update someone else's question.");
			} catch (error) {
				const questionAccount = await program.account.question.fetch(
					question.publicKey
				);
				assert.equal(questionAccount.topic, topic);
				assert.equal(questionAccount.content, content);
			}

			try {
				await program.rpc.updateAnswer("solana as in on Solana beach", {
					accounts: {
						answer: answer.publicKey,
						author: anchor.web3.Keypair.generate().publicKey,
					},
				});
				assert.fail("We were able to update someone else's answer");
			} catch (error) {
				const answerAccount = await program.account.answer.fetch(
					answer.publicKey
				);
				assert.equal(answerAccount.content, content);
			}
		});

		it("can delete an answer", async () => {
			const author = program.provider.wallet;
			const question = await askQuestion(
				author,
				"babydoge",
				"babydoge dodo do do do do"
			);

			const answer = await submitAnswer(
				author,
				question.publicKey,
				author.publicKey,
				"babydoge dodo do do do do"
			);

			await program.rpc.deleteAnswer({
				accounts: {
					answer: answer.publicKey,
					authority: author.publicKey,
					receiver: author.publicKey,
				},
			});

			// Ensure that fetcing the question and answer account returns NULL
			const answerAccount = await program.account.answer.fetchNullable(
				answer.publicKey
			);
			assert.ok(answerAccount === null);
		});

		it("can delete an answer as the owner of the question", async () => {
			const author = program.provider.wallet;
			const question = await askQuestion(
				author,
				"babydoge",
				"babydoge dodo do do do do"
			);

			// Create answer as another person
			const otherUser = anchor.web3.Keypair.generate();
			const signature = await program.provider.connection.requestAirdrop(
				otherUser.publicKey,
				10000000000
			);
			await program.provider.connection.confirmTransaction(signature);

			const answer = await submitAnswer(
				otherUser,
				question.publicKey,
				author.publicKey,
				"babydoge dodo do do do do"
			);

			await program.rpc.deleteAnswer({
				accounts: {
					answer: answer.publicKey,
					authority: author.publicKey,
					receiver: otherUser.publicKey,
				},
			});

			const answerAccount = await program.account.answer.fetchNullable(
				answer.publicKey
			);

			assert.ok(answerAccount === null);
		});

		it("cannot delete delete someone else's answer", async () => {
			const topic = "topic";
			const content = "content";
			const author = program.provider.wallet;
			const question = await askQuestion(author, topic, content);
			const answer = await submitAnswer(
				author,
				question.publicKey,
				author.publicKey,
				content
			);

			try {
				const otherUser = anchor.web3.Keypair.generate();
				await program.rpc.deleteAnswer({
					accounts: {
						answer: answer.publicKey,
						authority: otherUser.publicKey,
						receiver: author.publicKey,
					},
				});
				assert.fail("We were able to delete someone else's answer");
			} catch (error) {
				const answerAccount = await program.account.answer.fetch(
					answer.publicKey
				);
				assert.equal(answerAccount.content, content);
			}
		});

		it("cannot update someone else's question or answer", async () => {
			const topic = "fantom";
			const content = "Fantom is wonderful";
			const author = program.provider.wallet;
			const question = await askQuestion(author, topic, content);
			const answer = await submitAnswer(
				author,
				question.publicKey,
				author.publicKey,
				content
			);
			try {
				await program.rpc.selectSolution({
					accounts: {
						question: question.publicKey,
						answer: answer.publicKey,
						author: anchor.web3.Keypair.generate().publicKey,
					},
				});
				assert.fail("We were able to update someone else's question.");
			} catch (error) {
				return;
			}
		});
	});

	describe("# Utilities", () => {
		it("can select solution as asker and redeem rewards as solver", async () => {
			const topic = "babydoge";
			const content = "to the moon or not?";
			const author = program.provider.wallet;

			// Create question and an answer under the question
			const question = await askQuestion(author, topic, content);
			const questionAccount = await program.account.question.fetch(
				question.publicKey
			);

			assert.equal(questionAccount.topic, topic);
			assert.equal(questionAccount.content, content);

			const answer1 = await submitAnswer(
				author,
				question.publicKey,
				questionAccount.author,
				"answer 1"
			);
			const answerAccount1 = await program.account.answer.fetch(
				answer1.publicKey
			);
			assert.equal(answerAccount1.content, "answer 1");

			const answer2 = await submitAnswer(
				author,
				question.publicKey,
				questionAccount.author,
				"answer 2"
			);
			const answerAccount2 = await program.account.answer.fetch(
				answer2.publicKey
			);
			assert.equal(answerAccount2.content, "answer 2");

			const questionAmount = (
				await program.account.question.fetch(question.publicKey)
			).amount;

			// select solution
			await program.rpc.selectSolution({
				accounts: {
					question: question.publicKey,
					answer: answer2.publicKey,
					author: author.publicKey,
				},
			});

			const QuestionAccount = await program.account.question.fetch(
				question.publicKey
			);

			// check if selected answer is equivalent
			assert.equal(
				QuestionAccount.solution.toBase58(),
				answer2.publicKey.toBase58()
			);

			const reward = (
				await program.account.answer.fetch(answer2.publicKey)
			).amount;

			// Check if balance in question account is correct
			assert.equal(
				reward.toNumber(),
				questionAmount.toNumber() - BASE_FEE_LAMPORTS
			);

			const authorPreBalance = await getBalance(author.publicKey);
			// Redeem reward as answer author
			await program.rpc.redeemReward({
				accounts: {
					answer: answer2.publicKey,
					author: author.publicKey,
				},
			});

			const authorBalance = await getBalance(author.publicKey);

			assert.closeTo(
				authorBalance - authorPreBalance,
				reward.toNumber(),
				RENT_MAX_APPROX
			);

			// Check that we can filter by hasSolution
			const hasSolutionQuestionAccounts =
				await program.account.question.all([
					{
						memcmp: {
							offset:
								8 + // Discriminator.
								32 + // Author public key.
								8, // Timestamp.
							bytes: bs58.encode(new BN(1, "le").toArray()),
						},
					},
				]);
			assert.equal(hasSolutionQuestionAccounts.length, 1);

			// Check that we can filter by isSolution
			const isSolutionAnswerAccounts = await program.account.question.all(
				[
					{
						memcmp: {
							offset:
								8 + // Discriminator.
								32 + // Author public key.
								8, // Timestamp.
							bytes: bs58.encode(new BN(1, "le").toArray()),
						},
					},
				]
			);
			assert.equal(isSolutionAnswerAccounts.length, 1);
		});

		it("can submit 10 sample questions", async () => {
			const testTopic = "Test topic";

			for (let i = 0; i < 10; ++i) {
				let testContent = `this is the test content ${i}`;

				let otherUser = anchor.web3.Keypair.generate();
				let signature =
					await program.provider.connection.requestAirdrop(
						otherUser.publicKey,
						10000000000
					);
				await program.provider.connection.confirmTransaction(signature);

				await askQuestion(otherUser, testTopic, testContent);
			}

			const questionAccounts = await program.account.question.all([
				{
					memcmp: {
						offset:
							8 + // Discriminator.
							32 + // Author public key.
							8 + // Timestamp.
							1 + // hasSolution
							32 + // Solution public key
							8 + // Amount
							4, // Topic string prefix.
						bytes: bs58.encode(Buffer.from(testTopic)),
					},
				},
			]);
			assert.equal(questionAccounts.length, 10);
		});
	});
});
