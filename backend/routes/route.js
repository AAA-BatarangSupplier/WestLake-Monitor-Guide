const { SPOTS, POPULARITY, findSpotByName, generateMockData } = require('../utils/spots');

function calculateDistance(spot1, spot2) {
  const dx = spot1.lng - spot2.lng;
  const dy = spot1.lat - spot2.lat;
  return Math.sqrt(dx * dx + dy * dy);
}

function planRoute(fromSpotId, toSpotId, allSpotsData) {
  const fromSpot = allSpotsData.find(s => s.id === fromSpotId);
  const toSpot = allSpotsData.find(s => s.id === toSpotId);
  
  if (!fromSpot || !toSpot) {
    return null;
  }

  const middleCandidates = allSpotsData
    .filter(s => s.id !== fromSpotId && s.id !== toSpotId)
    .sort((a, b) => a.crowd - b.crowd)
    .slice(0, 5);

  middleCandidates.sort((a, b) => {
    const distA = calculateDistance(fromSpot, a) + calculateDistance(a, toSpot);
    const distB = calculateDistance(fromSpot, b) + calculateDistance(b, toSpot);
    return distA - distB;
  });

  const waypoints = middleCandidates.slice(0, 2);
  
  const path = [fromSpot, ...waypoints, toSpot];
  const totalCrowd = path.reduce((sum, s) => sum + s.crowd, 0);
  const avgCrowd = Math.floor(totalCrowd / path.length);

  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += calculateDistance(path[i], path[i + 1]);
  }

  return {
    path: path,
    waypoints: waypoints,
    totalStops: path.length,
    avgCrowd: avgCrowd,
    estimatedDistance: totalDistance.toFixed(4),
    from: fromSpot,
    to: toSpot
  };
}

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { from, to } = req.query;
  
  const fromSpot = findSpotByName(from);
  const toSpot = findSpotByName(to);
  
  if (!fromSpot) {
    return res.status(404).json({ error: '未找到起点景点', spots: SPOTS.map(s => s.name) });
  }
  if (!toSpot) {
    return res.status(404).json({ error: '未找到终点景点', spots: SPOTS.map(s => s.name) });
  }

  const mockData = generateMockData();
  const result = planRoute(fromSpot.id, toSpot.id, mockData.data);
  
  res.json(result);
});

router.post('/', (req, res) => {
  const { from, to, spotsData } = req.body;
  
  const fromSpot = findSpotByName(from);
  const toSpot = findSpotByName(to);
  
  if (!fromSpot) {
    return res.status(404).json({ error: '未找到起点景点', spots: SPOTS.map(s => s.name) });
  }
  if (!toSpot) {
    return res.status(404).json({ error: '未找到终点景点', spots: SPOTS.map(s => s.name) });
  }

  const allData = spotsData || generateMockData().data;
  const result = planRoute(fromSpot.id, toSpot.id, allData);
  
  res.json(result);
});

module.exports = router;
module.exports.planRoute = planRoute;
