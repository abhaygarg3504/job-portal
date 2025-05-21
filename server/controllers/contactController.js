import Contact from "../models/Contact.js";

export const getContacts = async (req, res) => {
  try {
    const { userId, recruiterId } = req.query;

    if (!userId && !recruiterId) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const filter = userId ? { userId } : { recruiterId };

    const contacts = await Contact.find(filter)
      .populate({ path: "userId", select: "name image" })
      .populate({ path: "recruiterId", select: "name image" });

    return res.status(200).json({
      success: true,
      contacts,
    });

  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


