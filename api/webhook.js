import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Configurar supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
const BOT_SERVICE_URL = process.env.BOT_SERVICE_URL || "http://localhost:5000";

// Crear la aplicación Express
const app = express();
app.use(bodyParser.json());

// Ruta para manejar los mensajes de Telegram
app.post("/webhook", async (req, res) => {
  if (req.method === "POST") {
    try {
      const message = req.body.message;
      if (!message || !message.from || !message.text) {
        return res.status(400).send("Invalid request format");
      }

      const telegramId = message.from.id;
      const text = message.text;

      // Verificar si el usuario está autorizado
      const isUserValid = await checkUserInDatabase(telegramId);
      if (!isUserValid) {
        return res.status(403).send("User not authorized");
      }

      // Enviar el mensaje al BotService para su procesamiento
      const response = await axios.post(`${BOT_SERVICE_URL}/process-message`, {
        userId: telegramId,
        telegramId,
        text,
      });

      if (response.data.status === "success") {
        const confirmationMessage = response.data.message;
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
});

// Función para verificar si el usuario existe en la base de datos de Supabase
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

    return data !== null;
  } catch (error) {
    console.error("Database error:", error.message);
    return false;
  }
}

// Función para enviar mensajes a Telegram
async function sendTelegramMessage(chatId, text) {
  try {
    await axios.post(TELEGRAM_API_URL, {
      chat_id: chatId,
      text: text,
    });
  } catch (error) {
    console.error(
      "Error sending message to Telegram:",
      error.response?.data || error.message
    );
  }
}

// Exportar la función para Vercel
export default app;
