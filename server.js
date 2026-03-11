const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Manchester area parking lots with realistic coordinates
const parkingLots = [
  {
    id: 1,
    name: "Manchester Arndale NCP",
    lat: 53.4831,
    lng: -2.2367,
    totalSpaces: 1800,
    type: "Multi-storey",
    address: "Church St, Manchester M4 3AQ",
    pricePerHour: 3.5,
  },
  {
    id: 2,
    name: "Piccadilly Gardens Car Park",
    lat: 53.4808,
    lng: -2.2347,
    totalSpaces: 450,
    type: "Surface",
    address: "Piccadilly, Manchester M1 1RG",
    pricePerHour: 2.8,
  },
  {
    id: 3,
    name: "Deansgate Q-Park",
    lat: 53.4772,
    lng: -2.2490,
    totalSpaces: 750,
    type: "Multi-storey",
    address: "Great Bridgewater St, Manchester M1 5JW",
    pricePerHour: 4.0,
  },
  {
    id: 4,
    name: "Northern Quarter Parking",
    lat: 53.4845,
    lng: -2.2330,
    totalSpaces: 280,
    type: "Surface",
    address: "Tib St, Manchester M4 1LN",
    pricePerHour: 2.0,
  },
  {
    id: 5,
    name: "Spinningfields NCP",
    lat: 53.4790,
    lng: -2.2510,
    totalSpaces: 600,
    type: "Multi-storey",
    address: "Hardman St, Manchester M3 3EB",
    pricePerHour: 3.8,
  },
  {
    id: 6,
    name: "Oxford Road Car Park",
    lat: 53.4740,
    lng: -2.2380,
    totalSpaces: 320,
    type: "Multi-storey",
    address: "Oxford Rd, Manchester M1 7ED",
    pricePerHour: 2.5,
  },
  {
    id: 7,
    name: "Salford Central Parking",
    lat: 53.4840,
    lng: -2.2640,
    totalSpaces: 200,
    type: "Surface",
    address: "Chapel St, Salford M3 5JJ",
    pricePerHour: 1.5,
  },
  {
    id: 8,
    name: "Printworks Car Park",
    lat: 53.4822,
    lng: -2.2390,
    totalSpaces: 500,
    type: "Multi-storey",
    address: "Withy Grove, Manchester M4 2BS",
    pricePerHour: 3.2,
  },
];

// Simulate real-time occupancy — fluctuates realistically based on time of day
function getSimulatedOccupancy(totalSpaces) {
  const hour = new Date().getHours();
  let baseOccupancy;

  if (hour >= 8 && hour <= 10) baseOccupancy = 0.75; // morning rush
  else if (hour >= 11 && hour <= 14) baseOccupancy = 0.85; // lunch peak
  else if (hour >= 15 && hour <= 18) baseOccupancy = 0.90; // evening rush
  else if (hour >= 19 && hour <= 22) baseOccupancy = 0.50; // evening
  else baseOccupancy = 0.20; // night/early morning

  const noise = (Math.random() - 0.5) * 0.15;
  const occupancyRate = Math.min(0.98, Math.max(0.05, baseOccupancy + noise));
  const occupied = Math.floor(totalSpaces * occupancyRate);
  const available = totalSpaces - occupied;

  return { occupied, available, occupancyRate: Math.round(occupancyRate * 100) };
}

function getStatus(occupancyRate) {
  if (occupancyRate >= 90) return 'full';
  if (occupancyRate >= 70) return 'busy';
  if (occupancyRate >= 40) return 'moderate';
  return 'available';
}

// GET all parking lots with live availability
app.get('/api/parking', (req, res) => {
  const data = parkingLots.map(lot => {
    const { occupied, available, occupancyRate } = getSimulatedOccupancy(lot.totalSpaces);
    return {
      ...lot,
      occupied,
      available,
      occupancyRate,
      status: getStatus(occupancyRate),
      lastUpdated: new Date().toISOString(),
    };
  });
  res.json(data);
});

// GET single parking lot
app.get('/api/parking/:id', (req, res) => {
  const lot = parkingLots.find(l => l.id === parseInt(req.params.id));
  if (!lot) return res.status(404).json({ error: 'Parking lot not found' });

  const { occupied, available, occupancyRate } = getSimulatedOccupancy(lot.totalSpaces);
  res.json({
    ...lot,
    occupied,
    available,
    occupancyRate,
    status: getStatus(occupancyRate),
    lastUpdated: new Date().toISOString(),
  });
});

// GET summary stats
app.get('/api/stats', (req, res) => {
  const allLots = parkingLots.map(lot => {
    const { available, occupied } = getSimulatedOccupancy(lot.totalSpaces);
    return { ...lot, available, occupied };
  });

  const totalSpaces = allLots.reduce((sum, l) => sum + l.totalSpaces, 0);
  const totalAvailable = allLots.reduce((sum, l) => sum + l.available, 0);
  const totalOccupied = allLots.reduce((sum, l) => sum + l.occupied, 0);

  res.json({
    totalLots: parkingLots.length,
    totalSpaces,
    totalAvailable,
    totalOccupied,
    overallOccupancy: Math.round((totalOccupied / totalSpaces) * 100),
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Parking API server running on http://localhost:${PORT}`);
});
