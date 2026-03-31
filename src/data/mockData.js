export const mockData = [
  { id: 1, name: "Micro-frontends", quadrant: 0, ring: 2, description: "Architectural style where independently deliverable frontend applications are composed into a greater whole.", isNew: true },
  { id: 2, name: "GraphQL", quadrant: 0, ring: 0, description: "A query language for APIs and a runtime for fulfilling those queries with your existing data.", isNew: false },
  { id: 3, name: "Kubernetes", quadrant: 2, ring: 0, description: "Open-source system for automating deployment, scaling, and management of containerized applications.", isNew: false },
  { id: 4, name: "React", quadrant: 3, ring: 0, description: "A JavaScript library for building user interfaces.", isNew: false },
  { id: 5, name: "Svelte", quadrant: 3, ring: 1, description: "Cybernetically enhanced web apps.", isNew: true },
  { id: 6, name: "D3.js", quadrant: 3, ring: 0, description: "Data-Driven Documents.", isNew: false },
  { id: 7, name: "Vite", quadrant: 1, ring: 0, description: "Next Generation Frontend Tooling.", isNew: true },
  { id: 8, name: "Rust", quadrant: 3, ring: 1, description: "A language empowering everyone to build reliable and efficient software.", isNew: true },
  { id: 9, name: "Docker", quadrant: 1, ring: 0, description: "Empowering App Development for Developers.", isNew: false },
];

export const quadrants = [
  { id: 0, name: "Techniques", color: "#3b82f6" }, // top-left
  { id: 1, name: "Tools", color: "#10b981" }, // top-right
  { id: 2, name: "Platforms", color: "#f59e0b" }, // bottom-left
  { id: 3, name: "Languages & Frameworks", color: "#ef4444" } // bottom-right
];

export const rings = [
  { id: 0, name: "Adopt", radius: 130 },
  { id: 1, name: "Trial", radius: 220 },
  { id: 2, name: "Assess", radius: 310 },
  { id: 3, name: "Hold", radius: 400 }
];
