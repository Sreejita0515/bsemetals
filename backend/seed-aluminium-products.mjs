import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const aluminium = await prisma.category.findFirst({
    where: { name: 'Aluminium' }
  });

  if (!aluminium) {
    console.log("Aluminium category not found!");
    return;
  }

  // Adding the requested items under Aluminium
  const products = [
    "Aluminium bassbar",
    "Aluminium pipes",
    "Paper insulated aluminium conductors",
    "Aluminium sheet",
    "Aluminium wire"
  ];

  for (const productName of products) {
    await prisma.product.create({
      data: {
        name: productName,
        categoryId: aluminium.id,
        unit: 'kg',
        unitRate: 0,
      }
    });
  }

  console.log(`Added ${products.length} products under Aluminium!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
