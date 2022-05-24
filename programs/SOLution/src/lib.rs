use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;

const BASE_FEE_LAMPORTS: u64 = LAMPORTS_PER_SOL / 1000;
const MIN_REWARD_LAMPORTS: u64 = LAMPORTS_PER_SOL / 1000;

declare_id!("AQJ7RmbJtwGHru6aimiLriPZ4gTs7q5NnzeetyWgNfxo");

#[error_code]
pub enum ErrorCode {
  #[msg("The provided topic should be 50 characters long maximum.")]
  TopicTooLong,
  #[msg("The provided content should be 280 characters long maximum.")]
  ContentTooLong,
  #[msg("Insufficient funds.")]
  InsufficientFunds,
}

#[program]
pub mod so_lution {
  use super::*;

  pub fn ask_question(ctx: Context<AskQuestion>, topic: String, content: String, amount: u64) -> Result<()> {
    let question: &mut Account<Question> = &mut ctx.accounts.question;
    let author: &Signer = &ctx.accounts.author;
    let clock: Clock = Clock::get().unwrap();

    if topic.chars().count() > 50 {
      return Err(ErrorCode::TopicTooLong.into());
    }

    if content.chars().count() > 280 {
      return Err(ErrorCode::ContentTooLong.into());
    }

    if amount < BASE_FEE_LAMPORTS + MIN_REWARD_LAMPORTS {
      return Err(ErrorCode::InsufficientFunds.into())
    }

    question.author = *author.key;
    question.timestamp = clock.unix_timestamp;
    question.topic = topic;
    question.content = content;
    question.amount = amount;

    // Transfer 1 SOL from author to question
    let ix = anchor_lang::solana_program::system_instruction::transfer(
      &author.key(),
      &question.key(),
      amount,
    );

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            author.to_account_info(),
            question.to_account_info(),
        ],
    )?;

    Ok(())
  }

  pub fn select_solution(ctx: Context<SelectSolution>) -> Result<()> {
    let question: &mut Account<Question> = &mut ctx.accounts.question;
    let solution: &mut Account<Answer> = &mut ctx.accounts.answer;
    let author: &Signer = &ctx.accounts.author;

    question.solution = solution.key();

    let balance = question.amount;

    // Transfer funds from question account to answer account and question owner
    **question.to_account_info().try_borrow_mut_lamports()? -= balance;
    **author.to_account_info().try_borrow_mut_lamports()? += BASE_FEE_LAMPORTS;
    **solution.to_account_info().try_borrow_mut_lamports()? += balance - BASE_FEE_LAMPORTS;
    question.amount = 0;
    solution.amount = balance - BASE_FEE_LAMPORTS;
    solution.is_solution = true;

    Ok(())
  }

  pub fn update_question(ctx: Context<UpdateQuestion>, topic: String, content: String) -> Result<()> {
    let question: &mut Account<Question> = &mut ctx.accounts.question;

    if topic.chars().count() > 50 {
      return Err(ErrorCode::TopicTooLong.into());
    }

    if content.chars().count() > 280 {
      return Err(ErrorCode::ContentTooLong.into());
    }

    question.topic = topic;
    question.content = content;

    Ok(())
  }

  // pub fn delete_question(_ctx: Context<DeleteQuestion>) -> Result<()> {
  //   Ok(())
  // }

  pub fn submit_answer(
    ctx: Context<SubmitAnswer>,
    target_question: Pubkey,
    target_author: Pubkey,
    content: String,
  ) -> Result<()> {
    let answer: &mut Account<Answer> = &mut ctx.accounts.answer;
    let author: &Signer = &ctx.accounts.author;
    let clock: Clock = Clock::get().unwrap();

    if content.chars().count() > 280 {
      return Err(ErrorCode::ContentTooLong.into());
    }

    answer.author = *author.key;
    answer.target_question = target_question;
    answer.target_author = target_author;
    answer.timestamp = clock.unix_timestamp;
    answer.content = content;

    Ok(())
  }

  pub fn update_answer(ctx: Context<UpdateAnswer>, content: String) -> Result<()> {
    let answer: &mut Account<Answer> = &mut ctx.accounts.answer;

    if content.chars().count() > 280 {
      return Err(ErrorCode::ContentTooLong.into())
    }

    answer.content = content;
    Ok(())
  }

  pub fn delete_answer(_ctx: Context<DeleteAnswer>) -> Result<()> {
    Ok(())
  }

  pub fn redeem_reward(ctx: Context<RedeemReward>) -> Result<()> {
    let answer: &mut Account<Answer> = &mut ctx.accounts.answer;
    let author: &Signer = &ctx.accounts.author;

    let balance = answer.amount;
    // Redeem reward when answer is selected as solution
    **answer.to_account_info().try_borrow_mut_lamports()? -= balance;
    **author.to_account_info().try_borrow_mut_lamports()? += balance;
    answer.amount = 0;
    Ok(())
  }
}


