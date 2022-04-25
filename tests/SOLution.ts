import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { assert } from "chai";
import { SoLution } from "../target/types/so_lution";
import * as bs58 from "bs58";

describe("SOLution", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SoLution as Program<SoLution>;

  // Function that wraps the logic of asking questions
  const askQuestion = async (author, topic, content) => {
    const question = anchor.web3.Keypair.generate();
    await program.rpc.askQuestion(topic, content, {
      accounts: {
        question: question.publicKey,
        author,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [question],
    });
    return question;
  };

  it("can ask a question", async () => {
    const testTopic = "cns";
    const testContent = "Can anyone explain what is homomorphic encryption?";

    const question = anchor.web3.Keypair.generate();
    await program.rpc.askQuestion(testTopic, testContent, {
      accounts: {
        question: question.publicKey,
        author: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [question],
    });

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

  it("can ask a question without a topic", async () => {
    const testTopic = "";
    const testContent =
      "Is pallier encryption some kind of homomorphic encryption?";

    const question = anchor.web3.Keypair.generate();
    await program.rpc.askQuestion(testTopic, testContent, {
      accounts: {
        question: question.publicKey,
        author: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [question],
    });

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

    const question = anchor.web3.Keypair.generate();
    await program.rpc.askQuestion(testTopic, testContent, {
      accounts: {
        question: question.publicKey,
        author: otherUser.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [otherUser, question],
    });

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
      const question = anchor.web3.Keypair.generate();
      const topicWith51Chars = "x".repeat(51);
      await program.rpc.askQuestion(topicWith51Chars, "Hummus, am I right?", {
        accounts: {
          question: question.publicKey,
          author: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [question],
      });
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
      const question = anchor.web3.Keypair.generate();
      const contentWith281Chars = "x".repeat(281);
      await program.rpc.askQuestion("veganism", contentWith281Chars, {
        accounts: {
          question: question.publicKey,
          author: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [question],
      });
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

  it("can submit an answer", async () => {
    const testContent =
      "Homomorphic encryption satisfies the following simple formula: D(E(x1) * E(x2)) = x1 + x2";
    const answer = anchor.web3.Keypair.generate();
    const questionAccounts = await program.account.question.all();

    await program.rpc.submitAnswer(questionAccounts[0].publicKey, testContent, {
      accounts: {
        answer: answer.publicKey,
        author: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [answer],
    });

    const answerAccount = await program.account.answer.fetch(answer.publicKey);

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

    const answer = anchor.web3.Keypair.generate();
    await program.rpc.submitAnswer(questionAccounts[1].publicKey, testContent, {
      accounts: {
        answer: answer.publicKey,
        author: otherUser.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [otherUser, answer],
    });

    const answerAccount = await program.account.answer.fetch(answer.publicKey);

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
          offset: 8 + 32 + 8, // Discriminator + Author + timestamp
          bytes: targetQuestionPublicKey.toBase58(),
        },
      },
    ]);
    console.log(answerAccounts);
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
            32 + // Solution public key
            4, // Topic string prefix.
          bytes: bs58.encode(Buffer.from(testTopic)),
        },
      },
    ]);
    console.log(questionAccounts);
    assert.equal(questionAccounts.length, 2);
    assert.ok(
      questionAccounts.every((questionAccount) => {
        return questionAccount.account.topic === testTopic;
      })
    );
  });

  it("can update a question", async () => {
    const topic = "babydoge";
    const content = "to the moon or not?";
    const author = program.provider.wallet.publicKey;
    const question = await askQuestion(author, topic, content);
    const questionAccount = await program.account.question.fetch(
      question.publicKey
    );

    assert.equal(questionAccount.topic, topic);
    assert.equal(questionAccount.content, content);

    const new_topic = "shiba inu";
    const new_content = "to mars <3";

    await program.rpc.updateQuestion(new_topic, new_content, {
      accounts: {
        question: question.publicKey,
        author,
      },
    });

    const updatedQuestionAccount = await program.account.question.fetch(
      question.publicKey
    );
    assert.equal(updatedQuestionAccount.topic, new_topic);
    assert.equal(updatedQuestionAccount.content, new_content);
  });

  it("cannot update someone else's question", async () => {
    const topic = "fantom";
    const content = "Fantom is wonderful";
    const author = program.provider.wallet.publicKey;
    const question = await askQuestion(author, topic, content);

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
      assert.fail("We were able to update someone else's tweet.");
    } catch (error) {
      const tweetAccount = await program.account.question.fetch(
        question.publicKey
      );
      assert.equal(tweetAccount.topic, topic);
      assert.equal(tweetAccount.content, content);
    }
  });

  it("can delete a question", async () => {
    const author = program.provider.wallet.publicKey;
    const question = await askQuestion(
      author,
      "babydoge",
      "babydoge dodo do do do do"
    );

    await program.rpc.deleteQuestion({
      accounts: {
        question: question.publicKey,
        author,
      },
    });

    // Ensure that fetcing the question account returns NULL
    const questionAccount = await program.account.question.fetchNullable(
      question.publicKey
    );
    assert.ok(questionAccount === null);
  });

  it("cannot delete delete someone else's question", async () => {
    const topic = "topic";
    const content = "content";
    const author = program.provider.wallet.publicKey;
    const question = await askQuestion(author, topic, content);

    try {
      await program.rpc.deleteQuestion({
        accounts: {
          question: question.publicKey,
          author: anchor.web3.Keypair.generate().publicKey,
        },
      });
      assert.fail("We were able to delete someone else's question");
    } catch (error) {
      const questionAccount = await program.account.question.fetch(
        question.publicKey
      );
      assert.equal(questionAccount.topic, topic);
      assert.equal(questionAccount.content, content);
    }
  });
});
