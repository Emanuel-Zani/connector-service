# Connector Service - Webhook

The **Connector Service** is an application developed in Node.js that acts as an intermediary between the Telegram API and the Bot Service. This service is responsible for receiving messages from Telegram users, validating users, and sending the messages to the Bot Service for processing.

## Summary

The Telegram bot facilitates the addition of expenses into a database. Users send short messages (e.g., "Pizza 20 bucks"), and the bot handles the rest. The system is divided into two services:

> > > > > > > 15c2ddf296b221eb306541d2e3cb8b24bd1aee48

- **BotService**: Developed in Python, this service analyzes incoming messages to identify and extract expense details before persisting these details into the database.
- **Connector Service**: Built using Node.js, this service manages the reception of messages from users, forwards these messages to the Bot Service for processing, and sends appropriate responses back to the users via Telegram.

## Requirements

- The bot must recognize a whitelist of Telegram users sourced from the database. Any user not listed should be ignored.
- The bot must verify the content of received messages to distinguish expense-related inputs from non-expense texts.
- Expenses should be automatically categorized into predefined categories: Housing, Transportation, Food, Utilities, Insurance, Medical/Healthcare, Savings, Debt, Education, Entertainment, and Other.
- The bot should reply with "[Category] expense added ✅" upon successful addition of an expense.
- Setting up a new bot should not require any code changes.

## Installation

### Prerequisites

Make sure you have the following installed on your system:

- Node.js (LTS)
- npm (Node Package Manager)
- Access to a PostgreSQL database server (Supabase is recommended)

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <REPOSITORY_URL>
   cd <REPOSITORY_NAME>
   ```

2. **Install dependencies**

   Run the following command to install the necessary dependencies:

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root of the project and add the following variables:

   ```plaintext
   SUPABASE_URL=<YOUR_SUPABASE_URL>
   SUPABASE_API_KEY=<YOUR_SUPABASE_API_KEY>
   TELEGRAM_BOT_TOKEN=<YOUR_TELEGRAM_BOT_TOKEN>
   BOT_SERVICE_URL=<BOT_SERVICE_URL>
   PORT=3000
   ```

4. **Start the server**

   Run the following command to start the server:

   ```bash
   npm start
   ```

   The service will be available at `http://localhost:3000`.

## Usage

- To receive messages, set up a webhook in Telegram using your server's URL and the `/webhook` endpoint.
- Ensure that users are on the whitelist in the database to interact with the bot.

## Database Structure

Below are the definitions for the necessary tables in the database:

### `users` Table

```sql
CREATE TABLE users (
  "id" SERIAL PRIMARY KEY,
  "telegram_id" text UNIQUE NOT NULL
);
```

### `expenses` Table

```sql
CREATE TABLE expenses (
  "id" SERIAL PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES users("id"),
  "description" text NOT NULL,
  "amount" money NOT NULL,
  "category" text NOT NULL,
  "added_at" timestamp NOT NULL
);
```

## Submission

- The complete code must be hosted in a publicly accessible GitHub repository.
- It is recommended to deploy the services to Vercel, Railway, or any similar PaaS for easier testing.
- Supabase is a good option for PostgreSQL hosting with a free tier.
