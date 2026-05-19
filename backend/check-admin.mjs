import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const admin = await prisma.userProfile.findFirst({
  where: { role: 'admin' },
  select: { name: true, email: true, phone: true, companyName: true, companyAddress: true, gstin: true }
});

console.log('Admin Info:', admin);
process.exit(0);
