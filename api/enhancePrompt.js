// api/enhancePrompt.js
const { OpenAI } = require('openai');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style, creativity } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const enhancementInstruction = `Enhance the following prompt using ${style} style with creativity level ${creativity}/10.\nApply prompt engineering best practices to make it more effective for AI interaction.\nReturn only the enhanced prompt without any additional explanations.`;

    const completion = await openai.chat.completions.create({
      model: '', // TODO: use latest model
      messages: [
        { role: 'system', content: enhancementInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    const enhancedPrompt = completion.choices?.[0]?.message?.content || '';
    return res.status(200).json({ enhancedPrompt });
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return res.status(500).json({ error: 'Failed to enhance prompt' });
  }
};
