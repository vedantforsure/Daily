import Groq from 'groq-sdk';
import { Response } from 'express';
import { getMockData } from './mock-data';

export async function generateBrief(res: Response, userName = 'Runit') {
  const client = new Groq();
  const { emails, calendarEvents } = getMockData();
  const importantEmails = emails.filter((e) => e.isImportant);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  const dataContext = `Date: ${dateStr}
User: ${userName}

MEETINGS TODAY (${calendarEvents.length}):
${calendarEvents
  .sort((a, b) => a.startTime.localeCompare(b.startTime))
  .map(
    (e) =>
      `- ${e.title} at ${formatTime(e.startTime)}–${formatTime(e.endTime)}, ${e.location || 'no location'} (with ${e.attendees.filter((a) => a !== 'You').join(', ')})`
  )
  .join('\n')}

IMPORTANT EMAILS (${importantEmails.length} of ${emails.length} total):
${importantEmails
  .map((e) => `- From: ${e.from}\n  Subject: ${e.subject}\n  Preview: ${e.preview}`)
  .join('\n\n')}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const stream = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 350,
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a warm, friendly personal assistant — like a cheerful best friend who happens to be super organised. You're writing the user's daily brief.

Output format — follow this EXACTLY:
SUBTITLE: [one short upbeat sentence summarising the vibe of the day, e.g. "Honestly a pretty chill day — you've got this!" or "A couple of things to take care of, but nothing you can't handle."]
---
[the brief: 2–3 short paragraphs, each exactly 1 sentence]

Brief writing rules:
- Write in second person ("you")
- Be concise — every word must earn its place, no fluff or filler
- Combine related items into one sentence rather than splitting them across paragraphs
- Wrap key action items, names, amounts, and deadlines in **double asterisks** so they appear highlighted, e.g. "Don't forget to **reply to Arjun** about those revisions!"
- Tone: warm, upbeat, encouraging — like a supportive friend giving you a quick heads-up
- Light natural phrases are fine ("Oh, and—", "Just a heads-up —") but only when they save space, not add it
- No bullet points, no headers, no extra markdown beyond ** for highlights`,
      },
      {
        role: 'user',
        content: `Write my daily brief:\n\n${dataContext}`,
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
