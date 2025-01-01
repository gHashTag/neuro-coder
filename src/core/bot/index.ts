import { Bot } from "grammy"
import { MyContext } from "../../utils/types"

const bot = new Bot<MyContext>(process.env.BOT_TOKEN || "")

export default bot
