import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.userProfile.findMany().then(console.log).finally(() => prisma.$disconnect());
