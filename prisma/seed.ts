/**
 * Seed completo — datos de ejemplo para testear todas las tablas
 * Crear despues de hacer sign-up
 *
 * Uso:
 *   bun run db:seed                    #seed demo standalone (crea usuario demo)
 *   USER_EMAIL=x@x.com bun run db:seed # seed datos de usuario existente
 *
 * tablas seeded:
 *   Contact, Conversation, BotText,
 *   BotList, BotListRow, Service, Availability, Appointment
 */

import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔧 Seed completo — todas las tablas\n')

  // ============================================================
  // 4. BotTexts
  // ============================================================
  const texts = [
    {
      key: 'welcome_message',
      value: '¡Hola! Bienvenido 👋',
      triggers: [
        'hola',
        'Hola',
        'hello',
        'hi',
        'hey',
        'hey!',
        'hola!',
        'holaa',
        'holaaa!',
        'holaaa!!'
      ]
    },
    {
      key: 'menu',
      value: 'Usá el menú para navegar',
      triggers: ['menu']
    },
    {
      key: 'help',
      value: 'Escribí "ayuda" para ver opciones',
      triggers: ['ayuda', 'help']
    },
    {
      key: 'button',
      value: '¡Gracias! Te respondemos pronto',
      triggers: ['boton', 'button']
    }
  ]

  const bot = await prisma.bot.findFirst()

  if (!bot) {
    throw new Error('No se encontró ningún bot')
  }

  for (const t of texts) {
    await prisma.botText.upsert({
      where: { key_bot_id: { key: t.key, bot_id: bot.id } },
      update: { value: t.value, triggers: t.triggers },
      create: {
        key: t.key,
        value: t.value,
        triggers: t.triggers,
        bot_id: bot.id
      }
    })
  }
  console.log(`✅ BotTexts: ${texts.length}`)

  // ============================================================
  // 5. BotLists + BotListRows
  // ============================================================
  const lists = [
    {
      key: 'main_menu',
      header: 'Menú Principal',
      body: '¿Qué querés hacer hoy?',
      button_label: 'Ver opciones',
      footer: 'Te ayudamos 😊',
      section_title: 'Opciones',
      rows: [
        {
          id_key: 'opt_appointment',
          title: 'Sacar turno',
          description: 'Reservá tu turno',
          order: 1,
          flow: 'appointment'
        },
        {
          id_key: 'opt_services',
          title: 'Ver servicios',
          description: 'Conocé lo que ofrecemos',
          order: 2,
          flow: null
        },
        {
          id_key: 'opt_cancel',
          title: 'Cancelar turno',
          description: 'Cancelá o reagendá',
          order: 3,
          flow: 'cancellation'
        }
      ]
    },
    {
      key: 'services_menu',
      header: 'Nuestros Servicios',
      body: 'Elegí un servicio',
      button_label: 'Ver más',
      footer: null,
      section_title: 'Servicios',
      rows: [
        {
          id_key: 'svc_corte',
          title: 'Corte de pelo',
          description: '45 min',
          order: 1,
          flow: 'appointment'
        },
        {
          id_key: 'svc_barba',
          title: 'Arreglo de barba',
          description: '30 min',
          order: 2,
          flow: 'appointment'
        },
        {
          id_key: 'svc_tratamiento',
          title: 'Tratamiento capilar',
          description: '60 min',
          order: 3,
          flow: 'appointment'
        }
      ]
    }
  ]

  for (const listData of lists) {
    const { rows, key: list_key, ...rest } = listData
    const list = await prisma.botList.upsert({
      where: { list_key_bot_id: { list_key, bot_id: bot.id } },
      update: {},
      create: { ...rest, list_key, bot_id: bot.id }
    })

    for (const row of rows) {
      await prisma.botListRow.upsert({
        where: { id_key_list_id: { id_key: row.id_key, list_id: list.id } },
        update: {},
        create: { ...row, list_id: list.id }
      })
    }
    console.log(`✅ BotList "${listData.key}": ${rows.length} rows`)
  }

  // ============================================================
  // 6. Services + Availabilities
  // ============================================================
  const services = [
    {
      name: 'Corte de pelo',
      description: 'Corte clásico o moderno',
      duration_minutes: 45
    },
    {
      name: 'Arreglo de barba',
      description: 'Perfilado y diseño',
      duration_minutes: 30
    },
    {
      name: 'Tratamiento capilar',
      description: 'Hidratación y nutrición',
      duration_minutes: 60
    }
  ]

  for (const svc of services) {
    let service = await prisma.service.findFirst({
      where: { name: svc.name, bot_id: bot.id }
    })

    if (!service) {
      service = await prisma.service.create({
        data: { ...svc, bot_id: bot.id }
      })
    }

    // Crear availability para los próximos 7 días
    for (let i = 1; i <= 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const availId = `${service.id}_${dateStr}`

      const existingAvail = await prisma.availability.findUnique({
        where: { id: availId }
      })

      if (!existingAvail) {
        await prisma.availability.create({
          data: {
            id: availId,
            service_id: service.id,
            bot_id: bot.id,
            date: new Date(dateStr),
            start_time: new Date(`${dateStr}T09:00:00`),
            end_time: new Date(`${dateStr}T18:00:00`),
            total_slots: 5,
            booked_slots: Math.floor(Math.random() * 3),
            is_blocked: false
          }
        })
      }
    }
    console.log(`✅ Service "${svc.name}" + availabilities`)
  }

  // ============================================================
  // 7. Contacts + Conversations
  // ============================================================
  const contacts = [
    { phone: '+5491112345678', name: 'Juan Pérez' },
    { phone: '+5491187654321', name: 'María García' },
    { phone: '+5491198765432', name: 'Carlos López' }
  ]

  for (const contactData of contacts) {
    const contact = await prisma.contact.upsert({
      where: {
        phone_number_bot_id: {
          phone_number: contactData.phone,
          bot_id: bot.id
        }
      },
      update: {},
      create: {
        phone_number: contactData.phone,
        name: contactData.name,
        bot_id: bot.id
      }
    })
  }

  // ============================================================
  // 8. Appointments (1 confirmado, 1 pendiente, 1 cancelado)
  // ============================================================
  const allContacts = await prisma.contact.findMany({
    where: { bot_id: bot.id }
  })
  const allServices = await prisma.service.findMany({
    where: { bot_id: bot.id }
  })
  const avail = await prisma.availability.findFirst({
    where: { bot_id: bot.id }
  })

  if (allContacts[0] && allServices[0] && avail) {
    const apptStatuses = ['CONFIRMED', 'PENDING', 'CANCELLED'] as const

    for (let i = 0; i < 3; i++) {
      await prisma.appointment.create({
        data: {
          contact_id: allContacts[0].id,
          service_id: allServices[i % allServices.length].id,
          availability_id: avail.id,
          bot_id: bot.id,
          status: apptStatuses[i],
          notes: i === 2 ? 'Se canceló por falta de tiempo' : null,
          slot_iso: new Date().toISOString()
        }
      })
    }
    console.log(`✅ Appointments: 3 (confirmed, pending, cancelled)`)
  }

  // ============================================================
  // Resumen
  // ============================================================
  console.log('\n✨ Seed completo!')
  console.log('─'.repeat(40))
  console.log(`   Bot:    ${bot.name} (${bot.id})`)
  console.log(`   Phone:  ${bot.phone_number_id}`)
  console.log(`   Texts:   ${texts.length}`)
  console.log(`   Lists:   ${lists.length}`)
  console.log(`   Services: ${services.length}`)
  console.log(`   Contacts: ${contacts.length}`)
  console.log('─'.repeat(40))
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
