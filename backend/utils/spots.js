const SPOTS = [
  { id: 'duanqiao', name: '断桥', lng: 120.1489, lat: 30.2638, capacity: 1500 },
  { id: 'sudi', name: '苏堤', lng: 120.1366, lat: 30.2434, capacity: 2000 },
  { id: 'leifeng', name: '雷峰塔', lng: 120.1570, lat: 30.2396, capacity: 1200 },
  { id: 'lingyin', name: '灵隐寺', lng: 120.1072, lat: 30.2410, capacity: 1800 },
  { id: 'santan', name: '三潭印月', lng: 120.1467, lat: 30.2420, capacity: 1000 },
  { id: 'hubin', name: '湖滨', lng: 120.1600, lat: 30.2540, capacity: 3000 },
  { id: 'taiziwan', name: '太子湾', lng: 120.1480, lat: 30.2330, capacity: 800 },
  { id: 'quyuan', name: '曲院风荷', lng: 120.1300, lat: 30.2630, capacity: 1000 },
  { id: 'baidi', name: '白堤', lng: 120.1450, lat: 30.2570, capacity: 1800 },
  { id: 'huagang', name: '花港观鱼', lng: 120.1380, lat: 30.2260, capacity: 1200 },
];

const POPULARITY = {
  'duanqiao': 1.2, 'sudi': 1.0, 'leifeng': 0.9, 'lingyin': 0.8,
  'santan': 0.7, 'hubin': 1.1, 'taiziwan': 0.6, 'quyuan': 0.75,
  'baidi': 1.0, 'huagang': 0.85
};

function getTimeFactor(hour) {
  if (hour >= 6 && hour < 8) return 0.15;
  if (hour >= 8 && hour < 10) return 0.35;
  if (hour >= 10 && hour < 12) return 0.55;
  if (hour >= 12 && hour < 14) return 0.70;
  if (hour >= 14 && hour < 17) return 0.90;
  if (hour >= 17 && hour < 19) return 0.70;
  if (hour >= 19 && hour < 21) return 0.40;
  if (hour >= 21 && hour < 23) return 0.15;
  return 0.05;
}

function getStatus(crowd, capacity) {
  const ratio = crowd / capacity;
  if (ratio < 0.2) return { status: 'idle', color: '#1890ff', label: '空闲', level: 0 };
  if (ratio < 0.4) return { status: 'smooth', color: '#52c41a', label: '舒适', level: 1 };
  if (ratio < 0.67) return { status: 'crowded', color: '#faad14', label: '较挤', level: 2 };
  return { status: 'saturated', color: '#ff4d4f', label: '拥挤', level: 3 };
}

function findSpotByName(name) {
  if (!name) return null;
  const lowerName = name.toLowerCase();
  return SPOTS.find(spot => 
    spot.name === name || 
    spot.id === name ||
    spot.name.toLowerCase().includes(lowerName)
  );
}

function generateMockData() {
  const now = new Date();
  const hour = now.getHours();
  const timeFactor = getTimeFactor(hour);
  let totalVisitors = 0;
  let crowdedCount = 0;
  let smoothCount = 0;

  const data = SPOTS.map(spot => {
    const randomFactor = 0.85 + Math.random() * 0.30;
    const pop = POPULARITY[spot.id] || 1.0;
    const crowd = Math.floor(spot.capacity * timeFactor * randomFactor * pop);
    const finalCrowd = Math.min(crowd, spot.capacity);
    const status = getStatus(finalCrowd, spot.capacity);

    totalVisitors += finalCrowd;
    if (status.level >= 2) crowdedCount++;
    if (status.level <= 1) smoothCount++;

    return {
      ...spot,
      crowd: finalCrowd,
      status: status
    };
  });

  return { data, totalVisitors, crowdedCount, smoothCount, timestamp: now.toISOString() };
}

module.exports = {
  SPOTS,
  POPULARITY,
  getTimeFactor,
  getStatus,
  findSpotByName,
  generateMockData
};
