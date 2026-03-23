export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  isImportant: boolean;
  labels: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  location?: string;
}

export function getMockData() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const emails: Email[] = [
    {
      id: '1',
      from: 'Rohan Verma <rohan@novalabs.in>',
      subject: 'Quick feedback on the dashboard prototype',
      preview:
        "Hey, finally got a chance to go through the prototype — honestly really impressed. Just two small things: the empty state on the analytics tab feels bare, and the mobile nav needs a bit of love. Can we sort this before Thursday's handoff?",
      timestamp: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
      isImportant: true,
      labels: ['client', 'feedback'],
    },
    {
      id: '2',
      from: 'noreply@razorpay.com',
      subject: 'Payment of ₹62,500 credited to your account',
      preview:
        'Great news — the payment of ₹62,500 from Nova Labs Pvt. Ltd. has been processed and will reflect in your account within 1 business day. Reference: pay_Nv8xKL34mZ.',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      isImportant: true,
      labels: ['payment', 'finance'],
    },
    {
      id: '3',
      from: 'Anika Sood <anika@threadco.in>',
      subject: 'Proposal for the brand refresh — need your go-ahead',
      preview:
        "Attached is the revised proposal with the updated scope and timeline. We've incorporated your feedback from last week. Pending your approval to kick things off — ideally by end of day today so we stay on track.",
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      isImportant: true,
      labels: ['client', 'approval'],
    },
    {
      id: '4',
      from: 'Karan Mehta <karan@freelanceflow.co>',
      subject: 'Re: Collab on the fintech project?',
      preview:
        "I'm in! The brief looks solid. I can take on the UX research and wireframing side if you handle visual design. Let's jump on a call this week to split the work properly.",
      timestamp: new Date(now.getTime() - 7 * 60 * 60 * 1000).toISOString(),
      isImportant: false,
      labels: ['collaboration'],
    },
    {
      id: '5',
      from: 'billing@figma.com',
      subject: 'Your Figma Professional plan renews in 3 days',
      preview:
        'Just a heads-up that your Figma Professional subscription will auto-renew on the 26th for $15. No action needed unless you want to make changes to your plan.',
      timestamp: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(),
      isImportant: true,
      labels: ['billing', 'subscription'],
    },
    {
      id: '6',
      from: 'digest@dribbble.com',
      subject: 'This week in design: gradients are back (again)',
      preview:
        'Top shots this week, trending palettes, and a deep-dive into why everyone is suddenly obsessed with mesh gradients again...',
      timestamp: new Date(now.getTime() - 16 * 60 * 60 * 1000).toISOString(),
      isImportant: false,
      labels: ['newsletter'],
    },
  ];

  const calendarEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Standup — Nova Labs',
      startTime: `${today}T10:00:00`,
      endTime: `${today}T10:20:00`,
      attendees: ['Rohan Verma', 'Priya Nair', 'You'],
      location: 'Google Meet',
    },
    {
      id: '2',
      title: 'Brand Refresh Kickoff — Thread Co.',
      startTime: `${today}T12:00:00`,
      endTime: `${today}T13:00:00`,
      attendees: ['Anika Sood', 'Dev Anand', 'You'],
      location: 'Zoom',
    },
    {
      id: '3',
      title: 'Lunch with Karan',
      startTime: `${today}T13:30:00`,
      endTime: `${today}T14:30:00`,
      attendees: ['Karan Mehta', 'You'],
      location: 'The Smoke Co., Bandra',
    },
    {
      id: '4',
      title: 'Portfolio Review — self',
      startTime: `${today}T17:00:00`,
      endTime: `${today}T18:00:00`,
      attendees: ['You'],
      location: undefined,
    },
  ];

  return { emails, calendarEvents };
}
