export const ERROR_MESSAGES = {
  USER_ID_RU: "❌ Ошибка идентификации пользователя",
  USER_ID_EN: "❌ User identification error",
}

export const SUCCESS_MESSAGES = {
  SIZE_CHANGED_RU: (size: string) =>
    `✅ Размер изображения изменен на ${size}.\nНажмите команду /neuro_photo или /text_to_image или чтобы сгенерировать изображение`,
  SIZE_CHANGED_EN: (size: string) => `✅ Image size changed to ${size}. \nClick the command /neuro_photo or /text_to_image to generate an image  `,
}

export const CHANGE_SIZE_MESSAGE = {
  RU: "Выберите размер изображения:",
  EN: "Choose image size:",
}
