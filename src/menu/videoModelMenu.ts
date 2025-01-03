import { Markup } from "telegraf"

// Создаем клавиатуру для выбора модели
export const videoModelKeyboard = Markup.keyboard([
  [Markup.button.callback("Minimax", "minimax"), Markup.button.callback("Haiper", "haiper")],
  [Markup.button.callback("Ray", "ray"), Markup.button.callback("I2VGen-XL", "i2vgen-xl")],
])
