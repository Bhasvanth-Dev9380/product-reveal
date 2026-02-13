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
                  <p className="product-subtitle">Turn inbound leads into closed deals — automatically</p>
                </div>

                <div className="main-content-area" style={{ opacity: 1 }}>
                  <div className="main-content-inner">
                    <div className="wf-split">
                      {/* ── Left: Lead-to-Deal Pipeline ── */}
                      <div className="wf-panel wf-panel-left">
                        <div className="wf-flow">
                          {/* Step 1 — Trigger */}
                          <div className="wf-step wf-step-animated" style={{ animationDelay: '0s' }}>
                            <span className="wf-step-icon wf-step-icon--orange">
                              {/* Zap / trigger icon */}
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                            </span>
                            <span className="wf-step-label">New lead from Form</span>
                            <span className="wf-step-badge wf-step-badge--trigger">Trigger</span>
                          </div>
                          {/* Arrow */}
                          <div className="wf-arrow" style={{ animationDelay: '0.3s' }}>
                            <svg className="wf-arrow-svg" viewBox="0 0 24 32" fill="none">
                              <line x1="12" y1="0" x2="12" y2="24" stroke="#7c3aed" strokeWidth="2" className="wf-arrow-line" />
                              <polygon points="7,22 12,30 17,22" fill="#7c3aed" className="wf-arrow-head" />
                            </svg>
                          </div>
                          {/* Step 2 — AI Qualify */}
                          <div className="wf-step wf-step-animated" style={{ animationDelay: '0.5s' }}>
                            <span className="wf-step-icon wf-step-icon--purple">
                              {/* Brain / AI icon */}
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 014 4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2a4 4 0 014-4z"/><path d="M8 8v1a4 4 0 008 0V8"/><path d="M6 13a6 6 0 0012 0"/><path d="M9 22h6"/><path d="M12 18v4"/></svg>
                            </span>
                            <span className="wf-step-label">AI Qualify &amp; Score</span>
                            <span className="wf-step-badge wf-step-badge--ai">Gemini</span>
                          </div>
                          {/* Arrow */}
                          <div className="wf-arrow" style={{ animationDelay: '0.8s' }}>
                            <svg className="wf-arrow-svg" viewBox="0 0 24 32" fill="none">
                              <line x1="12" y1="0" x2="12" y2="24" stroke="#7c3aed" strokeWidth="2" className="wf-arrow-line" />
                              <polygon points="7,22 12,30 17,22" fill="#7c3aed" className="wf-arrow-head" />
                            </svg>
                            <span className="wf-connector-label" style={{ animationDelay: '0.9s' }}>Score ≥ 70</span>
                          </div>
                          {/* Step 3 — Send Email */}
                          <div className="wf-step wf-step-animated" style={{ animationDelay: '1.05s' }}>
                            <span className="wf-step-icon wf-step-icon--teal">
                              {/* Mail icon */}
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                            </span>
                            <span className="wf-step-label">Send outreach email</span>
                            <span className="wf-step-badge wf-step-badge--action">SendGrid</span>
                          </div>
                          {/* Arrow */}
                          <div className="wf-arrow" style={{ animationDelay: '1.35s' }}>
                            <svg className="wf-arrow-svg" viewBox="0 0 24 32" fill="none">
                              <line x1="12" y1="0" x2="12" y2="24" stroke="#7c3aed" strokeWidth="2" className="wf-arrow-line" />
                              <polygon points="7,22 12,30 17,22" fill="#7c3aed" className="wf-arrow-head" />
                            </svg>
                            <span className="wf-connector-label" style={{ animationDelay: '1.45s' }}>Wait 2 days</span>
                          </div>
                          {/* Step 4 — Follow-up */}
                          <div className="wf-step wf-step-animated" style={{ animationDelay: '1.6s' }}>
                            <span className="wf-step-icon wf-step-icon--blue">
                              {/* Repeat / follow-up icon */}
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
                            </span>
                            <span className="wf-step-label">Auto follow-up</span>
                            <span className="wf-step-badge wf-step-badge--action">×5</span>
                          </div>
                          {/* Arrow */}
                          <div className="wf-arrow" style={{ animationDelay: '1.9s' }}>
                            <svg className="wf-arrow-svg" viewBox="0 0 24 32" fill="none">
                              <line x1="12" y1="0" x2="12" y2="24" stroke="#7c3aed" strokeWidth="2" className="wf-arrow-line" />
                              <polygon points="7,22 12,30 17,22" fill="#7c3aed" className="wf-arrow-head" />
                            </svg>
                          </div>
                          {/* Step 5 — CRM */}
                          <div className="wf-step wf-step-animated" style={{ animationDelay: '2.1s' }}>
                            <span className="wf-step-icon wf-step-icon--green">
                              {/* Check-circle icon */}
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            </span>
                            <span className="wf-step-label">Create deal in CRM</span>
                            <span className="wf-step-badge wf-step-badge--action">HubSpot</span>
                          </div>
                        </div>
                      </div>

                      {/* ── Right: Lead scoring dashboard ── */}
                      <div className="wf-panel wf-panel-right">
                        <div className="wf-dash-header">
                          <span className="wf-dash-title">Lead Pipeline</span>
                          <span className="wf-dash-live">● Live</span>
                        </div>
                        <div className="wf-dash-body">
                          {/* Lead row 1 */}
                          <div className="wf-lead wf-lead-animated" style={{ animationDelay: '0.6s' }}>
                            <div className="wf-lead-info">
                              <span className="wf-lead-name">Sarah Chen</span>
                              <span className="wf-lead-company">Acme Corp</span>
                            </div>
                            <div className="wf-lead-meta">
                              <span className="wf-lead-score wf-lead-score--high">92</span>
                              <span className="wf-lead-status wf-lead-status--qualified">Qualified</span>
                            </div>
                          </div>
                          {/* Lead row 2 */}
                          <div className="wf-lead wf-lead-animated" style={{ animationDelay: '0.9s' }}>
                            <div className="wf-lead-info">
                              <span className="wf-lead-name">James Miller</span>
                              <span className="wf-lead-company">TechFlow Inc</span>
                            </div>
                            <div className="wf-lead-meta">
                              <span className="wf-lead-score wf-lead-score--high">85</span>
                              <span className="wf-lead-status wf-lead-status--emailed">Email sent</span>
                            </div>
                          </div>
                          {/* Lead row 3 */}
                          <div className="wf-lead wf-lead-animated" style={{ animationDelay: '1.2s' }}>
                            <div className="wf-lead-info">
                              <span className="wf-lead-name">Priya Sharma</span>
                              <span className="wf-lead-company">DataBridge</span>
                            </div>
                            <div className="wf-lead-meta">
                              <span className="wf-lead-score wf-lead-score--med">61</span>
                              <span className="wf-lead-status wf-lead-status--review">In review</span>
                            </div>
                          </div>
                          {/* Lead row 4 */}
                          <div className="wf-lead wf-lead-animated" style={{ animationDelay: '1.5s' }}>
                            <div className="wf-lead-info">
                              <span className="wf-lead-name">Tom Bradley</span>
                              <span className="wf-lead-company">NovaPay</span>
                            </div>
                            <div className="wf-lead-meta">
                              <span className="wf-lead-score wf-lead-score--low">34</span>
                              <span className="wf-lead-status wf-lead-status--rejected">Not qualified</span>
                            </div>
                          </div>
                          {/* Stats row */}
                          <div className="wf-dash-stats wf-lead-animated" style={{ animationDelay: '1.8s' }}>
                            <div className="wf-dash-stat">
                              <span className="wf-dash-stat-val">127</span>
                              <span className="wf-dash-stat-lbl">Leads today</span>
                            </div>
                            <div className="wf-dash-stat">
                              <span className="wf-dash-stat-val">82%</span>
                              <span className="wf-dash-stat-lbl">Auto-qualified</span>
                            </div>
                            <div className="wf-dash-stat">
                              <span className="wf-dash-stat-val">3.2×</span>
                              <span className="wf-dash-stat-lbl">Faster close</span>
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

            {/* ── Chatbot Builder Tab Panel ── */}
            {activeTab === "chatbot" && (
              <div className="tab-panel-contents" role="tabpanel">
                <div className="product-desc">
                  <p className="product-title" aria-hidden="true">Chatbot Builder</p>
                  <p className="product-subtitle">Your customers shouldn&apos;t wait hours for a simple answer</p>
                </div>

                <div className="main-content-area" style={{ opacity: 1 }}>
                  <div className="main-content-inner">
                    <div className="cb-split">
                      {/* ── Left: The problem → solution story ── */}
                      <div className="cb-panel cb-panel-left">
                        <div className="cb-story">
                          {/* Before — the pain */}
                          <div className="cb-card cb-card--before cb-card--anim" style={{ animationDelay: '0.1s' }}>
                            <div className="cb-card-badge cb-card-badge--red">Before</div>
                            <div className="cb-card-stat">
                              <span className="cb-card-number">4h 23m</span>
                              <span className="cb-card-unit">avg. response</span>
                            </div>
                            <div className="cb-card-detail">
                              <span className="cb-card-icon cb-card-icon--red">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                              </span>
                              <span className="cb-card-metric">42% ticket abandonment</span>
                            </div>
                          </div>

                          {/* The transformation arrow */}
                          <div className="cb-transform cb-card--anim" style={{ animationDelay: '0.45s' }}>
                            <div className="cb-transform-line" />
                            <div className="cb-transform-pill">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                              <span>AI activated</span>
                            </div>
                            <div className="cb-transform-line" />
                          </div>

                          {/* After — the win */}
                          <div className="cb-card cb-card--after cb-card--anim" style={{ animationDelay: '0.75s' }}>
                            <div className="cb-card-badge cb-card-badge--green">After</div>
                            <div className="cb-card-stat">
                              <span className="cb-card-number cb-card-number--green">4 sec</span>
                              <span className="cb-card-unit">avg. response</span>
                            </div>
                            <div className="cb-card-detail">
                              <span className="cb-card-icon cb-card-icon--green">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              </span>
                              <span className="cb-card-metric cb-card-metric--green">96% resolution rate</span>
                            </div>
                            <div className="cb-card-detail">
                              <span className="cb-card-icon cb-card-icon--green">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              </span>
                              <span className="cb-card-metric cb-card-metric--green">24/7 instant support</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── Right: Live chat demo ── */}
                      <div className="cb-panel cb-panel-right">
                        <div className="cb-live-header">
                          <span className="cb-live-dot" />
                          <span className="cb-live-text">Live on your website</span>
                        </div>
                        <div className="cb-demo-site">
                          {/* Faux site skeleton */}
                          <div className="cb-site-nav">
                            <div className="cb-site-logo" />
                            <div className="cb-site-links">
                              <div className="cb-site-link" />
                              <div className="cb-site-link" />
                              <div className="cb-site-link" />
                            </div>
                          </div>
                          <div className="cb-site-hero">
                            <div className="cb-site-hero-line cb-site-hero-line--lg" />
                            <div className="cb-site-hero-line cb-site-hero-line--md" />
                            <div className="cb-site-hero-line cb-site-hero-line--sm" />
                          </div>
                          <div className="cb-site-grid">
                            <div className="cb-site-block" />
                            <div className="cb-site-block" />
                          </div>

                          {/* Chat widget — animated pop-in */}
                          <div className="cb-chat-widget">
                            <div className="cb-widget-bar">
                              <div className="cb-widget-avatar-wrap">
                                <span className="cb-chat-avatar">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                </span>
                                <span className="cb-widget-online" />
                              </div>
                              <div>
                                <div className="cb-chat-title">Support Agent</div>
                                <div className="cb-chat-status">Online · Typically replies instantly</div>
                              </div>
                            </div>
                            <div className="cb-widget-messages">
                              <div className="cb-msg cb-msg--bot cb-msg--anim" style={{ animationDelay: '0.6s' }}>
                                <span>👋 Hi! How can I help you today?</span>
                              </div>
                              <div className="cb-msg cb-msg--user cb-msg--anim" style={{ animationDelay: '1.1s' }}>
                                <span>What&apos;s your return policy?</span>
                              </div>
                              <div className="cb-msg cb-msg--bot cb-msg--anim" style={{ animationDelay: '1.6s' }}>
                                <span>You can return any item within 30 days for a full refund — no questions asked! 🎉</span>
                              </div>
                              <div className="cb-msg-meta cb-msg--anim" style={{ animationDelay: '1.8s' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                <span>Answered in 3.2s from Knowledge Base</span>
                              </div>
                            </div>
                            <div className="cb-widget-input">
                              <input type="text" placeholder="Ask anything…" readOnly />
                              <button className="cb-widget-send" aria-label="Send">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
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
