# Wheel of Work (WOW)

[cloudflarebutton]

A playful, gamified task manager that helps you decide what to do next by spinning a wheel, combined with a Pomodoro timer to keep you focused.

Wheel of Work (WOW) is a delightful and motivating task management application designed to combat decision fatigue and boost productivity. It combines a gamified task selector—a spinning wheel—with the structured Pomodoro technique. Users add tasks into three categories: Work, Leisure, and Creative. They can then select a 'mode' (e.g., 'Hard-Working' or 'Normal') which determines which categories are included on the wheel. A spin of the wheel randomly selects a task, which is then added to a queue. Each task in the queue is tackled in a focused Pomodoro session.

## ✨ Key Features

-   **User Accounts & Persistence**: Login and registration system to save tasks and progress across sessions.
-   **Task Categories**: Organize activities into `Work`, `Leisure`, and `Creative` categories.
-   **The Wheel System**: A spinning wheel to randomly select a task with four distinct modes:
    1.  **Hard-Working Mode**: Only `Work` tasks.
    2.  **Time-to-Work Mode**: `Work` and `Creative` tasks.
    3.  **Normal Mode**: All tasks included.
    4.  **Advanced Settings Mode**: Manually select categories and adjust probabilities.
-   **Pomodoro Workflow**: Tackle selected tasks in focused Pomodoro sessions.
-   **Task Queue**: A list of all tasks selected by the wheel.
-   **Meal Button**: A special "reward" feature to pull a leisure activity to the front of the queue.
-   **Playful UI**: A simple, colorful, and animated interface for a delightful user experience.

## 🚀 Technology Stack

-   **Frontend**: React, Vite, TypeScript, Tailwind CSS
-   **UI Components**: shadcn/ui, Framer Motion for animations, Lucide React for icons
-   **State Management**: Zustand
-   **Backend**: Cloudflare Workers, Hono
-   **Database**: Cloudflare Durable Objects for persistent state
-   **Tooling**: Bun, Wrangler CLI

## 📂 Project Structure

This project is structured as a full-stack application within a single repository.

-   `src/`: Contains the frontend React application built with Vite.
-   `worker/`: Contains the backend Cloudflare Worker API built with Hono.
-   `shared/`: Contains shared TypeScript types used by both the frontend and backend.

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/)
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up)
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated: `bunx wrangler login`

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/wheel-of-work.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd wheel-of-work
    ```
3.  **Install dependencies:**
    ```bash
    bun install
    ```

### Running in Development Mode

To start the local development server, which runs both the Vite frontend and the Wrangler backend concurrently:

```bash
bun dev
```

The application will be available at `http://localhost:3000`.

## 📦 Available Scripts

-   `bun dev`: Starts the development server.
-   `bun build`: Builds the frontend application for production.
-   `bun lint`: Lints the codebase using ESLint.
-   `bun deploy`: Deploys the application to Cloudflare Workers.

## ☁️ Deployment

This project is designed for seamless deployment to the Cloudflare ecosystem. The `deploy` script handles both building the frontend assets and publishing the worker.

1.  **Build and deploy the application:**
    ```bash
    bun deploy
    ```

2.  **Or, deploy with a single click:**

    [cloudflarebutton]