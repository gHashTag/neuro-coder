import { Bot } from "grammy"
import { MyContextWithSession } from "../../utils/types"

const bot = new Bot<MyContextWithSession>(process.env.BOT_TOKEN || "")

export default bot
