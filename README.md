# Habit Buddies

Welcome to Habit Buddies, a social habit-tracking application designed to help you build better habits with the power of community and a little help from AI. Stop breaking promises to yourself; join a supportive group, track your progress, and finally make your habits stick!

## Table of Contents

- [Project Purpose](#project-purpose)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [License](#license)
- [Contact](#contact)

## Project Purpose

Habit Buddies is a prototype application built to demonstrate a modern, full-stack web application. The core idea is that building habits is easier and more fun when you do it with others. This app provides a platform for users to form groups, define shared habits, track their progress, and motivate each other through friendly competition and direct communication.

## Key Features

- **Group System**: Join existing groups or create your own based on shared goals (e.g., "Fitness Fanatics," "Bookworms United").
- **Habit Tracking**: Admins can add specific, trackable habits to a group (e.g., "Read for 15 minutes," "Morning workout").
- **Social Leaderboard**: See how you rank against your buddies in your group's weekly progress chart.
- **Direct Chat**: Communicate with other group members directly through a built-in chat feature.
- **AI-Powered Motivation**:
  - **Personalized Encouragement**: Get a motivational boost from an AI coach that uses your progress to generate personalized messages.
  - **Accountability Nudges**: Send fun, light-hearted AI-generated "nudge" messages to group members who are falling behind to encourage them.

## Tech Stack

This project is built with a modern, type-safe, and performant tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (with Google's Gemini models)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/habit-buddies.git
    cd habit-buddies
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    This project uses Genkit with Google's Gemini models for its AI features. You will need a Gemini API key.

    - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    - Create a new file named `.env.local` in the root of your project.
    - Add your API key to the `.env.local` file:
      ```
      GEMINI_API_KEY=your_api_key_here
      ```
    *Note: The `.env.local` file is included in `.gitignore` by default in Next.js and should not be committed to version control.*

### Running the Application

The application requires two processes to run concurrently: the Next.js development server and the Genkit developer UI. You will need to run the following commands in two separate terminal windows.

1.  **Terminal 1: Start the Genkit server:**
    This command starts the Genkit development server, which runs your AI flows and provides a developer UI to inspect and test them.

    ```bash
    npm run genkit:dev
    ```
    This will typically start the Genkit UI on `http://localhost:4000`.

2.  **Terminal 2: Start the Next.js development server:**
    This command starts the main web application.

    ```bash
    npm run dev
    ```
    This will start the Habit Buddies app, usually on `http://localhost:9002`.

Once both processes are running, you can open `http://localhost:9002` in your browser to use the application.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

---

© 2024 Ahmed Ibrahim ([father-hardstone](https://github.com/father-hardstone)). All Rights Reserved.