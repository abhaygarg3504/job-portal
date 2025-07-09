// src/config/postgresConnect.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('PostgreSQL connected successfully.')
    return true;
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error.message)
    // Don't exit the process, just throw the error
    throw error;
  }
}

export default prisma