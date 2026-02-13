"use client";

import { useState, useRef, useEffect } from "react";
import "./product-showcase.css";

const TAB_DURATION = 5000; // ms per tab

/* ─── data ─── */
const TABS = [
  { key: "speech", label: "Text to Speech" },
  { key: "agents", label: "Agents" },
  { key: "music", label: "Music" },
  { key: "transcription", label: "Speech to Text" },
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
                            <a className="explore-link" href="#">Explore 10,000+ voices</a>
                            <button type="button" className="edit-text-btn">
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Edit text</span>
                            </button>
                            <button type="button" className="nav-btn nav-btn-prev" aria-label="Previous" disabled>
                              <svg fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m13.586 16-3.293-3.293a1 1 0 0 1 0-1.414L13.586 8" />
                              </svg>
                            </button>
                            <button type="button" className="nav-btn nav-btn-next" aria-label="Next">
                              <svg fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m10 16 3.293-3.293a1 1 0 0 0 0-1.414L10 8" />
                              </svg>
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
                            <button type="button" className="lang-select-btn" aria-label="Language">
                              <span style={{ minWidth: 0 }}>
                                <div style={{ position: "relative", minWidth: 0, display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                                  <img alt="" className="lang-flag" src="https://eleven-public-cdn.elevenlabs.io/images/flags/circle-flags/us.svg" />
                                  <div className="lang-name">English</div>
                                </div>
                              </span>
                              <svg viewBox="0 0 24 24" fill="none" className="lang-chevron" aria-hidden="true">
                                <path d="M8 10L11.2929 13.2929C11.6834 13.6834 12.3166 13.6834 12.7071 13.2929L16 10" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>

                            <div className="voice-select-mobile">
                              <div style={{ minWidth: 0 }}>
                                <button type="button" className="voice-select-btn" aria-label="Voice">
                                  <span style={{ minWidth: 0 }}>
                                    <div style={{ position: "relative", minWidth: 0, display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                                      <div className="voice-select-avatar" style={{ background: BG_COLORS[selectedVoiceData.bg] ?? "#e5e7eb" }} />
                                      <div className="voice-select-name">{selectedVoiceData.name}</div>
                                    </div>
                                  </span>
                                  <svg viewBox="0 0 24 24" fill="none" className="lang-chevron" aria-hidden="true">
                                    <path d="M8 10L11.2929 13.2929C11.6834 13.6834 12.3166 13.6834 12.7071 13.2929L16 10" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <button type="button" className="play-btn" aria-label="Play">Play</button>
                            <audio className="hidden" />
                          </div>
                        </div>
                      </div>

                      {/* Mobile explore strip */}
                      <div className="mobile-explore-strip">
                        <div className="mobile-explore-inner">
                          <div style={{ minWidth: "100%", flex: "none", display: "flex", alignItems: "center", gap: "0.375rem", width: "max-content", opacity: 1 }}>
                            <a className="mobile-explore-link" href="#">
                              Explore 10,000+ voices
                              <span style={{ position: "absolute", inset: 0 }} />
                            </a>
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
                <div className="product-desc">
                  <p className="product-title" aria-hidden="true">Agents</p>
                  <p className="product-subtitle">Configure, deploy and monitor conversational agents</p>
                </div>

                <div className="main-content-area" style={{ opacity: 1 }}>
                  <div className="agents-center">
                    <div className="agents-orb-wrap" style={{ opacity: 1 }}>
                      <div className="agents-orb-outer">
                        {/* Orb placeholder */}
                        <div className="agents-orb-ring">
                          <div className="agents-orb-circle">
                            <div className="agents-orb-gradient" />
                            <div className="agents-orb-ring-inset" />
                          </div>
                        </div>
                        {/* Center interactive zone */}
                        <div className="agents-orb-interactive">
                          <div className="agents-chat-zone" style={{ maskImage: "linear-gradient(transparent, white 3rem, white calc(100% - 5rem), transparent calc(100% - 2rem))" }}>
                            <div className="agents-chat-messages" />
                          </div>
                        </div>
                      </div>
                      {/* Bottom controls */}
                      <div className="agents-controls">
                        <div style={{ width: 0, flex: "none" }} />
                        <button type="button" className="agents-call-btn" aria-label="Start Call">
                          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ width: "1.5rem", height: "1.5rem", marginTop: "0.0625rem" }}>
                            <path d="M5.723 3C4.248 3 2.927 4.206 3.097 5.796c.251 2.36.993 4.662 2.19 6.723a17.1 17.1 0 0 0 6.195 6.195c2.075 1.205 4.348 1.913 6.69 2.172 1.598.177 2.829-1.143 2.829-2.636v-1.753a2.75 2.75 0 0 0-1.974-2.639l-1.682-.495a2.69 2.69 0 0 0-2.702.719c-.377.392-.914.452-1.285.212a12.3 12.3 0 0 1-3.652-3.651c-.24-.372-.18-.908.213-1.285a2.69 2.69 0 0 0 .718-2.702l-.494-1.682A2.75 2.75 0 0 0 7.504 3z" />
                          </svg>
                        </button>
                        <form className="agents-input-form" style={{ borderRadius: 24, opacity: 1 }}>
                          <button type="button" className="agents-input-overlay" aria-label="Or type a message…" />
                          <input
                            className="agents-input"
                            aria-label="Or type a message…"
                            placeholder="Or type a message…"
                            type="text"
                            readOnly
                          />
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cta-area">
                  <a className="cta-btn" href="#">Sign up</a>
                </div>
              </div>
            )}

            {/* ── Music Tab Panel ── */}
            {activeTab === "music" && (
              <div className="tab-panel-contents" role="tabpanel">
                <div className="product-desc">
                  <p className="product-title" aria-hidden="true">Music</p>
                  <p className="product-subtitle">Generate studio-quality tracks in any genre or style</p>
                </div>

                <div className="main-content-area" style={{ opacity: 1 }}>
                  <div className="main-content-inner">
                    <div className="music-card">
                      {/* Text prompt area */}
                      <div className="music-textarea-scroll">
                        <div className="music-textarea-wrap">
                          <div className="music-textarea-inner">
                            <div className="music-text-display" style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
                              A rich orchestral track, deeply cinematic, symphonic strings, brass and woodwinds, an epic fantasy, triumphant, jubilant, crescendo, finale.{"\u200B"}
                            </div>
                            <textarea
                              className="music-textarea"
                              spellCheck={false}
                              maxLength={500}
                              defaultValue="A rich orchestral track, deeply cinematic, symphonic strings, brass and woodwinds, an epic fantasy, triumphant, jubilant, crescendo, finale."
                            />
                          </div>
                        </div>
                        <div className="text-bottom-fade" />
                      </div>
                      {/* Player bar */}
                      <div className="music-player-bar">
                        <div className="music-player-info">
                          <div className="music-player-info-inner" style={{ opacity: 1 }}>
                            {/* Track orb */}
                            <div className="music-track-orb-wrap">
                              <div className="music-track-orb">
                                <div className="music-track-orb-gradient" />
                                <div className="music-track-orb-ring-inset" />
                              </div>
                            </div>
                            {/* Track info – desktop */}
                            <div className="music-track-info">
                              <div className="music-track-name">
                                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Epic Symphony</div>
                              </div>
                              <div className="music-track-duration">0:50</div>
                            </div>
                          </div>
                        </div>
                        <div className="music-player-controls">
                          <button type="button" className="music-play-btn" aria-label="Play">
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: "1rem", height: "1rem" }}>
                              <path fill="currentColor" d="M9.244 2.368C7.414 1.184 5 2.497 5 4.676v14.648c0 2.18 2.414 3.493 4.244 2.309l11.318-7.324c1.675-1.084 1.675-3.534 0-4.618z" />
                            </svg>
                          </button>
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
            {activeTab === "transcription" && (
              <div className="tab-panel-contents" role="tabpanel">
                <div className="product-desc">
                  <p className="product-title" aria-hidden="true">Speech to Text</p>
                  <p className="product-subtitle">Transcribe any audio with state of the art accuracy</p>
                </div>

                <div className="main-content-area" style={{ opacity: 1 }}>
                  <div className="main-content-inner">
                    <div className="stt-card">
                      {/* Bottom action buttons */}
                      <div className="stt-actions">
                        <div className="stt-actions-row">
                          {/* Sign up link (left) */}
                          <div className="stt-signup-left">
                            <a className="stt-signup-btn-dark" href="#">Sign up</a>
                          </div>
                          {/* Center controls */}
                          <div className="stt-controls-pill">
                            <div className="stt-controls-inner">
                              <div className="stt-controls-flex">
                                {/* Record button */}
                                <div style={{ display: "flex", opacity: 1 }}>
                                  <button type="button" className="stt-record-group" aria-label="Start recording">
                                    <div className="stt-record-btn">
                                      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" style={{ width: "1.25rem", height: "1.25rem" }}>
                                        <path d="M7.001 7a5 5 0 0 1 10 0v4.5a5 5 0 0 1-10 0z" />
                                        <path d="M5.812 14.2a.75.75 0 1 0-1.374.6 8.26 8.26 0 0 0 6.813 4.916v1.534a.75.75 0 1 0 1.5 0v-1.534a8.26 8.26 0 0 0 6.813-4.916.75.75 0 1 0-1.374-.6 6.752 6.752 0 0 1-12.378 0" />
                                      </svg>
                                    </div>
                                  </button>
                                </div>
                                {/* Upload button */}
                                <div className="stt-upload-group" style={{ opacity: 1 }}>
                                  <div className="stt-upload-wrapper">
                                    <button type="button" className="stt-upload-btn" aria-label="Select audio or video file">
                                      <div className="stt-upload-icon">
                                        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" style={{ width: "1.25rem", height: "1.25rem" }}>
                                          <path fillRule="evenodd" clipRule="evenodd" d="M12 3a.75.75 0 0 1 .53.22l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V15a.75.75 0 0 1-1.5 0V5.56L8.03 8.78a.75.75 0 0 1-1.06-1.06l4.5-4.5A.75.75 0 0 1 12 3" />
                                          <path fillRule="evenodd" clipRule="evenodd" d="M3.75 14a.75.75 0 0 1 .75.75v3.5c0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25v-3.5a.75.75 0 0 1 1.5 0v3.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25v-3.5a.75.75 0 0 1 .75-.75" />
                                        </svg>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Sign up link (right) */}
                          <div className="stt-signup-right">
                            <a className="stt-signup-btn-light" href="#">Sign up</a>
                          </div>
                        </div>
                      </div>
                      {/* Center message */}
                      <div className="stt-message" style={{ opacity: 1 }}>
                        <div className="stt-message-inner">
                          <p className="stt-message-text">Record or upload to test ElevenLabs' most accurate transcription models</p>
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
