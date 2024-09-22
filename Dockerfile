# Используем официальный образ Node.js
FROM node:14

# Создаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код, исключая node_modules
COPY . .

# Компилируем TypeScript (если используется)
RUN npm run build

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]