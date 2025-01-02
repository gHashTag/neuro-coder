// import { Context } from "telegraf"
// import { starCost } from "../../helpers/telegramStars"
// import { buyRobokassa } from "../buy/buyRobokassa"
// import { MyContext } from "../../utils/types"

// interface BuyParams {
//   ctx: Context
//   data: string
//   isRu: boolean
// }

// // Start of Selection
// export async function handleBuy({ ctx, data, isRu }: BuyParams) {
//   try {
//     if (data === "top_up_balance") {
//       await buyRobokassa(ctx as MyContext)
//       return
//     }

//     if (data.endsWith("up_100")) {
//       const dollarAmount = (100 * starCost).toFixed(2)
//       await ctx.replyWithInvoice(
//         isRu ? "100 ⭐️" : "100 ⭐️",
//         isRu
//           ? `💬 Получите 100 звезд 🌟 Это эквивалентно $${dollarAmount} 💵\nИспользуйте звезды для различных функций нашего бота и наслаждайтесь новыми возможностями!`
//           : `💬 Receive 100 stars 🌟 This is equivalent to $${dollarAmount} 💵\nUse the stars for various features of our bot and enjoy new possibilities!`,
//         "100",
//         "XTR",
//         [{ label: "Цена", amount: 100 }],
//       )
//       return
//     }

//     if (data.endsWith("up_500")) {
//       const dollarAmount = (500 * starCost).toFixed(2)
//       await ctx.replyWithInvoice(
//         isRu ? "500 ⭐️" : "500 ⭐️",
//         isRu
//           ? `💬 Получите 500 звезд 🌟 Это эквивалентно $${dollarAmount} 💵\n💫 Используйте звезды для различных функций нашего бота и наслаждайтесь новыми возможностями!`
//           : `💬 Receive 500 stars 🌟 This is equivalent to $${dollarAmount} 💵\n💫 Use the stars for various features of our bot and enjoy new possibilities!`,
//         "500",
//         "XTR",
//         [{ label: "Цена", amount: 500 }],
//       )
//       return
//     }

//     if (data.endsWith("up_1000")) {
//       const dollarAmount = (1000 * starCost).toFixed(2)
//       await ctx.replyWithInvoice(
//         isRu ? "1000 ⭐️" : "1000 ⭐️",
//         isRu
//           ? `💬 Получите 1000 звезд 🌟 Это эквивалентно $${dollarAmount} 💵\n💫 Используйте звезды для различных функций нашего бота и наслаждайтесь новыми возможностями!`
//           : `💬 Receive 1000 stars 🌟 This is equivalent to $${dollarAmount} 💵\n💫 Use the stars for various features of our bot and enjoy new possibilities!`,
//         "1000",
//         "XTR",
//         [{ label: "Цена", amount: 1000 }],
//       )
//       return
//     }

//     if (data.endsWith("up_2000")) {
//       const dollarAmount = (2000 * starCost).toFixed(2)
//       await ctx.replyWithInvoice(
//         isRu ? "2000 ⭐️" : "2000 ⭐️",
//         isRu
//           ? `💬 Получите 2000 звезд 🌟 Это эквивалентно $${dollarAmount} 💵\n💫 Используйте звезды для различных функций нашего бота и наслаждайтесь новыми возможностями!`
//           : `💬 Receive 2000 stars 🌟 This is equivalent to $${dollarAmount} 💵\n💫 Use the stars for various features of our bot and enjoy new possibilities!`,
//         "2000",
//         "XTR",
//         [{ label: "Цена", amount: 2000 }],
//       )
//       return
//     }

//     if (data.endsWith("up_5000")) {
//       const dollarAmount = (5000 * starCost).toFixed(2)
//       await ctx.replyWithInvoice(
//         isRu ? "5000 ⭐️" : "5000 ⭐️",
//         isRu
//           ? `💬 Получите 5000 звезд 🌟 Это эквивалентно $${dollarAmount} 💵\n💫 Используйте звезды для различных функций нашего бота и наслаждайтесь новыми возможностями!`
//           : `💬 Receive 5000 stars 🌟 This is equivalent to $${dollarAmount} 💵\n💫 Use the stars for various features of our bot and enjoy new possibilities!`,
//         "5000",
//         "XTR",
//         [{ label: "Цена", amount: 5000 }],
//       )
//       return
//     }

//     if (data.endsWith("up_10000")) {
//       const dollarAmount = (10000 * starCost).toFixed(2)
//       await ctx.replyWithInvoice(
//         isRu ? "10000 ⭐️" : "10000 ⭐️",
//         isRu
//           ? `💬 Получите 10000 звезд 🌟 Это эквивалентно $${dollarAmount} 💵\n💫 Используйте звезды для различных функций нашего бота и наслаждайтесь новыми возможностями!`
//           : `💬 Receive 10000 stars 🌟 This is equivalent to $${dollarAmount} 💵\n💫 Use the stars for various features of our bot and enjoy new possibilities!`,
//         "10000",
//         "XTR",
//         [{ label: "Цена", amount: 10000 }],
//       )
//       return
//     }

//     if (data.endsWith("up_20000")) {
//       const dollarAmount = (20000 * starCost).toFixed(2)
//       await ctx.replyWithInvoice(
//         isRu ? "20000 ⭐️" : "20000 ⭐️",
//         isRu
//           ? `💬 Получите 20000 звезд 🌟 Это эквивалентно $${dollarAmount} 💵\n💫 Используйте звезды для различных функций нашего бота и наслаждайтесь новыми возможностями!`
//           : `💬 Receive 20000 stars 🌟 This is equivalent to $${dollarAmount} 💵\n💫 Use the stars for various features of our bot and enjoy new possibilities!`,
//         "20000",
//         "XTR",
//         [{ label: "Цена", amount: 20000 }],
//       )
//       return
//     }

//     if (data.endsWith("up_50000")) {
//       const dollarAmount = (50000 * starCost).toFixed(2)
//       await ctx.replyWithInvoice(
//         isRu ? "50000 ⭐️" : "50000 ⭐️",
//         isRu
//           ? `💬 Получите 50000 звезд 🌟 Это эквивалентно $${dollarAmount} 💵\n💫 Используйте звезды для различных функций нашего бота и наслаждайтесь новыми возможностями!`
//           : `💬 Receive 50000 stars 🌟 This is equivalent to $${dollarAmount} 💵\n💫 Use the stars for various features of our bot and enjoy new possibilities!`,
//         "50000",
//         "XTR",
//         [{ label: "Цена", amount: 50000 }],
//       )
//       return
//     }

//     if (data.endsWith("up_100000")) {
//       const dollarAmount = (100000 * starCost).toFixed(2)
//       await ctx.replyWithInvoice(
//         isRu ? "100000 ⭐️" : "100000 ⭐️",
//         isRu
//           ? `💬 Получите 100000 звезд 🌟 Это эквивалентно $${dollarAmount} 💵\n💫 Используйте звезды для различных функций нашего бота и наслаждайтесь новыми возможностями!`
//           : `💬 Receive 100000 stars 🌟 This is equivalent to $${dollarAmount} 💵\n💫 Use the stars for various features of our bot and enjoy new possibilities!`,
//         "100000",
//         "XTR",
//         [{ label: "Цена", amount: 100000 }],
//       )
//       return
//     }
//   } catch (error) {
//     console.error("Error in handleBuy:", error)
//     throw error
//   }
// }
