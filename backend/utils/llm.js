async function callLLM(prompt, systemPrompt = '你是一个景区客流分析专家。') {
  const provider = process.env.LLM_PROVIDER || 'dashscope';
  
  if (provider === 'dashscope') {
    return await callDashScopeLLM(prompt, systemPrompt);
  } else {
    return await callOpenAILLM(prompt, systemPrompt);
  }
}

async function callOpenAILLM(prompt, systemPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn('OpenAI API key not configured');
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API调用失败:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI调用异常:', error.message);
    return null;
  }
}

async function callDashScopeLLM(prompt, systemPrompt) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const baseUrl = process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const model = process.env.DASHSCOPE_MODEL || 'qwen3.6-flash';

  if (!apiKey || apiKey === 'your_dashscope_api_key_here') {
    console.warn('DashScope API key not configured');
    return null;
  }

  try {
    console.log(`[DashScope] 正在调用模型: ${model}`);
    console.log(`[DashScope] 请求URL: ${baseUrl}/chat/completions`);
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    console.log(`[DashScope] 响应状态码: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DashScope API调用失败:', response.status);
      console.error('错误详情:', errorText);
      return null;
    }

    const data = await response.json();
    console.log(`[DashScope] 响应数据:`, JSON.stringify(data, null, 2));
    
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('DashScope调用异常:', error.message);
    console.error('异常详情:', error);
    return null;
  }
}

function generatePredictWarning(spotName, peakCrowd, peakSaturation, peakTime, currentCrowd) {
  const saturation = Math.round(peakSaturation);
  
  if (saturation > 80) {
    return `⚠️ 【${spotName}客流预警】未来2小时预计峰值达${peakCrowd}人（饱和度${saturation}%），约${peakTime}出现高峰。当前${currentCrowd}人，建议在高峰前离开或改道其他景点。`;
  } else if (saturation > 60) {
    return `📊 【${spotName}客流提示】未来2小时预计峰值${peakCrowd}人（饱和度${saturation}%），峰值约在${peakTime}。当前${currentCrowd}人，建议错峰游览。`;
  } else {
    return `✅ 【${spotName}客流正常】未来2小时预计峰值${peakCrowd}人（饱和度${saturation}%），当前${currentCrowd}人，适合游览。`;
  }
}

function generateRouteDescription(path) {
  if (!path || path.length < 2) return '路线规划失败';
  
  const from = path[0];
  const to = path[path.length - 1];
  const waypoints = path.slice(1, -1);
  
  let desc = `🗺️ 推荐路线：${from.name}`;
  waypoints.forEach(w => {
    desc += ` → ${w.name}（${w.crowd}人）`;
  });
  desc += ` → ${to.name}\n\n`;
  desc += `💡 选择理由：此路线途经${waypoints.length}个低人流景点，可避开拥挤区域。`;
  
  return desc;
}

module.exports = {
  callLLM,
  callOpenAILLM,
  callDashScopeLLM,
  generatePredictWarning,
  generateRouteDescription
};
