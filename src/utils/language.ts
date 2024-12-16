import { Context } from "grammy"

export const isRussian = (ctx: Context) => ctx.from?.language_code === "ru"
