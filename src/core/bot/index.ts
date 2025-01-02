import { Telegraf, Scenes } from "telegraf"

const bot = new Telegraf<Scenes.WizardContext>(process.env.BOT_TOKEN || "")

export default bot
