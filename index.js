import 'dotenv/config'
import { Telegraf, Markup } from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN)

const sessions = new Map()

const menu = () =>
  Markup.keyboard([
    ['📚 Referat', '📊 Prezentatsiya'],
    ['📄 Kurs ishi'],
    ['💰 Narxlar', '📞 Operator']
  ]).resize()

const cancelBtn = () =>
  Markup.keyboard([['❌ Bekor qilish']]).resize()

const PRICE_TEXT =
`💰 Narxlar:

📚 Referat — 30 000 so'mdan
📊 Prezentatsiya — 40 000 so'mdan
📄 Kurs ishi — 80 000 so'mdan

Aniq narx mavzu va muddatga qarab belgilanadi.`

const steps = [
  { key: 'topic', q: '1️⃣ Mavzu nima?' },
  { key: 'size', q: '2️⃣ Necha bet yoki slayd?' },
  { key: 'deadline', q: '3️⃣ Qachonga kerak?' },
  { key: 'contact', q: '4️⃣ Telefon yoki Telegram username?' }
]

function startOrder(ctx, service) {
  sessions.set(ctx.from.id, { step: 0, service, data: {} })
  ctx.reply(`✅ Tanlandi: ${service}\n\n${steps[0].q}`, cancelBtn())
}

bot.start((ctx) => {
  ctx.reply(
    `Assalomu alaykum 👋

Referat, prezentatsiya va kurs ishlarini tayyorlab beramiz.

Tugmalardan birini tanlang 👇`,
    menu()
  )
})

bot.command('id', (ctx) => {
  ctx.reply(`Sizning ID: ${ctx.from.id}`)
})

bot.hears('💰 Narxlar', (ctx) => {
  ctx.reply(PRICE_TEXT, menu())
})

bot.hears('📞 Operator', (ctx) => {
  ctx.reply('Operator tez orada javob beradi.', menu())
})

bot.hears('📚 Referat', (ctx) => startOrder(ctx, 'Referat'))
bot.hears('📊 Prezentatsiya', (ctx) => startOrder(ctx, 'Prezentatsiya'))
bot.hears('📄 Kurs ishi', (ctx) => startOrder(ctx, 'Kurs ishi'))

bot.hears('❌ Bekor qilish', (ctx) => {
  sessions.delete(ctx.from.id)
  ctx.reply('Bekor qilindi.', menu())
})

bot.on('text', async (ctx) => {
  const s = sessions.get(ctx.from.id)

  if (!s) return

  const stepObj = steps[s.step]
  s.data[stepObj.key] = ctx.message.text

  s.step += 1

  if (s.step < steps.length) {
    sessions.set(ctx.from.id, s)
    return ctx.reply(steps[s.step].q, cancelBtn())
  }

  sessions.delete(ctx.from.id)

  const order =
`🆕 Yangi buyurtma

Xizmat: ${s.service}
Mavzu: ${s.data.topic}
Hajm: ${s.data.size}
Muddat: ${s.data.deadline}
Aloqa: ${s.data.contact}

Mijoz: ${ctx.from.first_name}
ID: ${ctx.from.id}`

  const adminId = Number(process.env.ADMIN_ID)

  if (adminId) {
    await bot.telegram.sendMessage(adminId, order)
  }

  ctx.reply(
    '✅ Buyurtma qabul qilindi. Operator tez orada javob beradi.',
    menu()
  )
})

bot.launch()
bot.on('document', async (ctx) => {

    const adminId = Number(process.env.ADMIN_ID)
  
    if (adminId) {
  
      await ctx.forwardMessage(adminId)
  
      await bot.telegram.sendMessage(
        adminId,
        `📎 Mijoz fayl yubordi
  
  Ismi: ${ctx.from.first_name}
  Username: @${ctx.from.username || "yo'q"}
  ID: ${ctx.from.id}`
      )
  
    }
  
  })

console.log('Bot ishlayapti...')