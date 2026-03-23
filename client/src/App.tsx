import { useState, useEffect, useRef, useCallback } from 'react';

// ── Icons ─────────────────────────────────────────────────────────────────────

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M5 3.5l11 5.5-11 5.5V3.5z" fill="#1c1c1c" />
  </svg>
);

const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="12" height="12" rx="2" fill="#1c1c1c" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1c1c1c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 9A6.5 6.5 0 1 1 13.8 4.8" />
    <polyline points="14 2 14 5.5 10.5 5.5" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
    <line x1="1" y1="1" x2="13" y2="13" />
    <line x1="13" y1="1" x2="1" y2="13" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Parses **highlighted** text and paragraph breaks into React nodes
function parseBrief(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, pIdx) => {
    const parts = para.split(/(\*\*.*?\*\*)/g);
    const nodes = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={i} className="brief-highlight">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
    return <p key={pIdx}>{nodes}</p>;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function App() {
  const [subtitle, setSubtitle] = useState('');
  const [brief, setBrief]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError]       = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const esRef  = useRef<EventSource | null>(null);
  const rawRef = useRef(''); // accumulates raw streamed text

  const fetchBrief = useCallback(() => {
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    window.speechSynthesis?.cancel();

    setSubtitle('');
    setBrief('');
    setError('');
    setLoading(true);
    setStreaming(false);
    setIsSpeaking(false);
    rawRef.current = '';

    let started = false;
    const es = new EventSource('/api/brief');
    esRef.current = es;

    es.onmessage = (e) => {
      if (!started) {
        started = true;
        setLoading(false);
        setStreaming(true);
      }

      if (e.data === '[DONE]') {
        es.close();
        esRef.current = null;
        setStreaming(false);

        // Final clean parse as fallback for edge cases
        const raw = rawRef.current.trim();
        const subMatch  = raw.match(/^SUBTITLE:\s*(.+)/m);
        const briefMatch = raw.match(/---\n([\s\S]+)$/m);
        if (subMatch && briefMatch) {
          setSubtitle(subMatch[1].trim());
          setBrief(briefMatch[1].trim());
        } else {
          setBrief(raw.replace(/SUBTITLE:.*\n?---?\n?/s, '').trim());
        }
        return;
      }

      try {
        const { text } = JSON.parse(e.data) as { text: string };
        rawRef.current += text;

        // Real-time parse: update subtitle and brief as they stream in
        const raw = rawRef.current;
        const subMatch = raw.match(/^SUBTITLE:\s*(.+)/m);
        if (subMatch) setSubtitle(subMatch[1].trim());

        const dividerIdx = raw.indexOf('---\n');
        if (dividerIdx !== -1) {
          setBrief(raw.slice(dividerIdx + 4));
        }
      } catch { /* skip malformed */ }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setLoading(false);
      setStreaming(false);
      if (!started) {
        setError('Could not reach the server. Make sure the server is running on port 3001.');
      }
    };
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchBrief();
    return () => { esRef.current?.close(); window.speechSynthesis?.cancel(); };
  }, [fetchBrief]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (brief && !loading && !streaming) handlePlay();
      }
      if (e.key === 'r' || e.key === 'R') {
        if (!loading && !streaming) fetchBrief();
      }
      if (e.key === 'Escape') {
        window.close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief, loading, streaming]);

  const handlePlay = () => {
    if (!window.speechSynthesis || !brief) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const plain = brief.replace(/\*\*(.*?)\*\*/g, '$1');
    const utt = new SpeechSynthesisUtterance(plain);
    utt.rate  = 0.95;
    utt.pitch = 1.15;

    const voices = window.speechSynthesis.getVoices();
    const femaleNames = [
      'Samantha', 'Google UK English Female', 'Google US English Female',
      'Microsoft Zira', 'Microsoft Jenny', 'Karen', 'Moira', 'Tessa',
      'Veena', 'Fiona', 'Victoria', 'Allison', 'Ava', 'Susan',
    ];
    const preferred =
      femaleNames.reduce<SpeechSynthesisVoice | undefined>((found, name) =>
        found ?? voices.find((v) => v.name.includes(name)), undefined)
      ?? voices.find((v) => v.name.toLowerCase().includes('female'))
      ?? voices.find((v) => v.lang.startsWith('en'));
    if (preferred) utt.voice = preferred;

    utt.onstart = () => setIsSpeaking(true);
    utt.onend   = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const canPlay    = !!brief && !loading && !streaming;
  const canRefresh = !loading && !streaming;

  return (
    <div className="app">
      <div className="main-content">

        {/* Header */}
        <div className="header">
          <div className="header-left">
            <h1 className="greeting">{getGreeting()}, Vedant</h1>
            <p className="subtitle">
              {loading
                ? 'Preparing your brief…'
                : subtitle || '\u00A0'}
            </p>
          </div>

          <div className="btn-groups">
            {/* Play */}
            <div className="btn-group">
              <span className="kbd-tag">SPACE</span>
              <button
                className="icon-btn"
                onClick={handlePlay}
                disabled={!canPlay}
                title={isSpeaking ? 'Stop' : 'Play Brief'}
              >
                {isSpeaking ? <StopIcon /> : <PlayIcon />}
              </button>
            </div>

            {/* Refresh */}
            <div className="btn-group">
              <span className="kbd-tag">R</span>
              <button
                className="icon-btn"
                onClick={fetchBrief}
                disabled={!canRefresh}
                title="Refresh"
              >
                <RefreshIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Brief */}
        <div className="brief-section">
          {loading && (
            <div className="loading-dots">
              <span /><span /><span />
            </div>
          )}

          {!loading && error && !brief && (
            <p className="brief-error">{error}</p>
          )}

          {!loading && brief && (
            <div className="brief-text">
              {parseBrief(brief)}
            </div>
          )}
        </div>

      </div>

      {/* Bottom close */}
      <div className="bottom-section">
        <span className="kbd-tag">ESC</span>
        <button className="close-btn" onClick={() => window.close()} title="Close">
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
