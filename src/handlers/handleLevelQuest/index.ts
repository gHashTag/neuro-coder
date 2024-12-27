import {
  handleLevel0,
  handleLevel1,
  handleLevel10,
  handleLevel11,
  handleLevel12,
  handleLevel13,
  handleLevel2,
  handleLevel3,
  handleLevel4,
  handleLevel5,
  handleLevel6,
  handleLevel7,
  handleLevel8,
  handleLevel9,
  handleQuestComplete,
  handleQuestRules,
} from "./handlers"
import { MyContext } from "../../utils/types"

export async function handleLevelQuest(ctx: MyContext, data: string) {
  if (!data.startsWith("level_")) {
    console.error("Некорректные данные:", data)
    return
  }

  if (data === "level_rules") {
    console.log("CASE: level_rules")
    await handleQuestRules(ctx)
    return
  }
  if (data === "level_complete") {
    console.log("CASE: level_complete")
    await handleQuestComplete(ctx)
    return
  }

  const levelStr = data.replace("level_", "")
  const level = parseInt(levelStr, 10)

  if (isNaN(level)) {
    console.error("Некорректный уровень:", data)
    return
  }

  switch (level) {
    case 0:
      console.log("CASE: quest_start")
      await handleLevel0(ctx)
      break
    case 1:
      console.log("CASE: level_1")
      await handleLevel1(ctx)
      break
    case 2:
      console.log("CASE: level_2")
      await handleLevel2(ctx)
      break
    case 3:
      console.log("CASE: level_3")
      await handleLevel3(ctx)
      break
    case 4:
      console.log("CASE: level_4")
      await handleLevel4(ctx)
      break
    case 5:
      console.log("CASE: level_5")
      await handleLevel5(ctx)
      break
    case 6:
      console.log("CASE: level_6")
      await handleLevel6(ctx)
      break
    case 7:
      console.log("CASE: level_7")
      await handleLevel7(ctx)
      break
    case 8:
      console.log("CASE: level_8")
      await handleLevel8(ctx)
      break
    case 9:
      console.log("CASE: level_9")
      await handleLevel9(ctx)
      break
    case 10:
      console.log("CASE: level_10")
      await handleLevel10(ctx)
      break
    case 11:
      console.log("CASE: level_11")
      await handleLevel11(ctx)
      break
    case 12:
      console.log("CASE: level_12")
      await handleLevel12(ctx)
      break
    case 13:
      console.log("CASE: level_13")
      await handleLevel13(ctx)
      break
    default:
      console.error("Неизвестный уровень:", level)
  }
}
