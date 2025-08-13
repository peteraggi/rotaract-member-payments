import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getNextTransactionId(): Promise<string> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counter = await prisma.dailyTransactionCounter.upsert({
    where: { date: today },
    create: { date: today, counter: 1 },
    update: { counter: { increment: 1 } },
  });

  return counter.counter.toString().padStart(9, '0');
}

export async function generateReferenceNumber(): Promise<string> {
  const EMONEY_ISSUER_CODE = "618"; 
  const MESSAGE_CATEGORY = "01";
  
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const transactionId = await getNextTransactionId();
  
  return `${EMONEY_ISSUER_CODE}${MESSAGE_CATEGORY}${year}${month}${day}${transactionId}`;
}