#[account]
pub struct Question {
  pub author: Pubkey,
  pub timestamp: i64,
  pub solution: Pubkey,
  pub topic: String,
  pub content: String,
  pub amount: u64,
}

#[account]
pub struct Answer {
  pub author: Pubkey,
  pub timestamp: i64,
  pub target_question: Pubkey,
  pub target_author: Pubkey,
  pub content: String,
  pub amount: u64,
  pub is_solution: bool
}

#[derive(Accounts)]
pub struct AskQuestion<'info> {
  #[account(init, payer = author, space = Question::LEN)]
  pub question: Account<'info, Question>,
  #[account(mut)]
  pub author: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SelectSolution<'info> {
  #[account(mut, has_one = author)]
  pub question: Account<'info, Question>,
  #[account(mut)]
  pub answer: Account<'info, Answer>,
  #[account(mut)]
  pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateQuestion<'info> {
  // has_one: checks that the author in question is similar to the current question
  #[account(mut, has_one = author)]
  pub question: Account<'info, Question>,
  pub author: Signer<'info>,
}

// #[derive(Accounts)]
// pub struct DeleteQuestion<'info> {
//   #[account(mut, has_one = author, close = author)]
//   // has_one: only allows author to do this | close: transfers the lamports to author after closing the account
//   pub question: Account<'info, Question>,
//   pub author: Signer<'info>,
// }

#[derive(Accounts)]
pub struct SubmitAnswer<'info> {
  #[account(init, payer = author, space = Answer::LEN)]
  pub answer: Account<'info, Answer>,
  #[account(mut)]
  pub author: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAnswer<'info> {
  #[account(mut, has_one = author)]
  pub answer: Account<'info, Answer>,
  pub author: Signer<'info>
}

#[derive(Accounts)]
pub struct DeleteAnswer<'info> {
  #[account(mut, constraint = !answer.is_solution && ((answer.author == author.key() || answer.target_author == author.key()) && answer.author == receiver.key()), close = receiver)]
  pub answer: Account<'info, Answer>,
  pub author: Signer<'info>,
  #[account(mut)]
  pub receiver: SystemAccount<'info>,
}

#[derive(Accounts)]
pub struct RedeemReward<'info> {
  #[account(mut, has_one = author)]
  pub answer: Account<'info, Answer>,
  #[account(mut)]
  pub author: Signer<'info>
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string
const MAX_TOPIC_LENGTH: usize = 50 * 4; // 50 chars max
const MAX_CONTENT_LENGTH: usize = 280 * 4; // 280 chars max
const AMOUNT_LENGTH: usize = 8;
const BOOL_LENGTH: usize = 1;

impl Question {
  const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author
        + TIMESTAMP_LENGTH // Timestamp
        + PUBLIC_KEY_LENGTH // Solution
        + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH // Topic
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH // Content
        + AMOUNT_LENGTH; // Amount
}

impl Answer {
  const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Source question
        + PUBLIC_KEY_LENGTH // Source question author
        + PUBLIC_KEY_LENGTH // Author
        + TIMESTAMP_LENGTH // Timestamp
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH // Content
        + AMOUNT_LENGTH // Amount
        + BOOL_LENGTH; // Boolean recording if it is the solution
}
