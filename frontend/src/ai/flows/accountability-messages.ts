// src/ai/flows/accountability-messages.ts
'use server';

/**
 * @fileOverview A flow for generating accountability messages based on user's habit tracking data.
 *
 * - generateAccountabilityMessage - A function that generates accountability messages.
 * - AccountabilityMessageInput - The input type for the generateAccountabilityMessage function.
 * - AccountabilityMessageOutput - The return type for the generateAccountabilityMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AccountabilityMessageInputSchema = z.object({
  userName: z.string().describe('The name of the user.'),
  habitName: z.string().describe('The name of the habit.'),
  groupName: z.string().describe('The name of the group.'),
  missedDays: z.number().describe('The number of days the habit was missed.'),
});
export type AccountabilityMessageInput = z.infer<
  typeof AccountabilityMessageInputSchema
>;

const AccountabilityMessageOutputSchema = z.object({
  message: z.string().describe('The generated accountability message.'),
});
export type AccountabilityMessageOutput = z.infer<
  typeof AccountabilityMessageOutputSchema
>;

export async function generateAccountabilityMessage(
  input: AccountabilityMessageInput
): Promise<AccountabilityMessageOutput> {
  return accountabilityMessageFlow(input);
}

const accountabilityMessagePrompt = ai.definePrompt({
  name: 'accountabilityMessagePrompt',
  input: {schema: AccountabilityMessageInputSchema},
  output: {schema: AccountabilityMessageOutputSchema},
  prompt: `You are a helpful assistant that generates accountability messages for users who are not keeping up with their habits in a group setting.

  Given the following information, generate a playful and engaging accountability message for the user's group:

  User Name: {{{userName}}}
  Habit Name: {{{habitName}}}
  Group Name: {{{groupName}}}
  Missed Days: {{{missedDays}}}

  The message should be humorous and motivating, encouraging the user to get back on track. Focus on the group dynamic and how their participation affects the group.
  Make sure the message does not sound too harsh, and is light-hearted.
  The message should be less than 100 words.
  `,
});

const accountabilityMessageFlow = ai.defineFlow(
  {
    name: 'accountabilityMessageFlow',
    inputSchema: AccountabilityMessageInputSchema,
    outputSchema: AccountabilityMessageOutputSchema,
  },
  async input => {
    const {output} = await accountabilityMessagePrompt(input);
    return output!;
  }
);
