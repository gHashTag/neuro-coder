import { Telegraf } from "telegraf"
import { MyContext } from "../../interfaces"

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN || "")

export default bot
