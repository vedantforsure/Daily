import Groq from 'groq-sdk';
import { Response } from 'express';
import { getMockData } from './mock-data';

export async function handleQuestion(
  res: Response,
  question: string,
  briefContext = ''
) {
  const client = new Groq();
  const { emails, calendarEvents } = getMockData();

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  const dataContext = `Emails: ${emails.map((e) => `${e.from} — "${e.subject}"`).join(' | ')}
Meetings: ${calendarEvents.map((e) => `${e.title} at ${formatTime(e.startTime)}`).join(' | ')}
Brief: ${briefContext}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

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
        content: `Context: ${dataContext}\n\nQuestion: ${question}`,
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
}
