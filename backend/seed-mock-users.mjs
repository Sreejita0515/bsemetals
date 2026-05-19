import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.userProfile.upsert({
    where: { uid: 'demo-admin-uid' },
    update: {},
    create: {
      uid: 'demo-admin-uid',
      email: 'admin@bsemetals.com',
      name: 'Admin Dashboard User',
      role: 'admin',
      phone: '+91 9999999999',
      companyName: 'BSE Metals',
      gstin: '27AABCB1234C1Z5'
    }
  });

  const customer = await prisma.userProfile.upsert({
    where: { uid: 'demo-customer-uid' },
    update: {},
    create: {
      uid: 'demo-customer-uid',
      email: 'rajesh@alphaelec.com',
      name: 'Rajesh Patel',
      role: 'customer',
      phone: '+91 9876543210',
      companyName: 'Alpha Electronics',
      gstin: '27XYZABC1234C1Z5'
    }
  });

  console.log('Mock users seeded successfully:', admin.email, customer.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
