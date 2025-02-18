# Connector Service

The Connector Service is a Node.js application that acts as the interface between the Telegram API and the Bot Service. It processes incoming messages from Telegram, verifies users against a database, and forwards valid messages to the Bot Service for processing.

## Summary

This service is part of a larger system that consists of two services:
1. **Bot Service**: Developed in Python, this service analyzes incoming messages to extract expense details and stores them in a PostgreSQL database.
2. **Connector Service** (this service): Built using Node.js, it manages communication with Telegram and forwards user messages to the Bot Service.

## Features

- The service verifies if a user is in a whitelist sourced from the database.
- It handles incoming Telegram messages and processes them.
- It sends responses back to the user via Telegram, confirming whether their expense has been added.

## Requirements

- **Node.js LTS**
- **Express**: A web framework for Node.js.
- **Axios**: For making HTTP requests.
- **Supabase**: For database operations.
- **dotenv**: For loading environment variables.

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Emanuel-Zani/connector-service.git
   cd connector-service
   ```

2. **Install dependencies:**
   Ensure you have Node.js installed, then run:
   ```bash
   npm install express body-parser axios @supabase/supabase-js dotenv
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory of your project and add the following environment variables:
   ```plaintext
   SUPABASE_URL=<your_supabase_url>
   SUPABASE_API_KEY=<your_supabase_api_key>
   TELEGRAM_BOT_TOKEN=<your_telegram_bot_token>
   BOT_SERVICE_URL=<your_bot_service_url>  # Optional, defaults to "http://localhost:5000"
   ```

4. **Run the Connector Service:**
   You can start the service by running:
   ```bash
   node webhook.js
   ```

   The service will run on `http://localhost:3000`.

## How It Works

- The service listens for incoming messages on the `/webhook` endpoint.
- Upon receiving a message, it verifies the user's Telegram ID against the database.
- If the user is valid, the service forwards the message to the Bot Service for processing.
- Responses from the Bot Service are sent back to the user via Telegram.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  "id" SERIAL PRIMARY KEY,
  "telegram_id" text UNIQUE NOT NULL
);
```

### Expenses Table
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

## Error Handling

The service includes error handling for various scenarios:
- If a message does not have the required fields, it returns a `400` status with an error message.
- If a user is not authorized, it returns a `403` status.
- If there are internal server errors, it returns a `500` status.
