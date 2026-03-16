import { prisma } from "@/lib/prisma";


async function main() {
  const products = await prisma.productHistory.findMany()

  if (products.length === 0) {
    console.log("Nenhum produto encontrado. Crie um produto na interface primeiro.")
    return
  }

  for (const product of products) {
    let currentPrice = product.price || Math.floor(Math.random() * 5000) + 1000

    for (let i = 90; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const changePercent = (Math.random() - 0.5) * 0.05
      currentPrice = currentPrice * (1 + changePercent)

      await prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: Number(currentPrice.toFixed(2)),
          createdAt: date,
        }
      })
    }
  }

  console.log("Dados fictícios gerados com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })