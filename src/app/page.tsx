"use client";

import { useState, useRef, useEffect } from "react";
import "./product-showcase.css";

const TAB_DURATION = 5000; // ms per tab

/* ─── data ─── */
const TABS = [
  { key: "agents", label: "AI Crew" },
  { key: "workflows", label: "Workflows" },
  { key: "chatbot", label: "Chatbot Builder" },
  { key: "speech", label: "Voice Agents" },
  { key: "voiceCloning", label: "Voice Cloning" },
];

const VOICES = [
  { id: "UgBBYS2sOqTuMpoF3BR0", name: "Mark", desc: "Natural Conversations", bg: "bg03" },
  { id: "NOpBlnGInO9m6vDvFkFC", name: "Spuds Oxley", desc: "Wise and Approachable", bg: "bg04" },
  { id: "EkK5I93UQWFDigLMpZcX", name: "James", desc: "Husky, Engaging and Bold", bg: "bg08" },
  { id: "56AoDkrOh6qfVPDXZ7Pt", name: "Cassidy", desc: "Crisp, Direct and Clear", bg: "bg01" },
  { id: "uju3wxzG5OhpWcoi3SMy", name: "Michael C. Vincent", desc: "Confident, Expressive", bg: "bg06" },
  { id: "tnSpp4vdxKPjI9w0GnoV", name: "Hope", desc: "Upbeat and Clear", bg: "bg05" },
  { id: "G17SuINrv2H9FC6nvetn", name: "Christopher", desc: "Gentle and Trustworthy", bg: "bg07" },
  { id: "IRHApOXLvnW57QJPQH2P", name: "Adam", desc: "American, Dark and Tough", bg: "bg02" },
  { id: "EiNlNiXeDU1pqqOPrYMO", name: "John Doe", desc: "Deep", bg: "bg03" },
  { id: "1SM7GgM6IMuvQlz2BwM3", name: "Mark", desc: "Casual, Relaxed and Light", bg: "bg04" },
  { id: "ZthjuvLPty3kTMaNKVKb", name: "Peter", desc: "", bg: "bg08" },
  { id: "Z3R5wn05IrDiVCyEkUrK", name: "Arabella", desc: "Mysterious and Emotive", bg: "bg01" },
  { id: "lxYfHSkYm1EzQzGhdbfc", name: "Jessica Anne Bogart", desc: "A VO Professional; now cloned!", bg: "bg06" },
  { id: "e5WNhrdI30aXpS2RSGm1", name: "Ian Cartwell", desc: "Suspense and Mystery", bg: "bg05" },
  { id: "yl2ZDV1MzN4HbQJbMihG", name: "Alex", desc: "Upbeat, Energetic and Clear", bg: "bg07" },
  { id: "kqVT88a5QfII1HNAEPTJ", name: "Declan Sage", desc: "Wise and Captivating", bg: "bg02" },
  { id: "NNl6r8mD7vthiJatiJt1", name: "Bradford", desc: "Expressive and Articulate", bg: "bg03" },
  { id: "XjLkpWUlnhS8i7gGz3lZ", name: "David Castlemore", desc: "Newsreader and Educator", bg: "bg04" },
  { id: "j9jfwdrw7BRfcR43Qohk", name: "Frederick Surrey", desc: "Smooth and Velvety", bg: "bg08" },
  { id: "MFZUKuGQUsGJPQjTS4wC", name: "Jon", desc: "Warm & Grounded Storyteller", bg: "bg01" },
];

const BG_COLORS: Record<string, string> = {
  bg01: "#e8d5c4",
  bg02: "#c4d4e8",
  bg03: "#d4e8c4",
  bg04: "#e8c4d4",
  bg05: "#c4e8d9",
  bg06: "#dbc4e8",
  bg07: "#e8e0c4",
  bg08: "#c4cfe8",
};

const DEFAULT_TEXT =
  'In the ancient land of Eldoria, where skies shimmered and forests, whispered secrets to the wind, lived a dragon named Zephyros. [sarcastically] Not the "burn it all down" kind... [giggles] but he was gentle, wise, with eyes like old stars. [whispers] Even the birds fell silent when he passed.';

