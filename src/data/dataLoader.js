import * as d3 from 'd3';

export const ringsInfo = [
  { id: 0, name: "Adopt", radius: 130 },
  { id: 1, name: "Trial", radius: 220 },
  { id: 2, name: "Assess", radius: 310 },
  { id: 3, name: "Hold", radius: 400 }
];

// Helper to map Radar (Status) to ring id (0-3)
function getRingCategory(status) {
  if (!status) return 3; // Default to Hold
  const norm = status.toLowerCase();
  if (norm === "adopt") return 0;
  if (norm.includes("trial") && norm.includes("adopt")) return 1; // "Trial / Adopt", "Adopt / Trial"
  if (norm === "trial") return 1;
  if (norm.includes("concept")) return 2; // "Concept / Trial", "Concept"
  return 2; // Assess (default for others)
}

// Robustly find a value in a row by matching the column name (case-insensitive, ignores spaces/special chars)
function findValue(row, ...targetNames) {
  const keys = Object.keys(row);
  for (const target of targetNames) {
    const targetNorm = target.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const foundKey = keys.find(k => {
      const keyNorm = k.replace(/[^a-z0-9]/gi, '').toLowerCase();
      return keyNorm === targetNorm;
    });
    if (foundKey && row[foundKey] !== undefined) return row[foundKey];
  }
  return null;
}

export async function loadRadarData() {
  const data = await d3.csv(`${import.meta.env.BASE_URL}radardata.csv`);
  
  // Debug headers in dev
  if (import.meta.env.DEV && data.length > 0) {
    console.log("Tech Radar CSV Headers:", Object.keys(data[0]));
  }

  // get unique Hoofdfase and Type Robot
  const hoofdfaseSet = new Set();
  const typeRobotSet = new Set();
  
  data.forEach(row => {
    const hoofdfase = findValue(row, "Hoofdfase");
    const typeRobot = findValue(row, "Type Robot");
    if (hoofdfase) hoofdfaseSet.add(hoofdfase.trim());
    if (typeRobot) typeRobotSet.add(typeRobot.trim());
  });

  const uniqueHoofdfase = Array.from(hoofdfaseSet).sort();
  const uniqueTypeRobot = Array.from(typeRobotSet).sort();

  const colors = [
    "#3b82f6", // Blue (Voorbereiding...)
    "#10b981", // Emerald (GWW...)
    "#f59e0b", // Amber (Logistiek...)
    "#8b5cf6", // Violet (Prefab...)
    "#ef4444", // Red (Ruwbouw & Sloop)
    "#ec4899", // Pink (Installatie & Afbouw)
    "#6366f1", "#14b8a6", "#f97316", "#84cc16", "#06b6d4"
  ];
  
  const dynamicQuadrants = uniqueHoofdfase.map((name, i) => ({
    id: i,
    name: name,
    color: colors[i % colors.length]
  }));

  const mappedBlips = data.map((row, index) => {
    const rawStatus = findValue(row, "Radar (Status)", "Status") || "";
    const nameStr = findValue(row, "Naam Usecase", "Naam", "Name") || `Robot ${index}`;
    const parsedName = nameStr.replace(/^\d+\.\s*/, '').trim(); 
    
    const linkImage = findValue(row, "Link Image", "Image Link", "Image") || "";
    if (index === 0) console.log("Robot 1 Image Map:", { csvRow: row, linkImage });
    
    return {
      id: index + 1,
      name: parsedName,
      quadrant: uniqueHoofdfase.indexOf(findValue(row, "Hoofdfase")?.trim()),
      ring: getRingCategory(rawStatus),
      description: findValue(row, "Omschrijving & Impact", "Omschrijving") || "",
      linkImage: linkImage,
      usecase: findValue(row, "Usecase", "Use Case") || "",
      location: findValue(row, "Location", "Locatie") || "",
      isNew: rawStatus.toLowerCase().includes("concept"),
      metadata: {
        hoofdfase: findValue(row, "Hoofdfase")?.trim() || "",
        handeling: findValue(row, "Specifieke Handeling", "Handeling") || "",
        partners: findValue(row, "Project Partners & Locatie", "Partners") || "",
        typeRobot: findValue(row, "Type Robot") || "",
        rawStatus: rawStatus
      }
    };
  });

  return { blips: mappedBlips, rings: ringsInfo, quadrants: dynamicQuadrants, typeRobots: uniqueTypeRobot };
}
