// 'use server'

// import { Telegraf } from "telegraf";
// import { message } from 'telegraf/filters'

// const bot = new Telegraf(process.env.BOT_TOKEN as string);


// export async function sendTelegramMessage() {
   
//    console.log("Alerta enviado com sucesso!");
// }


// bot.start((ctx) => ctx.reply("Bem vindo! Você receberá alertas de preços aqui."));
// bot.help((ctx) => ctx.reply("Está com problemas? Peça ajuda no whatsapp: +55 47 99771-4395"));
// bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
// bot.hears("oi", (ctx) => ctx.reply("Olá! Como posso ajudar?"));
// bot.launch();

// // Enable graceful stop
// process.once("SIGINT", () => bot.stop("SIGINT"));
// process.once("SIGTERM", () => bot.stop("SIGTERM"));
