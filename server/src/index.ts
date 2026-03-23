import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateBrief } from './brief';
import { handleQuestion } from './question';

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.error('ERROR: GROQ_API_KEY is not set. Create a .env file in the server directory.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stream the daily brief
app.get('/api/brief', async (req, res) => {
  try {
    await generateBrief(res, 'Vedant');
  } catch (err) {
    console.error('Brief generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate brief' });
    }
  }
});

// Stream an answer to a follow-up question
app.post('/api/ask', async (req, res) => {
  const { question, context } = req.body as { question: string; context: string };
  if (!question?.trim()) {
    res.status(400).json({ error: 'Question is required' });
    return;
  }
  try {
    await handleQuestion(res, question.trim(), context);
  } catch (err) {
    console.error('Question error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to answer question' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`\n  Daily Brief server → http://localhost:${PORT}\n`);
});
