const express = require('express');
const router = express.Router();

const { SPOTS, findSpotByName, generateMockData } = require('../utils/spots');
const { generatePrediction } = require('./predict');
const { planRoute } = require('./route');
const { callLLM, generatePredictWarning, generateRouteDescription } = require('../utils/llm');

function parseIntent(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('预测') || lowerMsg.includes('预报') || lowerMsg.includes('预警')) {
    let spotName = null;
    for (const spot of SPOTS) {
      if (message.includes(spot.name) || lowerMsg.includes(spot.id)) {
        spotName = spot.name;
        break;
      }
    }
    if (!spotName) {
      const match = message.match(/预测[：:\s]*(.+)/);
      if (match) {
        const candidate = match[1].trim();
        const found = findSpotByName(candidate);
        if (found) spotName = found.name;
      }
    }
    return { intent: 'PREDICT', spotName };
  }
  
  if (lowerMsg.includes('路线') || lowerMsg.includes('规划') || lowerMsg.includes('怎么走') || lowerMsg.includes('导航')) {
    let from = null, to = null;
    
    const routePatterns = [
      /从(.+?)到(.+)/,
      /(.+?)到(.+)/,
      /路线[：:\s]+(.+?)\s+(.+)/,
      /规划[：:\s]+(.+?)\s+(.+)/,
      /路线\s+(.+?)\s+(.+)/,
      /导航\s+(.+?)\s+(.+)/,
      /怎么走\s+(.+?)\s+(.+)/
    ];
    
    for (const pattern of routePatterns) {
      const match = message.match(pattern);
      if (match) {
        const fromCandidate = match[1].trim();
        const toCandidate = match[2].trim();
        const fromSpot = findSpotByName(fromCandidate);
        const toSpot = findSpotByName(toCandidate);
        if (fromSpot && toSpot) {
          from = fromSpot.name;
          to = toSpot.name;
          break;
        }
      }
    }
    
    // 新增：支持"路线 景点1 景点2"格式
    if (!from && !to) {
      const simplePattern = /^路线\s+(.+?)\s+(.+)$/;
      const simpleMatch = message.match(simplePattern);
      if (simpleMatch) {
        const fromSpot = findSpotByName(simpleMatch[1].trim());
        const toSpot = findSpotByName(simpleMatch[2].trim());
        if (fromSpot && toSpot) {
          from = fromSpot.name;
          to = toSpot.name;
        }
      }
    }
    
    return { intent: 'ROUTE', from, to };
  }
  
  if (lowerMsg.includes('帮助') || lowerMsg.includes('help') || lowerMsg.includes('怎么用') || lowerMsg.includes('功能')) {
    return { intent: 'HELP' };
  }
  
  if (lowerMsg.includes('你好') || lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
    return { intent: 'GREETING' };
  }
  
  return { intent: 'UNKNOWN' };
}

