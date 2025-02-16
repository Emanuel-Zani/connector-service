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
