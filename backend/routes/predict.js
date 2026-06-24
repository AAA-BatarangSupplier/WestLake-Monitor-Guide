const { SPOTS, POPULARITY, getTimeFactor, findSpotByName } = require('../utils/spots');

function generatePrediction(spotId, currentCrowd) {
  const spot = SPOTS.find(s => s.id === spotId);
  if (!spot) return null;

  const now = new Date();
  const predictions = [];
  const pop = POPULARITY[spotId] || 1.0;

  for (let i = 0; i < 13; i++) {
    const time = new Date(now.getTime() + i * 10 * 60 * 1000);
    const hour = time.getHours();
    const minute = time.getMinutes();
    
    const baseFactor = getTimeFactor(hour);
    const minuteOffset = minute / 60;
    
    const nextHour = (hour + 1) % 24;
    const nextBaseFactor = getTimeFactor(nextHour);
    const interpolatedFactor = baseFactor + (nextBaseFactor - baseFactor) * minuteOffset;
    
    const randomFactor = 0.85 + Math.random() * 0.30;
    let crowd;
    
    if (i === 0) {
      crowd = currentCrowd;
    } else {
      crowd = Math.floor(spot.capacity * interpolatedFactor * randomFactor * pop);
      crowd = Math.min(crowd, spot.capacity);
      crowd = Math.max(crowd, Math.floor(spot.capacity * 0.02));
    }

    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const saturation = ((crowd / spot.capacity) * 100).toFixed(1);
    
    predictions.push({
      time: timeStr,
      crowd: crowd,
      saturation: parseFloat(saturation)
    });
  }

  let maxPrediction = predictions[0];
  predictions.forEach(p => {
    if (p.crowd > maxPrediction.crowd) {
      maxPrediction = p;
    }
  });

  return {
    spot: spot,
    currentCrowd: currentCrowd,
    predictions: predictions,
    peak: maxPrediction,
    timestamp: now.toISOString()
  };
}

const express = require('express');
const router = express.Router();

router.get('/:spotId', (req, res) => {
  const { spotId } = req.params;
  const { currentCrowd } = req.query;
  
  const spot = findSpotByName(spotId);
  if (!spot) {
    return res.status(404).json({ error: '未找到该景点', spots: SPOTS.map(s => s.name) });
  }

  const crowd = currentCrowd ? parseInt(currentCrowd) : Math.floor(spot.capacity * 0.5);
  const result = generatePrediction(spot.id, crowd);
  
  res.json(result);
});

router.post('/', (req, res) => {
  const { spotName, currentCrowd } = req.body;
  
  const spot = findSpotByName(spotName);
  if (!spot) {
    return res.status(404).json({ error: '未找到该景点', spots: SPOTS.map(s => s.name) });
  }

  const crowd = currentCrowd || Math.floor(spot.capacity * 0.5);
  const result = generatePrediction(spot.id, crowd);
  
  res.json(result);
});

module.exports = router;
module.exports.generatePrediction = generatePrediction;
