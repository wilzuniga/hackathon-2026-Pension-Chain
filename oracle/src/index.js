import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { analyzeWallet } from './wallet-analyzer.js';
import { startSession, sendMessage, deleteSession } from './oracle-agent.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/session/start', async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'address required' });

  try {
    const lang = req.body.lang || 'en';
    const walletAnalysis = await analyzeWallet(address, process.env.HELIUS_API_KEY);
    const sessionId = uuidv4();
    const { message } = startSession(sessionId, walletAnalysis, lang);
    res.json({ sessionId, message, walletAnalysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/session/:sessionId/message', async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  try {
    const result = await sendMessage(sessionId, message);
    res.json(result);
  } catch (err) {
    const status = err.message === 'Session not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

app.delete('/api/session/:sessionId', (req, res) => {
  deleteSession(req.params.sessionId);
  res.json({ ok: true });
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Pension Oracle running on :${PORT}`));
