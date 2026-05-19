import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete all existing products and categories
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  const metals = ['Copper', 'Aluminium', 'Brass', 'Zinc'];

  for (const metal of metals) {
    await prisma.category.create({
      data: {
        name: metal,
        copperContentPct: 0,
        makingChargePerKg: 0,
        marginPct: 0,
        unitRate: 0, // Default 0
      }
    });
  }

  console.log('Seeded 4 main categories:', metals.join(', '));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
