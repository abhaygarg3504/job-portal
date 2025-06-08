import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Shared logic
export const getActivityGraphByRole = async (id, role) => {
  let activities;
  if (role === "user") {
    activities = await prisma.activity.findMany({ where: { userId: id } });
  } else if (role === "company") {
    activities = await prisma.activity.findMany({ where: { companyId: id } });
  } else {
    throw new Error("Invalid role");
  }

  const graph = {};
  activities.forEach(({ date }) => {
    const key = date.toISOString().slice(0, 10);
    graph[key] = (graph[key] || 0) + 1;
  });

  return graph;
};

// For user
export const getUserActivityGraph = async (req, res) => {
  try {
    const userId = req.params.id;
    const graph = await getActivityGraphByRole(userId, "users");
    res.json({ success: true, graph });
  } catch (err) {
    console.error("User Activity Error:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// For company
export const getCompanyActivityGraph = async (req, res) => {
  try {
    const companyId = req.params.id;
    const graph = await getActivityGraphByRole(companyId, "company");
    res.json({ success: true, graph });
  } catch (err) {
    console.error("Company Activity Error:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
