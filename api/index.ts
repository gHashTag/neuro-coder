require("../src/index");

import express from "express";
import { webhookCallback } from "grammy";

import bot from "../src/core/bot";

const app = express();

const port = process.env.PORT || 3000;

console.log(port, 'port');

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(express.json());
app.use(`/api/index`, webhookCallback(bot, "express"));

export default app;