router.post('/send', async (req, res) => {
  const { message } = req.body;
  
  console.log('[Chat] 收到消息:', message);
  
  if (!message || message.trim() === '') {
    return res.json({ reply: '请输入您的问题~', intent: 'UNKNOWN' });
  }

  const { intent, spotName, from, to } = parseIntent(message);
  console.log('[Chat] 识别意图:', intent, '景点:', spotName, '起点:', from, '终点:', to);
  const mockData = generateMockData();
  let reply = '';
  let data = null;

  switch (intent) {
    case 'GREETING':
      reply = '你好！👋 我是西湖景区智能导游。我可以帮您：\n\n📊 预测景点客流（输入：预测断桥）\n🗺️ 规划游览路线（输入：路线 断桥 雷峰塔）\n\n有什么可以帮您的吗？';
      break;

    case 'HELP':
      reply = '📋 使用指南：\n\n1️⃣ 客流预测\n输入：预测[景点名]\n示例：预测断桥、雷峰塔人多吗\n\n2️⃣ 路线规划\n输入：路线 [起点] [终点]\n示例：路线 断桥 雷峰塔\n从灵隐寺到湖滨怎么走\n\n3️⃣ 景点列表\n断桥、苏堤、雷峰塔、灵隐寺、三潭印月、湖滨、太子湾、曲院风荷、白堤、花港观鱼、岳王庙、柳浪闻莺、平湖秋月、孤山、西泠印社';
      break;

    case 'PREDICT':
      if (!spotName) {
        reply = '请告诉我您想预测哪个景点的客流？\n\n可用景点：断桥、苏堤、雷峰塔、灵隐寺、三潭印月、湖滨、太子湾、曲院风荷、白堤、花港观鱼、岳王庙、柳浪闻莺、平湖秋月、孤山、西泠印社';
      } else {
        const spot = findSpotByName(spotName);
        const currentSpot = mockData.data.find(s => s.id === spot.id);
        const prediction = generatePrediction(spot.id, currentSpot.crowd);
        
        const warning = generatePredictWarning(
          spot.name,
          prediction.peak.crowd,
          prediction.peak.saturation,
          prediction.peak.time,
          currentSpot.crowd
        );
        
        const llmPrompt = `你是一个景区客流分析专家。根据以下数据生成一段简洁的预警文字：
- 景点名称：${spot.name}
- 预测未来2小时峰值：${prediction.peak.crowd}人（饱和度${prediction.peak.saturation}%）
- 峰值预计出现时间：${prediction.peak.time}
- 当前人流：${currentSpot.crowd}人

要求：
1. 语气专业且友善
2. 包含具体数字
3. 给出明确建议（如"建议在XX时间前离开"或"推荐改道XX景点"）
4. 控制在60字以内`;
        
        const llmReply = await callLLM(llmPrompt, '你是一个景区客流分析专家。');
        
        reply = llmReply || warning;
        data = prediction;
      }
      break;

    case 'ROUTE':
      if (!from || !to) {
        // 自动从消息中提取景点名称
        const routeMatch = message.match(/^路线\s+(.+?)\s+(.+)$/);
        if (routeMatch) {
          from = findSpotByName(routeMatch[1].trim())?.name;
          to = findSpotByName(routeMatch[2].trim())?.name;
        }
        
        // 尝试其他格式
        if (!from || !to) {
          const otherMatch = message.match(/(.+?)到(.+)/);
          if (otherMatch) {
            from = findSpotByName(otherMatch[1].trim())?.name;
            to = findSpotByName(otherMatch[2].trim())?.name;
          }
        }
      }
      
      if (!from || !to) {
        reply = '请提供完整的起点和终点信息~\n\n可用景点：断桥、苏堤、雷峰塔、灵隐寺、三潭印月、湖滨、太子湾、曲院风荷、白堤、花港观鱼、岳王庙、柳浪闻莺、平湖秋月、孤山、西泠印社\n\n示例：路线 断桥 雷峰塔\n从岳王庙到柳浪闻莺怎么走';
      } else {
        const fromSpot = findSpotByName(from);
        const toSpot = findSpotByName(to);
        const routeResult = planRoute(fromSpot.id, toSpot.id, mockData.data);
        
        const defaultDesc = generateRouteDescription(routeResult.path);
        
        const path = routeResult.path;
        const llmPrompt = `你是一个景区导游。根据以下路线和人流数据，生成一段友好的路线指引：
- 起点：${path[0].name}（当前人流${path[0].crowd}人）
${path.slice(1, -1).map((p, i) => `- 途经${i + 1}：${p.name}（当前人流${p.crowd}人）`).join('\n')}
- 终点：${path[path.length - 1].name}（当前人流${path[path.length - 1].crowd}人）

要求：
1. 说明选择此路线的原因（避开拥挤）
2. 给出每个节点的预计游览建议
3. 语气亲切，控制在80字以内`;
        
        const llmReply = await callLLM(llmPrompt, '你是一个西湖景区的专业导游，熟悉各个景点。');
        
        reply = llmReply || defaultDesc;
        data = routeResult;
      }
      break;

    case 'UNKNOWN':
    default:
      reply = '🤔 抱歉，我不太明白您的意思。\n\n您可以试试：\n📊 预测断桥 - 查看景点客流预测\n🗺️ 路线 断桥 雷峰塔 - 规划游览路线\n\n输入"帮助"查看更多指令~';
      break;
  }

  res.json({
    reply: reply,
    intent: intent,
    data: data,
    spots: mockData.data,
    timestamp: new Date().toISOString()
  });
});

router.get('/spots', (req, res) => {
  const mockData = generateMockData();
  res.json(mockData);
});

module.exports = router;
