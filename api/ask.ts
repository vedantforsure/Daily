import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';
import { getMockData } from '../server/src/mock-data';

const MOCK_ANSWERS: Record<string, string> = {
  default: "This is a demo — connect a **GROQ_API_KEY** to get real answers to your questions!",
  meeting: "You've got **four meetings** today: Nova Labs standup at 10am, the Thread Co. brand refresh kickoff at noon, lunch with Karan at 1:30pm, and a solo portfolio review at 5pm.",
  email: "Your most urgent emails are **Rohan's feedback** on the dashboard prototype and **Anika's proposal** waiting for your go-ahead — both need replies today.",
  money: "**₹62,500 from Nova Labs** just landed in your account — should be there within 1 business day.",
};

async function streamMock(res: VercelResponse, question: string) {
  const q = question.toLowerCase();
  const text =
    q.includes('meet') || q.includes('call') || q.includes('standup') ? MOCK_ANSWERS.meeting :
    q.includes('email') || q.includes('mail') || q.includes('message') ? MOCK_ANSWERS.email :
    q.includes('money') || q.includes('payment') || q.includes('paid') ? MOCK_ANSWERS.money :
    MOCK_ANSWERS.default;

  const words = text.split(' ');
  for (const word of words) {
    res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
    await new Promise((r) => setTimeout(r, 30));
  }
  res.write('data: [DONE]\n\n');
  res.end();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { question, context } = req.body as { question: string; context: string };
  if (!question?.trim()) {
    res.status(400).json({ error: 'Question is required' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  (res as any).flushHeaders();

  if (!process.env.GROQ_API_KEY) {
    await streamMock(res, question);
    return;
  }

  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const { emails, calendarEvents } = getMockData();

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const dataContext = `Emails: ${emails.map((e) => `${e.from} — "${e.subject}"`).join(' | ')}
Meetings: ${calendarEvents.map((e) => `${e.title} at ${formatTime(e.startTime)}`).join(' | ')}
Brief: ${context}`;

  try {
    const stream = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 150,
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            "You are a personal assistant answering follow-up questions about the user's day. Be concise and natural — 1 to 3 sentences max. Use the context provided.",
        },
        {
          role: 'user',
          content: `Context: ${dataContext}\n\nQuestion: ${question.trim()}`,
        },
      ],
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Question error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to answer question' });
    } else {
      res.end();
    }
  }
}