function renderAnnotatedText(raw: string) {
  const parts = raw.split(/(\[[^\]]+\])/g);
  return parts.map((p, i) =>
    p.startsWith("[") ? (
      <span key={i} className="text-annotation">
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export default function ProductShowcase() {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [text, setText] = useState(DEFAULT_TEXT);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-rotation with refs to avoid stale closures
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const progressRef = useRef(0);
  const pausedRef = useRef(false);
  const activeIdxRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(performance.now());

  // Keep refs in sync
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { activeIdxRef.current = activeTabIdx; }, [activeTabIdx]);

  // Single rAF loop — no intervals, no race conditions
  useEffect(() => {
    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      if (!pausedRef.current) {
        const increment = (dt / TAB_DURATION) * 100;
        progressRef.current += increment;

        if (progressRef.current >= 100) {
          // Move to next tab
          const nextIdx = (activeIdxRef.current + 1) % TABS.length;
          activeIdxRef.current = nextIdx;
          progressRef.current = 0;
          setActiveTabIdx(nextIdx);
          setProgress(0);
        } else {
          setProgress(progressRef.current);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // single loop, never recreated

  // Manual tab click handler
  const handleTabClick = (idx: number) => {
    setActiveTabIdx(idx);
    activeIdxRef.current = idx;
    progressRef.current = 0;
    setProgress(0);
  };

  const activeTab = TABS[activeTabIdx].key;

  const selectedVoiceData = VOICES.find((v) => v.id === selectedVoice) ?? VOICES[0];

  return (
    <div className="showcase-page">
      <div className="showcase-container">
        <script
          id="tts-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@context": "https://schema.org",
                  name: "ElevenLabs Text to Speech",
                  description: "High quality, human-like AI voice generator in 70 languages",
                  "@type": "Product",
                  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.5", reviewCount: "1027" },
                },
              ],
            }),
          }}
        />

        <div style={{ position: "relative", isolation: "isolate", marginTop: "1.75rem" }}>
          <div className="omnibox-wrapper">
            <div className="omnibox-ring" />

            {/* ── Tabs ── */}
            <div className="tab-bar-outer">
              <div className="tab-bar-scroll">
                <div className="tab-bar-scroll-inner">
                  <div className="tab-bar-flex">
                    <div className="tab-list" role="tablist" aria-orientation="horizontal">
                      {TABS.map((tab, i) => {
                        const isActive = i === activeTabIdx;
                        return (
                          <div
                            key={tab.key}
                            className={`tab-item ${isActive ? "tab-item--active" : ""}`}
                            role="tab"
                            tabIndex={isActive ? 0 : -1}
                            aria-selected={isActive}
                            onClick={() => handleTabClick(i)}
                            onMouseEnter={() => setPaused(true)}
                            onMouseLeave={() => setPaused(false)}
                            style={{
                              gridColumnStart: i + 1,
                              paddingLeft: i === 0 ? "1.125rem" : "1.1875rem",
                              paddingRight: i === TABS.length - 1 ? "1.125rem" : "1.1875rem",
                            }}
                          >
                            <div className="tab-hit-area" />
                            <div className="tab-label-wrap" style={{ color: isActive ? "#000" : "#57534e" }}>
                              <div className="tab-label">{tab.label}</div>
                            </div>
                            {/* Pill: only active tab gets the sweeping fill */}
                            <div className={isActive ? "tab-pill-active" : "tab-pill-inactive"}>
                              {isActive && (
                                <div
                                  className="tab-pill-progress"
                                  style={{ transform: `scaleX(${progress / 100})` }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tab Panel (speech) ── */}
            {activeTab === "speech" && (
              <div className="tab-panel-contents" role="tabpanel">
                <div className="product-desc">
                  <p className="product-title" aria-hidden="true">Text to Speech</p>
                  <p className="product-subtitle">Transform text into lifelike speech across 70+ languages</p>
                </div>

                <div className="main-content-area">
                  <div className="main-content-inner">
                    <div className="omnibox-card">
                      <div className="card-divider" />
                      <div className="card-split">
                        {/* ── Voice list ── */}
                        <div className="voice-panel">
                          <div className="voice-list" role="radiogroup" aria-label="Voice">
                            {VOICES.map((voice, idx) => {
                              const isSelected = voice.id === selectedVoice;
                              const isGroupFirst = idx % 5 === 0;
                              const isGroupLast = idx % 5 === 4;
                              return (
                                <div key={voice.id} className="voice-item" data-selected={isSelected || undefined}>
                                  <label
                                    style={{
                                      paddingTop: isGroupFirst ? "0.6875rem" : undefined,
                                      paddingBottom: isGroupLast ? "0.6875rem" : undefined,
                                    }}
                                  >
                                    <span className="sr-only">
                                      <input
                                        type="radio"
                                        name="voice-select"
                                        value={voice.id}
                                        checked={isSelected}
                                        onChange={() => setSelectedVoice(voice.id)}
                                        tabIndex={isSelected ? 0 : -1}
                                      />
                                    </span>
                                    <div className="voice-row">
                                      <div className="voice-row-bg" />
                                      <div className="voice-avatar">
                                        <div
                                          style={{
                                            width: "1.25rem",
                                            height: "1.25rem",
                                            borderRadius: "9999px",
                                            background: BG_COLORS[voice.bg] ?? "#e5e7eb",
                                          }}
                                        />
                                        {isSelected && (
                                          <div className="voice-check-badge">
                                            <svg fill="none" viewBox="0 0 12 12" aria-hidden="true">
                                              <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m4 6.4 1.2 1.2L8 4.4" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      <div className="voice-info">
                                        <div className="voice-name">{voice.name}</div>
                                        {voice.desc && <div className="voice-desc">{voice.desc}</div>}
                                      </div>
                                    </div>
                                  </label>
                                  <button
                                    type="button"
                                    className="voice-preview-btn"
                                    aria-label="Preview"
                                    style={{ top: isGroupFirst ? "1.0625rem" : "0.375rem" }}
                                  >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                      <path fill="currentColor" d="M9.244 2.368C7.414 1.184 5 2.497 5 4.676v14.648c0 2.18 2.414 3.493 4.244 2.309l11.318-7.324c1.675-1.084 1.675-3.534 0-4.618z" />
                                    </svg>
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          <div className="voice-panel-footer">
                            <button type="button" className="edit-text-btn">
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Edit text</span>
                            </button>
                          </div>
                        </div>

                        {/* ── Text editor panel ── */}
                        <div className="text-panel" tabIndex={-1}>
                          <button type="button" className="back-btn">Back</button>
                          <div className="text-panel-border" />

                          <div className="text-scroll">
                            <div className="text-label-bar">
                              <p>
                                <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  Enter your own text
                                </span>
                              </p>
                            </div>
                            <div className="text-content-wrap">
                              <div className="text-display" style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
                                {renderAnnotatedText(text)}
                                {"\u200B"}
                              </div>
                              <textarea
                                ref={textareaRef}
                                className="text-textarea"
                                spellCheck={false}
                                aria-label="Enter your text here, ElevenLabs AI Voice Generator will read it for you"
                                maxLength={1000}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                              />
                            </div>
                            <div className="text-bottom-fade" />
                          </div>

                          <div className="bottom-toolbar">
                            <div className="voice-select-mobile">
                              <div style={{ minWidth: 0 }}>
                                <button type="button" className="voice-select-btn" aria-label="Voice">
                                  <span style={{ minWidth: 0 }}>
                                    <div style={{ position: "relative", minWidth: 0, display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                                      <div className="voice-select-avatar" style={{ background: BG_COLORS[selectedVoiceData.bg] ?? "#e5e7eb" }} />
                                      <div className="voice-select-name">{selectedVoiceData.name}</div>
                                    </div>
                                  </span>
                                </button>
                              </div>
                            </div>

                            <button type="button" className="play-btn" aria-label="Play">Play</button>
                            <audio className="hidden" />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="cta-area">
                  <a className="cta-btn" href="#">Sign up</a>
                </div>
              </div>
            )}

            {/* ── Agents Tab Panel ── */}
            {activeTab === "agents" && (
              <div className="tab-panel-contents" role="tabpanel">
                <div className="product-desc product-desc--compact">
                  <p className="product-subtitle">Build a team of AI agents that join standups, discuss tasks, and execute work — with you always in the loop</p>
                </div>

                <div className="main-content-area" style={{ opacity: 1 }}>
                  <div className="main-content-inner">
                    <div className="mt-card">

                      {/* ── Header ── */}
                      <div className="mt-header">
                        <div className="mt-header-left">
                          <button className="mt-back-btn" aria-label="Back">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                          </button>
                          <div>
                            <div className="mt-room-title">Daily Standup – Sprint 14</div>
                            <div className="mt-room-sub">Zoom &bull; 4 AI Agents + You</div>
                          </div>
                        </div>
                        <div className="mt-header-right">
                          <div className="mt-join-notif">
                            <span><strong>Ava (Scrum Master)</strong> wants to share screen</span>
                            <button className="mt-notif-btn mt-notif-btn--reject" aria-label="Reject">✕</button>
                            <button className="mt-notif-btn mt-notif-btn--accept" aria-label="Accept">✓</button>
                          </div>
                        </div>
                      </div>

                      {/* ── Body split ── */}
                      <div className="mt-body">

                        {/* Left: Main video area */}
                        <div className="mt-video-area">
                          <div className="mt-video-main">
                            {/* Meeting background */}
                            <div className="mt-video-bg" />
                            {/* Current speaker badge */}
                            <div className="mt-you-badge"><span className="mt-you-avatar">A</span> Ava – Scrum Master</div>
                          
                            {/* Center: large agent avatar */}
                            <div className="mt-main-agent-avatar">
                              <img src="/crew/1.png" alt="Ava" className="mt-main-agent-img" />
                              <div className="mt-speaking-ring" />
                            </div>
                            {/* Bottom controls */}
                            <div className="mt-controls">
                              <button className="mt-ctrl-btn" aria-label="Microphone">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
                              </button>
                              <button className="mt-ctrl-btn" aria-label="Camera">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                              </button>
                              <button className="mt-ctrl-btn" aria-label="Screen share">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button className="mt-ctrl-btn mt-ctrl-btn--end" aria-label="End call">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5.723 3C4.248 3 2.927 4.206 3.097 5.796c.251 2.36.993 4.662 2.19 6.723a17.1 17.1 0 006.195 6.195c2.075 1.205 4.348 1.913 6.69 2.172 1.598.177 2.829-1.143 2.829-2.636v-1.753a2.75 2.75 0 00-1.974-2.639l-1.682-.495a2.69 2.69 0 00-2.702.719c-.377.392-.914.452-1.285.212a12.3 12.3 0 01-3.652-3.651c-.24-.372-.18-.908.213-1.285a2.69 2.69 0 00.718-2.702l-.494-1.682A2.75 2.75 0 007.504 3z"/></svg>
                              </button>
                            </div>
                            {/* Subtitle bar */}
                            <div className="mt-subtitle-bar">
                              <div className="mt-subtitle-wave">
                                <svg width="20" height="16" viewBox="0 0 20 16"><rect x="1" y="4" width="2" height="8" rx="1" fill="#fff"/><rect x="5" y="2" width="2" height="12" rx="1" fill="#fff"/><rect x="9" y="5" width="2" height="6" rx="1" fill="#fff"/><rect x="13" y="1" width="2" height="14" rx="1" fill="#fff"/><rect x="17" y="6" width="2" height="4" rx="1" fill="#fff"/></svg>
                              </div>
                              <span className="mt-subtitle-label">CC/Subtitles</span>
                              <span className="mt-subtitle-text">Good morning team – let&apos;s go through yesterday&apos;s blockers and assign today&apos;s tasks...</span>
                              <button className="mt-subtitle-settings" aria-label="Settings">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                              </button>
                            </div>
                          </div>
                          {/* Participant strip — agents */}
                          <div className="mt-participants">
                            <div className="mt-participant">
                              <div className="mt-participant-thumb mt-participant-thumb--meet1">
                                <img src="/crew/2.png" alt="Max" className="mt-thumb-img" />
                              </div>
                              <span className="mt-participant-mic">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"/><path d="M19 11a7 7 0 01-14 0"/></svg>
                              </span>
                              <span className="mt-participant-name">Max &bull; Developer</span>
                            </div>
                            <div className="mt-participant">
                              <div className="mt-participant-thumb mt-participant-thumb--meet2">
                                <img src="/crew/3.png" alt="Priya" className="mt-thumb-img" />
                              </div>
                              <span className="mt-participant-mic">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"/><path d="M19 11a7 7 0 01-14 0"/></svg>
                              </span>
                              <span className="mt-participant-name">Priya &bull; PM</span>
                            </div>
                            <div className="mt-participant">
                              <div className="mt-participant-thumb mt-participant-thumb--meet3">
                                <img src="/crew/4.png" alt="Leo" className="mt-thumb-img" />
                              </div>
                              <span className="mt-participant-mic">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"/><path d="M19 11a7 7 0 01-14 0"/></svg>
                              </span>
                              <span className="mt-participant-name">Leo &bull; Tech Lead</span>
                            </div>
                            <button className="mt-participant-more" aria-label="More participants">›</button>
                          </div>
                        </div>

                        {/* Right: Sidebar */}
                        <div className="mt-sidebar">
                          {/* Summary + Tasks row */}
                          <div className="mt-info-row">
                            <div className="mt-info-card">
                              <div className="mt-info-card-title">Summary</div>
                              <p className="mt-info-card-text">Discussed Q2 sprint priorities. Auth module PR is ready. Payment integration pushed to Wednesday. Error monitoring added as new task.</p>
                            </div>
                            <div className="mt-info-card">
                              <div className="mt-info-card-title">Tasks List</div>
                              <div className="mt-task">
                                <span className="mt-task-check mt-task-check--done">✓</span>
                                <span>Review Auth PR (Leo)</span>
                              </div>
                              <div className="mt-task">
                                <span className="mt-task-check" />
                                <span>Payment integration (Max)</span>
                              </div>
                              <div className="mt-task">
                                <span className="mt-task-check" />
                                <span>Error monitoring setup (Leo)</span>
                              </div>
                              <button className="mt-info-edit" aria-label="Edit">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                              </button>
                            </div>
                          </div>

                          {/* Chat tabs */}
                          <div className="mt-chat-tabs">
                            <button className="mt-chat-tab mt-chat-tab--active">Room Chat</button>
                            <button className="mt-chat-tab">Participant</button>
                          </div>

                          {/* Chat messages */}
                          <div className="mt-chat-messages">
                            <div className="mt-chat-bubble">
                              <div className="mt-chat-bubble-head">
                                <span className="mt-chat-sender">Ava (Scrum Master)</span>
                                <span className="mt-chat-time">9:01 AM</span>
                              </div>
                              <p className="mt-chat-text">How about our problem last week?</p>
                            </div>
                            <div className="mt-chat-bubble mt-chat-bubble--you">
                              <div className="mt-chat-bubble-head">
                                <span className="mt-chat-sender">You</span>
                                <span className="mt-chat-time">9:03 AM</span>
                              </div>
                              <p className="mt-chat-text">It&apos;s all clear, no worries 😄</p>
                            </div>
                            <div className="mt-chat-bubble">
                              <div className="mt-chat-bubble-head">
                                <span className="mt-chat-sender">Leo (Tech Lead)</span>
                                <span className="mt-chat-time">9:04 AM</span>
                              </div>
                              <p className="mt-chat-text">Yes, it&apos;s been solved. Since we have daily meeting to discuss everything 😊</p>
                            </div>
                          </div>

                          {/* Chat input */}
                          <div className="mt-chat-input">
                            <input type="text" placeholder="Type message here..." readOnly />
                            <button className="mt-chat-emoji" aria-label="Emoji">😊</button>
                            <button className="mt-chat-send" aria-label="Send">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cta-area">
                  <a className="cta-btn" href="#">Deploy AI Crew</a>
                </div>
              </div>
            )}

            {/* ── Music Tab Panel ── */}
            {activeTab === "workflows" && (
              <div className="tab-panel-contents" role="tabpanel">
                <div className="product-desc">
                  <p className="product-title" aria-hidden="true">Workflows</p>
                  <p className="product-subtitle">Build automated AI workflows with visual drag-and-drop</p>
                </div>

                <div className="main-content-area" style={{ opacity: 1 }}>
                  <div className="main-content-inner">
                    <div className="wf-split">
                      {/* ── Left: Flowchart ── */}
                      <div className="wf-panel wf-panel-left">
                        <div className="wf-flow">
                          {/* Step 1 */}
                          <div className="wf-step">
                            <span className="wf-step-icon wf-step-icon--purple">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5v2"/><path d="M15 11v2"/><path d="M15 17v2"/><path d="M5 5h14a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/><path d="M5 14h14a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 012-2z"/></svg>
                            </span>
                            <span className="wf-step-label">Receive support ticket</span>
                          </div>
                          <div className="wf-connector">
                            <div className="wf-connector-line" />
                            <span className="wf-connector-label">Analyze ticket</span>
                          </div>
                          {/* Step 2 */}
                          <div className="wf-step">
                            <span className="wf-step-icon wf-step-icon--teal">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                            </span>
                            <span className="wf-step-label">Search knowledge base</span>
                          </div>
                          <div className="wf-connector">
                            <div className="wf-connector-line" />
                          </div>
                          {/* Step 3 */}
                          <div className="wf-step">
                            <span className="wf-step-icon wf-step-icon--teal">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            </span>
                            <span className="wf-step-label">Write response</span>
                          </div>
                          <div className="wf-connector">
                            <div className="wf-connector-line" />
                          </div>
                          {/* Step 4 */}
                          <div className="wf-step">
                            <span className="wf-step-icon wf-step-icon--purple">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            </span>
                            <span className="wf-step-label">Resolve ticket</span>
                          </div>
                        </div>
                      </div>

                      {/* ── Right: Chat preview ── */}
                      <div className="wf-panel wf-panel-right">
                        <div className="wf-browser-chrome">
                          <div className="wf-browser-dots">
                            <span /><span /><span />
                          </div>
                        </div>
                        <div className="wf-browser-body">
                          {/* Skeleton lines */}
                          <div className="wf-skeleton-line wf-skeleton-line--w70" />
                          <div className="wf-skeleton-line wf-skeleton-line--w50" />
                          <div className="wf-skeleton-row">
                            <div className="wf-skeleton-block" />
                            <div className="wf-skeleton-block" />
                          </div>
                          <div className="wf-skeleton-line wf-skeleton-line--w60" />
                          <div className="wf-skeleton-row">
                            <div className="wf-skeleton-block" />
                            <div className="wf-skeleton-block" />
                          </div>

                          {/* Chat widget */}
                          <div className="wf-chat-widget">
                            <div className="wf-chat-header">
                              <span className="wf-chat-title">SUPPORT AGENT</span>
                              <button className="wf-chat-minimize" aria-label="Minimize">—</button>
                            </div>
                            <div className="wf-chat-messages">
                              <div className="wf-chat-msg wf-chat-msg--bot">
                                <span className="wf-chat-avatar">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                </span>
                                <span>Hi! How can I help?</span>
                              </div>
                              <div className="wf-chat-msg wf-chat-msg--user">
                                <span>What&apos;s your return policy?</span>
                              </div>
                              <div className="wf-chat-msg wf-chat-msg--bot">
                                <span className="wf-chat-avatar">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                </span>
                                <span>You can return your items within 30 days!</span>
                              </div>
                            </div>
                            <div className="wf-chat-input">
                              <input type="text" placeholder="Ask" readOnly />
                              <button className="wf-chat-send" aria-label="Send">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cta-area">
                  <a className="cta-btn" href="#">Sign up</a>
                </div>
              </div>
            )}

            {/* ── Speech to Text Tab Panel ── */}
            {activeTab === "chatbot" && (
              <div className="tab-panel-contents" role="tabpanel">
                <div className="product-desc">
                  <p className="product-title" aria-hidden="true">Chatbot Builder</p>
                  <p className="product-subtitle">Design intelligent chatbots that analyze and act on your data</p>
                </div>

                <div className="main-content-area" style={{ opacity: 1 }}>
                  <div className="main-content-inner">
                    <div className="cb-split">
                      {/* ── Left: Flowchart ── */}
                      <div className="cb-panel cb-panel-left">
                        <div className="cb-flow">
                          {/* Step 1 */}
                          <div className="cb-step">
                            <span className="cb-step-icon cb-step-icon--amber">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            </span>
                            <span className="cb-step-label">Receive document</span>
                          </div>
                          <div className="cb-connector"><div className="cb-connector-line" /></div>
                          {/* Step 2 */}
                          <div className="cb-step">
                            <span className="cb-step-icon cb-step-icon--teal">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                            </span>
                            <span className="cb-step-label">Analyze and synthesize text</span>
                          </div>
                          <div className="cb-connector"><div className="cb-connector-line" /></div>
                          {/* Step 3 */}
                          <div className="cb-step">
                            <span className="cb-step-icon cb-step-icon--teal">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            </span>
                            <span className="cb-step-label">Write brief</span>
                          </div>
                          <div className="cb-connector"><div className="cb-connector-line" /></div>
                          {/* Step 4 */}
                          <div className="cb-step">
                            <span className="cb-step-icon cb-step-icon--red">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            </span>
                            <span className="cb-step-label">Email stakeholders</span>
                          </div>
                        </div>
                      </div>

                      {/* ── Right: Chat preview ── */}
                      <div className="cb-panel cb-panel-right">
                        <div className="wf-browser-chrome">
                          <div className="wf-browser-dots">
                            <span /><span /><span />
                          </div>
                        </div>
                        <div className="wf-browser-body">
                          {/* Skeleton lines */}
                          <div className="wf-skeleton-line wf-skeleton-line--w70" />
                          <div className="wf-skeleton-line wf-skeleton-line--w50" />
                          <div className="wf-skeleton-row">
                            <div className="wf-skeleton-block" />
                            <div className="wf-skeleton-block" />
                          </div>
                          <div className="wf-skeleton-line wf-skeleton-line--w60" />
                          <div className="wf-skeleton-row">
                            <div className="wf-skeleton-block" />
                            <div className="wf-skeleton-block" />
                          </div>

                          {/* Chat widget – pops open from bottom-right */}
                          <div className="cb-chat-widget">
                            <div className="wf-chat-header">
                              <span className="cb-chat-title">SUPPORT AGENT</span>
                              <button className="wf-chat-minimize" aria-label="Minimize">—</button>
                            </div>
                            <div className="wf-chat-messages">
                              <div className="wf-chat-msg wf-chat-msg--bot">
                                <span className="cb-chat-avatar">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                </span>
                                <span>Hi! How can I help?</span>
                              </div>
                              <div className="wf-chat-msg wf-chat-msg--user">
                                <span>What&apos;s your return policy?</span>
                              </div>
                              <div className="wf-chat-msg wf-chat-msg--bot">
                                <span className="cb-chat-avatar">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                </span>
                                <span>You can return items within 30 days!</span>
                              </div>
                            </div>
                            <div className="wf-chat-input">
                              <input type="text" placeholder="Ask a question…" readOnly />
                              <button className="wf-chat-send" aria-label="Send">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cta-area">
                  <a className="cta-btn" href="#">Sign up</a>
                </div>
              </div>
            )}

            {/* ── Voice Cloning Tab Panel ── */}
            {activeTab === "voiceCloning" && (
              <div className="tab-panel-contents" role="tabpanel">
                <div className="product-desc">
                  <p className="product-title" aria-hidden="true">Voice Cloning</p>
                  <p className="product-subtitle">Create a replica of your voice that sounds just like you</p>
                </div>

                <div className="main-content-area" style={{ opacity: 1 }}>
                  <div className="main-content-inner">
                    <div className="clone-grid">
                      {/* Original card */}
                      <button type="button" className="clone-card clone-card-original" aria-label="Play">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="clone-spinner">
                          <g fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path strokeOpacity=".15" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            <path strokeLinecap="round" d="M20.945 13A9.004 9.004 0 0 1 13 20.945" />
                          </g>
                        </svg>
                        <div className="clone-card-bottom">
                          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ width: "1rem", height: "1rem", flex: "none" }}>
                            <path d="M18.365 4.223a1 1 0 0 1 1.415 0A10.97 10.97 0 0 1 23 12c0 3.037-1.232 5.788-3.221 7.778a1 1 0 1 1-1.415-1.414A8.97 8.97 0 0 0 21.001 12a8.97 8.97 0 0 0-2.636-6.364 1 1 0 0 1 0-1.414" />
                            <path d="M16.598 7.404a1 1 0 1 0-1.414 1.414A4.48 4.48 0 0 1 16.502 12a4.48 4.48 0 0 1-1.318 3.182 1 1 0 0 0 1.414 1.415A6.48 6.48 0 0 0 18.502 12a6.48 6.48 0 0 0-1.904-4.596M13 4.5c0-1.236-1.411-1.942-2.4-1.2L5.933 6.8a1 1 0 0 1-.6.2H4a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h1.333a1 1 0 0 1 .6.2l4.667 3.5c.989.742 2.4.036 2.4-1.2z" />
                          </svg>
                          <div className="clone-card-label-wrap">
                            <div className="clone-card-label">Preview Original</div>
                            <div className="clone-progress-bar clone-progress-original">
                              <div className="clone-progress-fill" style={{ transform: "scaleX(0)" }} />
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Clone card */}
                      <button type="button" className="clone-card clone-card-clone" aria-label="Play">
                        {/* Background gradient */}
                        <div className="clone-card-bg">
                          <div className="clone-card-gradient" />
                          <div className="clone-card-noise" />
                        </div>
                        <div className="clone-card-ring-inset" />
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="clone-spinner">
                          <g fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path strokeOpacity=".15" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            <path strokeLinecap="round" d="M20.945 13A9.004 9.004 0 0 1 13 20.945" />
                          </g>
                        </svg>
                        <div className="clone-card-bottom">
                          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ width: "1rem", height: "1rem", flex: "none" }}>
                            <path d="M11.02 3.212A1.25 1.25 0 0 1 13 4.226v15.548a1.25 1.25 0 0 1-1.98 1.014l-4.935-3.552a1.25 1.25 0 0 0-.73-.236H3.75A2.75 2.75 0 0 1 1 14.25v-4.5A2.75 2.75 0 0 1 3.75 7h1.605c.262 0 .518-.082.73-.236zM17.1 13.79a.422.422 0 0 1 .8 0l.382 1.16a.42.42 0 0 0 .269.268l1.159.381a.422.422 0 0 1 0 .802l-1.159.381a.42.42 0 0 0-.269.27l-.381 1.158a.422.422 0 0 1-.802 0l-.381-1.159a.42.42 0 0 0-.269-.269l-1.159-.38a.422.422 0 0 1 0-.803l1.159-.38a.42.42 0 0 0 .269-.27zM18.939 5.906c.178-.541.944-.541 1.122 0l.534 1.623a.59.59 0 0 0 .376.376l1.623.534c.541.178.541.944 0 1.122l-1.623.534a.59.59 0 0 0-.376.377l-.534 1.622c-.178.542-.944.542-1.122 0l-.534-1.622a.59.59 0 0 0-.376-.377l-1.623-.534c-.541-.178-.541-.944 0-1.122l1.623-.534a.59.59 0 0 0 .376-.376z" />
                          </svg>
                          <div className="clone-card-label-wrap">
                            <div className="clone-card-label">Preview Clone</div>
                            <div className="clone-progress-bar clone-progress-clone">
                              <div className="clone-progress-fill-white" style={{ transform: "scaleX(0)" }} />
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="cta-area">
                  <a className="cta-btn" href="#">Sign up</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
