import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// Log user activity
export const logUserActivity = async (userId, type) => {
  try {
    await prisma.activity.create({
      data: {
        userId,
        type,
        companyId: null
      },
    });
  } catch (err) {
    console.error("Failed to log user activity:", err.message);
  }
};

// Log company activity
export const logCompanyActivity = async (companyId, type) => {
  try {
    await prisma.activity.create({
      data: {
        companyId,
        type,
        userId: null
      },
    });
  } catch (err) {
    console.error("Failed to log company activity:", err.message);
  }
};
