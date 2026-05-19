import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const copper = await prisma.category.findFirst({
    where: { name: 'Copper' }
  });

  if (!copper) {
    console.log("Copper category not found!");
    return;
  }

  const products = [
    "Copper bassbar",
    "Copper pipes",
    "Paper insulated copper conductors",
    "Copper sheet",
    "Copper wire"
  ];

  for (const productName of products) {
    await prisma.product.create({
      data: {
        name: productName,
        categoryId: copper.id,
        unit: 'kg',
        unitRate: 0,
      }
    });
  }

  console.log(`Added ${products.length} products under Copper!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
