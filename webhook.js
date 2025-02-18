import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
const BOT_SERVICE_URL = process.env.BOT_SERVICE_URL || "http://localhost:5000";

// Crear la aplicación Express
const app = express();
app.use(bodyParser.json());

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Welcome to the Connector Service!");
});

// Webhook de Telegram
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.message;
    if (!message || !message.from || !message.text) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    const telegramId = message.from.id;
    const text = message.text;

    // Verificar si el usuario está en la base de datos
    const isUserValid = await checkUserInDatabase(telegramId);
    if (!isUserValid) {
      console.warn(`Access denied for user ${telegramId}`);
      await sendTelegramMessage(
        telegramId,
        "You are not authorized to use this bot."
      );
      return res.status(403).json({ error: "User not authorized" });
    }

    // Enviar mensaje al BotService
    const response = await axios.post(`${BOT_SERVICE_URL}/process-message`, {
      userId: telegramId, // Se elimina telegramId redundante
      text,
    });

    if (response.data.status === "success") {
      await sendTelegramMessage(telegramId, response.data.message);
    } else {
      await sendTelegramMessage(telegramId, "Error processing your request.");
    }

    res.status(200).json({ message: "Message processed successfully" });
  } catch (error) {
    console.error(
      "Error processing message:",
      error.response?.data || error.message
    );
    await sendTelegramMessage(
      telegramId,
      "Internal error. Please try again later."
    );
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verificar si el usuario está en la base de datos
async function checkUserInDatabase(telegramId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id") // Solo seleccionamos ID para optimizar la consulta
      .eq("telegram_id", telegramId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        console.warn(`User not found: ${telegramId}`);
        return false;
      }
      console.error("Supabase query error:", error.message);
      throw new Error("Database error");
    }

    return !!data;
  } catch (error) {
    console.error("Exception in checkUserInDatabase:", error.message);
    return false;
  }
}

// Enviar mensajes a Telegram
async function sendTelegramMessage(chatId, text) {
  try {
    await axios.post(TELEGRAM_API_URL, { chat_id: chatId, text: text });
  } catch (error) {
    console.error(
      "Error sending Telegram message:",
      error.response?.data || error.message
    );
  }
}

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
