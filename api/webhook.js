import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

// Configure Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

// Configure Telegram API
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
const TELEGRAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL; // Webhook URL from .env

// BotService URL (configurable from .env)
const BOT_SERVICE_URL = process.env.BOT_SERVICE_URL || "http://localhost:5000";

// Function to set the webhook with Telegram
async function setTelegramWebhook() {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        url: TELEGRAM_WEBHOOK_URL, // Use the webhook URL from .env
      }
    );
    if (response.data.ok) {
      console.log("Webhook set successfully");
    } else {
      console.error("Failed to set webhook:", response.data.description);
    }
  } catch (error) {
    console.error("Error setting webhook:", error.message);
  }
}

// Call setTelegramWebhook when the service starts
setTelegramWebhook();

// Function to handle webhook requests
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const message = req.body.message;
      if (!message || !message.from || !message.text) {
        return res.status(400).send("Invalid request format");
      }

      const telegramId = message.from.id;
      const text = message.text;

      // Check if the user is authorized
      const isUserValid = await checkUserInDatabase(telegramId);
      if (!isUserValid) {
        return res.status(403).send("User not authorized");
      }

      // Send the message to BotService for processing
      const response = await axios.post(`${BOT_SERVICE_URL}/process-message`, {
        userId: telegramId, // Using telegramId as userId
        telegramId,
        text,
      });

      // If processing was successful, get the response and send it to Telegram
      if (response.data.status === "success") {
        const confirmationMessage = response.data.message; // "[Category] expense added ✅"
        await sendTelegramMessage(telegramId, confirmationMessage);
      } else {
        await sendTelegramMessage(
          telegramId,
          "Error: Unable to process the message."
        );
      }

      res.status(200).send("Message processed successfully");
    } catch (error) {
      console.error(
        "Error processing message:",
        error.response?.data || error.message
      );

      if (typeof telegramId !== "undefined") {
        await sendTelegramMessage(
          telegramId,
          "Internal error. Please try again later."
        );
      }

      res.status(500).send("Internal server error");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}

// Function to check if the user exists in the Supabase database
async function checkUserInDatabase(telegramId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("telegram_id")
      .eq("telegram_id", telegramId)
      .single();

    if (error) {
      console.error("Error fetching user:", error.message);
      return false;
    }

    return data !== null; // Returns true if the user exists
  } catch (error) {
    console.error("Database error:", error.message);
    return false;
  }
}

// Function to send messages to Telegram
async function sendTelegramMessage(chatId, text) {
  try {
    await axios.post(TELEGRAM_API_URL, {
      chat_id: chatId,
      text: text,
    });
  } catch (error) {
    console.error(
      "Error sending message to Telegram:
