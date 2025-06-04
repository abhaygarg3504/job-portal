// src/prisma/client.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('PostgreSQL connected successfully.')
  } catch (error) {
    console.error(' Failed to connect to PostgreSQL:', error)
    process.exit(1)
  }
}

export default prisma
