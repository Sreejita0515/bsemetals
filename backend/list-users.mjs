import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const users = await prisma.userProfile.findMany();
console.log('Users in DB:');
console.log(JSON.stringify(users, null, 2));
process.exit(0);
