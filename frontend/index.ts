
import { prisma } from './src/lib/prisma.js';

async function getUsers() {
  const users = await prisma.user.findMany();
  console.log(users[0].username);
}

getUsers();