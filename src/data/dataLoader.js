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

export async function loadRadarData() {
  const data = await d3.csv(`${import.meta.env.BASE_URL}radardata.csv`);

  // get unique Hoofdfase and Type Robot
  const hoofdfaseSet = new Set();
  const typeRobotSet = new Set();
  
  data.forEach(row => {
    if (row["Hoofdfase"]) hoofdfaseSet.add(row["Hoofdfase"]);
    if (row["Type Robot"]) typeRobotSet.add(row["Type Robot"]);
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
    // Parse the fields based on headers.
    const nameStr = row["Naam Usecase"] || `Robot ${index}`;
    const parsedName = nameStr.replace(/^\d+\.\s*/, ''); 
    
    return {
      id: index + 1,
      name: parsedName,
      quadrant: uniqueHoofdfase.indexOf(row["Hoofdfase"]),
      ring: getRingCategory(row["Radar (Status)"]),
      description: row["Omschrijving & Impact"],
      isNew: row["Radar (Status)"].includes("Concept") ? true : false,
      metadata: {
        hoofdfase: row["Hoofdfase"],
        handeling: row["Specifieke Handeling"],
        partners: row["Project Partners & Locatie"],
        typeRobot: row["Type Robot"],
        rawStatus: row["Radar (Status)"]
      }
    };
  });

  return { blips: mappedBlips, rings: ringsInfo, quadrants: dynamicQuadrants, typeRobots: uniqueTypeRobot };
}
