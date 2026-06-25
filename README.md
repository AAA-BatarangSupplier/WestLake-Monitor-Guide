# 西湖景区实时客流监控看板

一个基于高德地图和阿里云百炼AI的智能景区客流监控系统，提供实时客流监控、客流预测、智能路线规划和AI对话导游功能。

## 📸 项目截图

![项目截图](https://github.com/AAA-BatarangSupplier/WestLake-Monitor-Guide/raw/main/screenshot.png)

## 🌟 功能特性

### 1. 实时客流监控与地图看板
- **实时数据展示**：10个西湖核心景点的人流数据实时更新（每8秒刷新）
- **动态地图标记**：标记点大小和颜色根据拥挤度动态变化
- **拥挤度等级**：空闲、舒适、较挤、拥挤四级分类
- **统计卡片**：总游客数、拥挤景点数、畅通景点数实时统计
- **历史趋势图**：点击景点查看过去24小时人流变化曲线

### 2. 客流预测分析与预警
- **未来2小时预测**：每10分钟一个采样点，共13个预测点
- **峰值检测**：自动识别预测时段内的客流峰值
- **AI预警文案**：阿里云百炼大模型生成专业预警建议
- **可视化展示**：ECharts折线图展示预测趋势

### 3. 智能路线规划
- **智能选路**：优先选择低人流景点作为途经点
- **避开拥挤**：自动避开高饱和度景点
- **路线可视化**：地图上高亮显示推荐路线
- **AI导游解说**：大模型生成友好的路线指引

### 4. 智能对话交互
- **意图识别**：自动识别预测、路线规划、帮助等意图
- **景点匹配**：支持全称和模糊匹配景点名称
- **快捷操作**：预设快捷按钮，一键触发常用功能
- **实时响应**：打字指示器效果，提升用户体验

## 🏗️ 项目架构

```
西湖实时客流/
├── xihu-dashboard.html          # 前端主页面
├── .gitignore                   # Git忽略配置
└── backend/                     # 后端服务
    ├── server.js                # Express服务器入口
    ├── package.json             # 依赖配置
    ├── .env                     # 环境变量（API密钥）
    ├── .env.example             # 环境变量示例
    ├── routes/
    │   ├── predict.js           # 客流预测API
    │   ├── route.js             # 路线规划API
    │   └── chat.js              # 智能对话API
    └── utils/
        ├── spots.js             # 景点数据和工具函数
        └── llm.js               # 大模型调用接口
```

## 🔧 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | HTML5 + CSS3 + JavaScript |
| 地图服务 | 高德地图 JS API |
| 数据可视化 | ECharts |
| 后端框架 | Node.js + Express |
| AI服务 | 阿里云百炼（Qwen3.6-Flash） |
| 环境管理 | dotenv |

## 📋 景点列表

| 景点名称 | ID | 承载上限 | 经纬度 |
|---------|-----|---------|--------|
| 断桥 | duanqiao | 1500人 | 120.1489, 30.2638 |
| 苏堤 | sudi | 2000人 | 120.1366, 30.2434 |
| 雷峰塔 | leifeng | 1200人 | 120.1570, 30.2396 |
| 灵隐寺 | lingyin | 1800人 | 120.1072, 30.2410 |
| 三潭印月 | santan | 1000人 | 120.1467, 30.2420 |
| 湖滨 | hubin | 3000人 | 120.1600, 30.2540 |
| 太子湾 | taiziwan | 800人 | 120.1480, 30.2330 |
| 曲院风荷 | quyuan | 1000人 | 120.1300, 30.2630 |
| 白堤 | baidi | 1800人 | 120.1450, 30.2570 |
| 花港观鱼 | huagang | 1200人 | 120.1380, 30.2260 |

## 🚀 快速开始

### 1. 环境要求

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本

### 2. 安装依赖

```bash
cd backend
npm install
```

### 3. 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
PORT=3000

# 高德地图API密钥
AMAP_KEY=你的高德地图密钥

# 阿里云百炼配置
DASHSCOPE_API_KEY=你的阿里云百炼API密钥
DASHSCOPE_MODEL=qwen3.6-flash
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# LLM服务商选择
LLM_PROVIDER=dashscope
```

#### 获取API密钥

**高德地图密钥**：
1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册账号并创建应用
3. 获取 Web服务 API Key

**阿里云百炼密钥**：
1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 进入"模型服务" → "API密钥管理"
3. 创建或复制API密钥（以 `sk-` 开头）

### 4. 启动服务

```bash
npm start
```

服务启动后访问：`http://localhost:3000/xihu-dashboard.html`

## 📡 API接口文档

### 基础接口

#### 健康检查
```
GET /api/health
```

响应示例：
```json
{
  "status": "ok",
  "message": "西湖景区客流监控后端服务运行正常"
}
```

#### 获取景点实时数据
```
GET /api/chat/spots
```

响应示例：
```json
{
  "data": [...],
  "totalVisitors": 8500,
  "crowdedCount": 3,
  "smoothCount": 5,
  "timestamp": "2026-06-25T10:00:00.000Z"
}
```

### 客流预测接口

#### GET 方式
```
GET /api/predict/:spotId?currentCrowd=1000
```

参数说明：
- `spotId`: 景点ID或名称
- `currentCrowd`: 当前人流（可选）

#### POST 方式
```
POST /api/predict
Content-Type: application/json

{
  "spotName": "断桥",
  "currentCrowd": 1000
}
```

响应示例：
```json
{
  "spot": { "id": "duanqiao", "name": "断桥", ... },
  "currentCrowd": 1000,
  "predictions": [
    { "time": "18:00", "crowd": 1050, "saturation": 70.0 },
    { "time": "18:10", "crowd": 1100, "saturation": 73.3 },
    ...
  ],
  "peak": { "time": "18:30", "crowd": 1200, "saturation": 80.0 }
}
```

### 路线规划接口

#### GET 方式
```
GET /api/route?from=断桥&to=雷峰塔
```

#### POST 方式
```
POST /api/route
Content-Type: application/json

{
  "from": "断桥",
  "to": "雷峰塔"
}
```

响应示例：
```json
{
  "path": [
    { "id": "duanqiao", "name": "断桥", "crowd": 1200 },
    { "id": "santan", "name": "三潭印月", "crowd": 450 },
    { "id": "taiziwan", "name": "太子湾", "crowd": 300 },
    { "id": "leifeng", "name": "雷峰塔", "crowd": 800 }
  ],
  "waypoints": [...],
  "totalStops": 4,
  "avgCrowd": 687
}
```

### 智能对话接口

```
POST /api/chat/send
Content-Type: application/json

{
  "message": "预测断桥"
}
```

响应示例：
```json
{
  "reply": "温馨提示：断桥当前客流1230人...",
  "intent": "PREDICT",
  "data": { ... },
  "spots": [...]
}
```

支持的对话意图：
| 意图 | 关键词 | 示例 |
|------|--------|------|
| 预测 | 预测、预报、预警 | "预测断桥" |
| 路线 | 路线、规划、怎么走 | "路线 断桥 雷峰塔" |
| 帮助 | 帮助、help | "帮助" |
| 问候 | 你好、hi、hello | "你好" |

## 📊 算法说明

### 时间因子计算

根据当前小时计算全天人流基准系数：

| 时间段 | 系数 |
|--------|------|
| 06:00-08:00 | 0.15 |
| 08:00-10:00 | 0.35 |
| 10:00-12:00 | 0.55 |
| 12:00-14:00 | 0.70 |
| 14:00-17:00 | 0.90 |
| 17:00-19:00 | 0.70 |
| 19:00-21:00 | 0.40 |
| 21:00-23:00 | 0.15 |
| 其他时段 | 0.05 |

### 拥挤度等级

| 饱和度 | 状态 | 颜色 |
|--------|------|------|
| < 20% | 空闲 | 蓝色 |
| 20%-40% | 舒适 | 绿色 |
| 40%-67% | 较挤 | 黄色 |
| > 67% | 拥挤 | 红色 |

### 预测算法

```
预测值(t) = 容量 × 时段系数(hour) × 景点热度 × (0.85 + random(0, 0.3))
```

### 路线规划策略

1. 按人流升序排列所有景点
2. 取前5个低人流景点作为候选中间节点
3. 过滤掉起点和终点
4. 按距离排序，选择最近的2个作为途经点
5. 构建完整路径：起点 → 途经点1 → 途经点2 → 终点

## 🔒 安全说明

- `.env` 文件已加入 `.gitignore`，不会被提交到Git仓库
- API密钥通过环境变量管理，不暴露在代码中
- 前端不直接调用大模型API，所有请求通过后端代理

## 📝 更新日志

### v1.0.0 (2026-06-25)
- ✅ 实时客流监控与地图看板
- ✅ 客流预测分析与预警
- ✅ 智能路线规划
- ✅ 智能对话交互
- ✅ 阿里云百炼集成

## 👥 贡献者

- AAA-BatarangSupplier

## 📄 许可证

MIT License

## 🙏 致谢

- [高德地图](https://lbs.amap.com/) - 地图服务
- [ECharts](https://echarts.apache.org/) - 数据可视化
- [阿里云百炼](https://bailian.console.aliyun.com/) - AI服务