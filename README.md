# Connector Service

This is the **Connector Service** that acts as an intermediary between the **Telegram Bot** and the **BotService**. It processes incoming messages from Telegram, validates users, and forwards the data to the **BotService** for further processing.

### Features:
- Receives messages from Telegram via a webhook.
- Checks if the user is authorized by verifying their `telegram_id` in the Supabase database.
- Forwards valid messages to the **BotService** for processing.
- Sends a confirmation message back to Telegram once the message is processed successfully.

---

## Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (version 16 or higher): [Download Node.js](https://nodejs.org/)
2. **Vercel CLI**: Install the Vercel CLI globally by running:
   ```bash
   npm install -g vercel
3. **Supabase Account**: Create a Supabase project to store user data. [Create a Supabase account](https://supabase.io/).

4. **Telegram Bot Token**: Create a bot on Telegram and obtain your bot token. [Create a Telegram bot](https://core.telegram.org/bots#3-how-do-i-create-a-bot).

---

### Configuration

1. **Create a `.env` file** in the root of the project and add the following environment variables:

   ```
   SUPABASE_URL=<your_supabase_url>
   SUPABASE_API_KEY=<your_supabase_api_key>
   TELEGRAM_BOT_TOKEN=<your_telegram_bot_token>
   BOT_SERVICE_URL=<your_bot_service_url>  # URL of the BotService (default: http://localhost:5000)
   ```

   Replace the placeholders with your actual values.

2. **Vercel Deployment**: This service is designed to run as a serverless function on Vercel. You can deploy it directly from the command line.

---

## Steps for Deployment on Vercel

1. **Log in to Vercel**:

   If you haven't logged in yet, run:
   ```bash
   vercel login
   ```

2. **Deploy the Service**:

   In the root directory of the project, run:
   ```bash
   vercel
   ```

   Follow the prompts to select your project name and confirm the settings.

3. **Set up Environment Variables**:

   - Go to the [Vercel dashboard](https://vercel.com).
   - Select your project.
   - Under **Settings**, go to **Environment Variables**.
   - Add the same environment variables you defined in the `.env` file.

4. **Webhook Configuration**:

   - After deployment, Vercel will provide a URL (e.g., `https://your-project-name.vercel.app`).
   - Set the webhook for your Telegram bot to this URL, appending `/api/webhook` (e.g., `https://your-project-name.vercel.app/api/webhook`).

---

## Dependencies

This project uses the following dependencies:

- `@supabase/supabase-js`: Supabase client for interacting with the Supabase database.
- `axios`: HTTP client for making requests to external services (e.g., Telegram API, BotService).
- `body-parser`: Middleware for parsing incoming request bodies.
- `dotenv`: Loads environment variables from the `.env` file.
- `express`: Web framework for handling HTTP requests (used in local development, but Vercel uses serverless functions).

To install the dependencies, run:
```bash
npm install
```

---

## Directory Structure

```
/connector-service
├── .env             # Environment variables (should not be pushed to GitHub)
├── api
│   └── webhook.js   # The serverless function that processes incoming webhook requests from Telegram
├── package.json     # Project metadata and dependencies
└── README.md        # This file
```

---

## Usage

After deploying, Vercel will provide a live URL for your service. You can use this URL for the webhook configuration in Telegram and verify that everything is working.

---

## Troubleshooting

- **Error: `Method Not Allowed`**: This error occurs when a non-POST request is made to the webhook. Ensure your webhook is using a POST method.
- **Error: `Internal server error`**: This can happen if there is an issue with the environment variables or the communication with Supabase or BotService. Check your logs in the Vercel dashboard for more details.
- **Unauthorized User**: If a user is not found in the Supabase database, they will receive a "User not authorized" message.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```
