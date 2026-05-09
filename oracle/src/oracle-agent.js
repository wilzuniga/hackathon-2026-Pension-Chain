import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const SYSTEM_PROMPT_EN = `You are Pension Oracle, a financial advisor for PensionChain — a decentralized pension fund on Solana.

Your only role is to determine the user's retirement risk profile: Conservative, Balanced, or Aggressive.

Rules:
- Ask 3-5 short questions, one at a time
- Never discuss topics unrelated to retirement planning or investment risk
- Keep each response under 3 sentences
- When you have enough information, end your message with the final recommendation block

Scoring (internal):
- Conservative (0-40): Capital preservation, near retirement, risk-averse
- Balanced (41-65): Moderate growth, 10-25 years to retirement
- Aggressive (66-100): Maximum growth, long horizon, high volatility tolerance

When ready to finalize, append exactly:
<FINAL>
{"profile":"Conservative|Balanced|Aggressive","score":0-100,"reasoning":"one sentence"}
</FINAL>`;

const SYSTEM_PROMPT_ES = `Eres Pension Oracle, un asesor financiero de PensionChain — un fondo de pensiones descentralizado en Solana.

Tu único rol es determinar el perfil de riesgo de retiro del usuario: Conservative, Balanced o Aggressive.

Reglas:
- Haz 3-5 preguntas cortas, de una en una
- Nunca hables de temas ajenos a la planificación del retiro o el riesgo de inversión
- Mantén cada respuesta en menos de 3 oraciones
- Cuando tengas suficiente información, finaliza con el bloque de recomendación

Puntuación (interna):
- Conservative (0-40): Preservación de capital, cerca del retiro, averso al riesgo
- Balanced (41-65): Crecimiento moderado, 10-25 años para el retiro
- Aggressive (66-100): Máximo crecimiento, horizonte largo, alta tolerancia a la volatilidad

Cuando estés listo para finalizar, agrega exactamente:
<FINAL>
{"profile":"Conservative|Balanced|Aggressive","score":0-100,"reasoning":"una oración"}
</FINAL>`;

const sessions = new Map();

export function startSession(sessionId, walletAnalysis, lang = 'en') {
  const isEs = lang === 'es';
  const basePrompt = isEs ? SYSTEM_PROMPT_ES : SYSTEM_PROMPT_EN;

  const contextNote = walletAnalysis.protocolsUsed.length > 0
    ? `User wallet shows activity on: ${walletAnalysis.protocolsUsed.map((p) => p.name).join(', ')}. Risk score from on-chain data: ${walletAnalysis.riskScore}/100. ${walletAnalysis.summary}`
    : `No significant on-chain activity. Start with an open question.`;

  const langNote = isEs ? `\n\nResponde SIEMPRE en español.` : '';
  const systemWithContext = `${basePrompt}${langNote}\n\nWALLET CONTEXT (do not quote directly):\n${contextNote}`;

  const opening = isEs
    ? walletAnalysis.riskScore >= 65
      ? 'Tu wallet muestra experiencia con protocolos DeFi de alto riesgo. Para construir tu perfil de pensión: **si tu portafolio cayera 20% en un mes, ¿qué harías?**\n\n→ A) Mover a seguridad\n→ B) Mantener y esperar\n→ C) Comprar más'
      : walletAnalysis.riskScore >= 40
      ? 'Tu wallet muestra actividad DeFi variada. Para personalizar tu perfil: **si tu portafolio cayera 20% en un mes, ¿qué harías?**\n\n→ A) Mover a seguridad\n→ B) Mantener y esperar\n→ C) Comprar más'
      : 'Para construir tu perfil de retiro: **si tu portafolio cayera 20% en un mes, ¿qué harías?**\n\n→ A) Mover a seguridad\n→ B) Mantener y esperar\n→ C) Comprar más'
    : walletAnalysis.riskScore >= 65
      ? 'Your wallet shows experience with high-risk DeFi protocols. To build your pension profile: **if your portfolio dropped 20% in one month, what would you do?**\n\n→ A) Move to safety\n→ B) Hold and wait\n→ C) Buy more'
      : walletAnalysis.riskScore >= 40
      ? 'Your wallet shows a healthy mix of DeFi activity. To tailor your pension profile: **if your portfolio dropped 20% in one month, what would you do?**\n\n→ A) Move to safety\n→ B) Hold and wait\n→ C) Buy more'
      : 'To build your retirement profile: **if your portfolio dropped 20% in one month, what would you do?**\n\n→ A) Move to safety\n→ B) Hold and wait\n→ C) Buy more';

  sessions.set(sessionId, {
    systemPrompt: systemWithContext,
    messages: [{ role: 'assistant', content: opening }],
    walletAnalysis,
    finalized: false,
  });

  return { message: opening };
}

export async function sendMessage(sessionId, userMessage) {
  const session = sessions.get(sessionId);
  if (!session) throw new Error('Session not found');
  if (session.finalized) throw new Error('Session already finalized');

  session.messages.push({ role: 'user', content: userMessage });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: session.systemPrompt,
    messages: session.messages,
  });

  const text = response.content[0].text;
  session.messages.push({ role: 'assistant', content: text });

  const match = text.match(/<FINAL>([\s\S]*?)<\/FINAL>/);

  if (match) {
    const rec = JSON.parse(match[1].trim());
    session.finalized = true;
    return {
      message: text.replace(/<FINAL>[\s\S]*?<\/FINAL>/, '').trim(),
      finalized: true,
      recommendation: {
        ...rec,
        walletScore: session.walletAnalysis.riskScore,
        profileCode: { Conservative: 0, Balanced: 1, Aggressive: 2 }[rec.profile] ?? 1,
      },
    };
  }

  return { message: text, finalized: false };
}

export function deleteSession(sessionId) {
  sessions.delete(sessionId);
}
