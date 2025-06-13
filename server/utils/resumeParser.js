import axios from "axios";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import User from "../models/User.js";   // adjust your import!

// Your master list of skills
const SKILL_KEYWORDS = [
  "JavaScript","React","Node.js","Python","Java","C++","HTML","CSS",
  "MongoDB","SQL","Express","AWS","Docker","Git","Redux","TypeScript"
];

// escape any regex‑special chars in our keywords:
const escapeForRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function parseResumeFromUrl(pdfUrl) {
  // 1. fetch PDF bytes
  const { data: arraybuffer } = await axios.get(pdfUrl, {
    responseType: "arraybuffer",
  });

  // 2. extract raw text
  const { text } = await pdfParse(arraybuffer);

  // 3. split into non-empty lines
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 4. walk lines and bucket them under each header
  const SECTION_HEADERS = [
    "Education",
    "Experience",
    "Projects",
    "Skills",
    "Certificates and Achievements",
  ];
  const buckets = {};
  let current = null;

  for (const line of lines) {
    if (SECTION_HEADERS.includes(line)) {
      current = line;
      buckets[current] = [];
    } else if (current) {
      // stop if we see a completely new all‑caps header?
      if (/^[A-Z ]{3,}$/.test(line) && !SECTION_HEADERS.includes(line)) {
        current = null;
      } else {
        buckets[current].push(line);
      }
    }
  }

  // 5. post‑process each section
  const education = (buckets["Education"] || []).map((l) => l);
  const experience = (buckets["Experience"] || []).map((l) => l);
  const projects = (buckets["Projects"] || []).map((l) => l);

  // for skills, join into one string and filter by your keywords
  const skillsText = (buckets["Skills"] || []).join(" ");
  const skills = SKILL_KEYWORDS.filter((skill) => {
    const re = new RegExp(`\\b${escapeForRegex(skill)}\\b`, "i");
    return re.test(skillsText);
  });

  const achievements = (buckets["Certificates and Achievements"] || []).map((l) => l);

  return { education, experience, projects, skills, achievements };
}
