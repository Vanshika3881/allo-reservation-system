import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.reservation.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.warehouse.deleteMany()

  const warehouse1 = await prisma.warehouse.create({
    data: {
      name: 'Mumbai Warehouse',
      location: 'Mumbai',
    },
  })

  const warehouse2 = await prisma.warehouse.create({
    data: {
      name: 'Delhi Warehouse',
      location: 'Delhi',
    },
  })

  const iphone = await prisma.product.create({
    data: {
      name: 'iPhone 15',
      description: 'Apple smartphone',
    },
  })

  const macbook = await prisma.product.create({
    data: {
      name: 'MacBook Pro',
      description: 'Apple laptop',
    },
  })

  const airpods = await prisma.product.create({
    data: {
      name: 'AirPods Pro',
      description: 'Wireless earbuds',
    },
  })

  await prisma.inventory.createMany({
    data: [
      {
        productId: iphone.id,
        warehouseId: warehouse1.id,
        totalQuantity: 10,
      },
      {
        productId: iphone.id,
        warehouseId: warehouse2.id,
        totalQuantity: 5,
      },
      {
        productId: macbook.id,
        warehouseId: warehouse1.id,
        totalQuantity: 7,
      },
      {
        productId: airpods.id,
        warehouseId: warehouse2.id,
        totalQuantity: 20,
      },
    ],
  })

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })