import { Markup } from "telegraf"

export const cancelMenu = (isRu: boolean) => Markup.keyboard([[Markup.button.text(isRu ? "Отмена" : "Cancel")]]).resize()
