# FUT Champs Insights Hub

FUT Champs Insights Hub is a modern web application designed to track, analyze, and gain deep insights into your EA Sports FC Ultimate Team Champions performance.

This tool goes beyond simple win/loss tracking, allowing you to record detailed match stats, analyze player performance, track achievements, and receive AI-powered feedback to improve your gameplay.

## ✨ Key Features

* **🏆 Current Run Tracking:** Log every game of your FUT Champions run in real-time, including score, stats, player ratings, and notes.
* **📊 In-Depth Analytics:** A full analytics dashboard to visualize your performance over time. Track key metrics like your win/loss ratio, goals for/against, xG (Expected Goals) performance, and more.
* **🤖 AI-Powered Insights:** Get personalized feedback on your performance. The AI analyzes your recorded data to identify trends, strengths, and weaknesses in your gameplay.
* **⚽ Player Performance:** Track the stats for every player in your squad across multiple runs. See who your top performers are and who's letting you down.
* **🥇 Achievement System:** Unlock achievements and hit milestones for your in-game performance (e.g., "100 Wins," "Perfect Run").
* **🔒 Secure & Synced:** Built with Supabase, all your data is securely stored and synced across your devices.
* **📱 Mobile-First Design:** Fully responsive layout, allowing you to log games and check stats easily from your phone.

## 🛠️ Tech Stack

This project is built with a modern, type-safe stack:

* **Frontend:** React (Vite) & TypeScript
* **Backend & Database:** Supabase (PostgreSQL)
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui
* **State Management:** React Query
* **Forms:** React Hook Form & Zod

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or newer)
* npm (or yarn/pnpm)
* A Supabase account

### Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/oligibbons/fut-champs-insights-hub.git](https://github.com/oligibbons/fut-champs-insights-hub.git)
    cd fut-champs-insights-hub
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    * Create a `.env` file in the root of the project.
    * Log in to your Supabase account and find your Project URL and anon key.
    * Add them to the `.env` file:
        ```env
        VITE_SUPABASE_URL=YOUR_SUPABASE_URL
        VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```

4.  **Run the Supabase migrations:**
    * Install the Supabase CLI: `npm install supabase --save-dev`
    * Link your project (you'll need your project ID): `npx supabase link --project-ref YOUR-PROJECT-ID`
    * Push the database schema: `npx supabase db push`

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).