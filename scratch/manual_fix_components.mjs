import { generateAI } from "../lib/services/ai/modelRouter.js";
import { safeJsonParse } from "../lib/utils/jsonUtils.js";
import fs from "fs";
import path from "path";

const blueprint = {
  appName: "CampusConnect",
  frontendComponents: ["Navbar", "Footer", "DashboardWidget", "NoticeCard", "EventCard"]
};

const instruction = `
Generate React components for CampusConnect (University Portal).
COMPONENTS TO GENERATE: Navbar, Footer, DashboardWidget, NoticeCard, EventCard.

RULES:
- Use Tailwind CSS.
- Use lucide-react icons.
- Add "use client"; if needed.
- Navbar should have links for Home, Notices, Events, Admissions, and Login.
- NoticeCard should show title, content (truncated), date, and target audience.
- EventCard should show image, title, date, location, and organizer.
- DashboardWidget should show an icon, title, description, and optional value.

Return ONLY valid JSON:
{
  "Navbar.tsx": "...",
  "Footer.tsx": "...",
  "DashboardWidget.tsx": "...",
  "NoticeCard.tsx": "...",
  "EventCard.tsx": "..."
}
`;

async function run() {
  try {
    const text = await generateAI("gemini", [instruction + "\n\n" + JSON.stringify(blueprint)], {
      responseMimeType: "application/json"
    });
    
    const components = safeJsonParse(text);
    const compDir = "/Users/somasekharkurapati/Desktop/AutoStack/generated/project_1778610330791/v1/components";
    
    if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });
    
    for (const [name, code] of Object.entries(components)) {
      fs.writeFileSync(path.join(compDir, name), code);
      console.log(`Created ${name}`);
    }
  } catch (e) {
    console.error(e);
  }
}

run();
