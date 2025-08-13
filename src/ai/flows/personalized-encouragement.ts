// src/ai/flows/personalized-encouragement.ts
'use server';

/**
 * @fileOverview A flow for generating personalized encouragement messages for habit success.
 *
 * - generateEncouragement - A function that generates personalized encouragement messages.
 * - GenerateEncouragementInput - The input type for the generateEncouragement function.
 * - GenerateEncouragementOutput - The return type for the generateEncouragement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEncouragementInputSchema = z.object({
  habitName: z.string().describe('The name of the habit.'),
  userName: z.string().describe('The name of the user.'),
  streakLength: z.number().describe('The current streak length for the habit.'),
});
export type GenerateEncouragementInput = z.infer<typeof GenerateEncouragementInputSchema>;

const GenerateEncouragementOutputSchema = z.object({
  encouragementMessage: z.string().describe('A personalized encouragement message for the user.'),
});
export type GenerateEncouragementOutput = z.infer<typeof GenerateEncouragementOutputSchema>;

export async function generateEncouragement(input: GenerateEncouragementInput): Promise<GenerateEncouragementOutput> {
  return generateEncouragementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEncouragementPrompt',
  input: {schema: GenerateEncouragementInputSchema},
  output: {schema: GenerateEncouragementOutputSchema},
  prompt: `You are a motivational coach. Generate a personalized encouragement message for {{userName}} to continue their habit of {{habitName}}. They have a current streak of {{streakLength}} days.  Keep the message short and positive.`,
});

const generateEncouragementFlow = ai.defineFlow(
  {
    name: 'generateEncouragementFlow',
    inputSchema: GenerateEncouragementInputSchema,
    outputSchema: GenerateEncouragementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
