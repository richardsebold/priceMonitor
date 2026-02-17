import { Telegraf } from "telegraf";
import { message } from 'telegraf/filters'

const bot = new Telegraf(process.env.BOT_TOKEN as string);


export async function sendTelegramMessage() {
   await bot.telegram.sendMessage("6776231882", "Hello, this is a message from the bot!");
   console.log("Alerta enviado com sucesso!");
}





bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
