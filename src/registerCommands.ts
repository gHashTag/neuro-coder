import { Telegraf, Scenes, session } from "telegraf"
import { MyContext, MySession } from "./interfaces"

import { startCommand } from "./commands/startCommand"
import { neuroQuestCommand } from "./commands/neuroQuestCommand"

import { topUpBalanceCommand } from "./commands/topUpBalanceCommand"
import { balanceCommand } from "./commands/balanceCommand"

import { avatarWizard, emailWizard, imageToPromptWizard, improvePromptWizard, textPromptToImageWizard } from "./scenes"
// import { subscriptionMiddleware } from "./middleware/subscription"

import { setupLevelHandlers } from "handlers/setupLevelHandlers"
import { menuCommand } from "commands/menuCommand"
import { inviteCommand } from "commands/inviteCommand"

import { priceCommand } from "commands/priceCommand"
import myComposer from "hearsHandlers"

export const startScene = new Scenes.WizardScene<MyContext>("startCommand", startCommand)
export const neuroQuestScene = new Scenes.WizardScene<MyContext>("neuroQuestCommand", neuroQuestCommand)
export const menuScene = new Scenes.WizardScene<MyContext>("menuCommand", menuCommand)
export const balanceScene = new Scenes.WizardScene<MyContext>("balanceCommand", balanceCommand)
export const topUpBalanceScene = new Scenes.WizardScene<MyContext>("topUpBalanceCommand", topUpBalanceCommand)

export const stage = new Scenes.Stage<MyContext>([
  startScene,
  neuroQuestScene,
  menuScene,
  balanceScene,
  topUpBalanceScene,
  avatarWizard,
  imageToPromptWizard,
  emailWizard,
  textPromptToImageWizard,
  menuScene,
  improvePromptWizard,
])

export function registerCommands(bot: Telegraf<MyContext>) {
  bot.use(
    session({
      defaultSession: (): MySession => ({
        selectedModel: "",
        prompt: "",
      }),
    }),
  )

  // bot.use(subscriptionMiddleware as Middleware<MyContext>)

  setupLevelHandlers(bot as Telegraf<MyContext>)

  // Регистрация команд
  myComposer.command("start", async (ctx) => {
    console.log("CASE: start")
    await neuroQuestCommand(ctx)
  })

  startScene.on("message", (ctx) => {
    console.log("CASE: startScene", ctx.message)
  })

  neuroQuestScene.on("message", (ctx) => {
    console.log("CASE: neuroQuestScene", ctx.message)
  })

  myComposer.command("menu", async (ctx) => {
    console.log("CASE: myComposer.command menu")
    await menuCommand(ctx)
  })

  myComposer.command("invite", async (ctx) => {
    console.log("CASE: invite")
    await inviteCommand(ctx)
  })

  myComposer.command("buy", async (ctx) => {
    await ctx.scene.enter("emailWizard")
  })

  myComposer.command("balance", (ctx) => balanceCommand(ctx))

  myComposer.command("help", async (ctx) => {
    await neuroQuestCommand(ctx)
  })

  myComposer.command("price", async (ctx) => {
    await priceCommand(ctx)
  })
}
