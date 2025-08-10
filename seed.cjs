import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main(){
  console.log('Seed via API POST /api/worklogs with {demo:true} instead.');
}
main().finally(()=>prisma.$disconnect());
