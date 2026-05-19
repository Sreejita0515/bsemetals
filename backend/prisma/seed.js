import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding database...');

  // 1. Clear existing database entries
  await prisma.quoteItem.deleteMany({});
  await prisma.quoteRequest.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.lMERate.deleteMany({});

  console.log('Cleaned old records.');

  // 2. Create LME Rate History for the last 7 days (including today, May 19, 2026)
  const lmeRates = [
    { date: '2026-05-13', ratePerKg: 728.50, createdBy: 'admin-uid' },
    { date: '2026-05-14', ratePerKg: 731.00, createdBy: 'admin-uid' },
    { date: '2026-05-15', ratePerKg: 735.20, createdBy: 'admin-uid' },
    { date: '2026-05-16', ratePerKg: 734.00, createdBy: 'admin-uid' },
    { date: '2026-05-17', ratePerKg: 738.50, createdBy: 'admin-uid' },
    { date: '2026-05-18', ratePerKg: 742.00, createdBy: 'admin-uid' },
    { date: '2026-05-19', ratePerKg: 745.00, createdBy: 'admin-uid' }, // Today's rate
  ];

  for (const rate of lmeRates) {
    await prisma.lMERate.create({ data: rate });
  }
  console.log('Seeded LME Rate history.');

  // Today's LME rate for calculation
  const todayLmeRate = 745.00;

  // 3. Create Categories
  const catWire = await prisma.category.create({
    data: {
      name: 'Electrical Wire (99.9% Copper)',
      copperContentPct: 99.9,
      makingChargePerKg: 40.0,
      marginPct: 5.0,
    }
  });

  const catPipe = await prisma.category.create({
    data: {
      name: 'Copper Plumbing Pipes (99.0% Copper)',
      copperContentPct: 99.0,
      makingChargePerKg: 55.0,
      marginPct: 6.5,
    }
  });

  const catSheet = await prisma.category.create({
    data: {
      name: 'Copper Sheets & Strips (98.5% Copper)',
      copperContentPct: 98.5,
      makingChargePerKg: 30.0,
      marginPct: 4.0,
    }
  });

  console.log('Seeded categories.');

  // 4. Create Products
  const prodWire1 = await prisma.product.create({
    data: {
      categoryId: catWire.id,
      name: 'House Wire 1.0 sq mm',
      unit: 'kg',
    }
  });

  const prodWire2 = await prisma.product.create({
    data: {
      categoryId: catWire.id,
      name: 'Industrial Cable 4.0 sq mm',
      unit: 'kg',
    }
  });

  const prodPipe1 = await prisma.product.create({
    data: {
      categoryId: catPipe.id,
      name: '15mm Copper Plumbing Pipe',
      unit: 'kg',
    }
  });

  const prodPipe2 = await prisma.product.create({
    data: {
      categoryId: catPipe.id,
      name: '22mm Industrial Pipe',
      unit: 'kg',
    }
  });

  const prodSheet1 = await prisma.product.create({
    data: {
      categoryId: catSheet.id,
      name: '1.2mm Grounding Plate',
      unit: 'kg',
    }
  });

  const prodSheet2 = await prisma.product.create({
    data: {
      categoryId: catSheet.id,
      name: '0.8mm Flexible Copper Strip',
      unit: 'kg',
    }
  });

  console.log('Seeded products.');

  // Formula: ratePerKg = (lmeRate * copperContent/100 + makingCharge) * (1 + margin/100)
  // Let's compute snapshots based on LME rate = 745.00
  const getRate = (cat, lme) => {
    const rawCost = (lme * (cat.copperContentPct / 100)) + cat.makingChargePerKg;
    const finalRate = rawCost * (1 + (cat.marginPct / 100));
    return Math.round(finalRate * 100) / 100;
  };

  const rateWire = getRate(catWire, todayLmeRate);   // (745 * 0.999 + 40) * 1.05 = 823.47
  const ratePipe = getRate(catPipe, todayLmeRate);   // (745 * 0.99 + 55) * 1.065 = 844.06
  const rateSheet = getRate(catSheet, todayLmeRate); // (745 * 0.985 + 30) * 1.04 = 794.34

  // 5. Create Quote Requests
  const quote1 = await prisma.quoteRequest.create({
    data: {
      customerUid: 'demo-customer-uid',
      customerName: 'Rajesh Patel',
      company: 'Alpha Electricals Ltd.',
      phone: '+91 98250 12345',
      email: 'rajesh@alphaelec.com',
      status: 'PENDING',
      items: {
        create: [
          {
            productId: prodWire1.id,
            rateSnapshot: rateWire,
            quantity: 250, // 250 kg
            subtotal: rateWire * 250,
          },
          {
            productId: prodWire2.id,
            rateSnapshot: rateWire,
            quantity: 500, // 500 kg
            subtotal: rateWire * 500,
          }
        ]
      }
    }
  });

  const quote2 = await prisma.quoteRequest.create({
    data: {
      customerUid: 'customer-uid-2',
      customerName: 'Sanjay Shah',
      company: 'Apex Plumbing Supplies',
      phone: '+91 98765 43210',
      email: 'sanjay@apexplumb.com',
      status: 'SENT',
      items: {
        create: [
          {
            productId: prodPipe1.id,
            rateSnapshot: ratePipe,
            quantity: 400,
            subtotal: ratePipe * 400,
          },
          {
            productId: prodPipe2.id,
            rateSnapshot: ratePipe,
            quantity: 300,
            subtotal: ratePipe * 300,
          }
        ]
      }
    }
  });

  console.log('Seeded quote requests.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
