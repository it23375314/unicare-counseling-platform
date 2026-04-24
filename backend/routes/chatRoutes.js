const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/chat/health — check if AI (Ollama) is reachable
router.get('/health', async (req, res) => {
  try {
    const baseUrl = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const tagsPath = process.env.OLLAMA_TAGS_PATH || '/api/tags';
    const ollamaApiKey = process.env.OLLAMA_API_KEY;

    const response = await axios.get(
      `${baseUrl}${tagsPath}`,
      {
        timeout: 5000,
        headers: ollamaApiKey ? { Authorization: `Bearer ${ollamaApiKey}` } : undefined
      }
    );
    res.json({ ok: true, models: response.data?.models || [] });
  } catch (error) {
    res.status(503).json({ ok: false, error: error.message });
  }
});

// POST /api/chat — send a message to the UniBot AI wellness assistant
router.post('/', async (req, res) => {
  const { message, history } = req.body;
  const baseUrl = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
  const chatPath = process.env.OLLAMA_CHAT_PATH || '/api/chat';
  const ollamaApiKey = process.env.OLLAMA_API_KEY;
  const ollamaModel = process.env.OLLAMA_MODEL || 'gemma4:latest';

  // Fallback mock responses when AI is unavailable
  const getMockResponse = (userMsg) => {
    const lower = userMsg.toLowerCase();

    if (lower.includes('sad') || lower.includes('depressed') || lower.includes('lonely')) {
      return "**Empathy:**\nI'm sorry you're feeling down. That can be a really heavy weight to carry, especially when trying to balance university life.\n\n**Possible Reason:**\nIt sounds like feelings of isolation and overwhelming academic pressure are affecting your mood today.\n\n**Suggestions:**\n• **Practice Box Breathing:** Inhale deeply for 4 seconds, hold for 4 seconds, and exhale for 4 seconds. This physically signals your nervous system to calm down.\n• **Reach Out to Campus Support:** Don't carry this alone. Visit the UniCare counseling center or reach out to a trusted friend just to chat.\n\n**Encouragement:**\nYou don't have to figure everything out today — taking it one small step at a time is more than enough.";
    }
    if (lower.includes('stress') || lower.includes('anxious') || lower.includes('overwhelmed')) {
      return "**Empathy:**\nI hear how stressed you are. It is completely normal for students to feel overwhelmed when deadlines pile up.\n\n**Possible Reason:**\nIt sounds like your current workload and the fear of falling behind are putting immense pressure on you.\n\n**Suggestions:**\n• **The 10-Minute Rule:** Pick your most stressful task and commit to doing it for just 10 minutes. Often, getting started breaks the cycle of anxiety.\n• **Digital Detox Walk:** Step away from all screens and take a 15-minute walk outside to reset your mental fatigue.\n\n**Encouragement:**\nYou are highly capable of handling this. Just focus on the very next step, not the whole staircase.";
    }

    return "**Empathy:**\nThank you for sharing that with me. Checking in with your emotions is a fantastic habit for your mental health.\n\n**Possible Reason:**\nIt sounds like you are processing your daily experiences and actively looking for ways to maintain your balance.\n\n**Suggestions:**\n• **Gratitude Journaling:** Take 2 minutes to write down three specific things that went well today to reinforce positive thinking.\n• **Hydration and Rest:** Ensure you drink a glass of water right now and prioritize getting a full 8 hours of sleep tonight.\n\n**Encouragement:**\nYou are doing an excellent job prioritizing your well-being. Keep up the great work!";
  };

  const systemPrompt = {
    role: 'system',
    content: `You are 'UniBot', a compassionate mental wellness assistant for university students at UniCare.

Your responses MUST be highly informative, actionable, and visually structured. Follow this EXACT format for every response:

**Empathy:**
[1-2 sentences acknowledging the user's feelings warmly.]

**Possible Reason:**
[1 sentence reflecting what might be causing the feeling.]

**Suggestions:**
• **[Bolded Strategy 1]:** [2-3 detailed sentences explaining HOW to do this and WHY it helps.]
• **[Bolded Strategy 2]:** [2-3 detailed sentences. If in severe distress, recommend calling the 1926 mental health helpline.]

**Encouragement:**
[1 empowering closing sentence.]

CRITICAL RULES:
- Use simple, comforting English.
- Use bullet (•) for suggestions.
- Bold the name of each strategy.
- Provide practical, detailed steps.
- Always include the bolded section headers.`
  };

  try {
    const messages = [systemPrompt, ...history, { role: 'user', content: message }];

    const response = await axios.post(
      `${baseUrl}${chatPath}`,
      { model: ollamaModel, messages, stream: false },
      {
        timeout: 15000,
        headers: ollamaApiKey ? { Authorization: `Bearer ${ollamaApiKey}` } : undefined
      }
    );

    res.json({ reply: response.data?.message?.content || '' });
  } catch (error) {
    console.error('Chatbot Error:', error.message);
    res.json({ reply: getMockResponse(message) });
  }
});

module.exports = router;
