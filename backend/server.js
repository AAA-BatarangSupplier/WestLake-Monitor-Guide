require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const predictRouter = require('./routes/predict');
const routeRouter = require('./routes/route');
const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '西湖景区客流监控后端服务运行正常' });
});

app.use('/api/predict', predictRouter);
app.use('/api/route', routeRouter);
app.use('/api/chat', chatRouter);

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 前端页面: http://localhost:${PORT}/xihu-dashboard.html`);
});
