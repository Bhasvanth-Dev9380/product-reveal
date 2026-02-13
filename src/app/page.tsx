"use client";

import { useState, useRef } from "react";
import "./product-showcase.css";

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
  const [activeTab, setActiveTab] = useState("speech");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [text, setText] = useState(DEFAULT_TEXT);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
                        const isActive = tab.key === activeTab;
                        return (
                          <div
                            key={tab.key}
                            className="tab-item"
                            role="tab"
                            tabIndex={isActive ? 0 : -1}
                            aria-selected={isActive}
                            onClick={() => setActiveTab(tab.key)}
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
                            <div className={isActive ? "tab-pill-active" : "tab-pill-inactive"} />
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

            {activeTab !== "speech" && (
              <div
                className="tab-panel-contents"
                role="tabpanel"
                style={{ gridColumn: "1 / -1", gridRow: "2 / 4", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <p style={{ color: "#57534e", fontSize: "1rem" }}>
                  {TABS.find((t) => t.key === activeTab)?.label} — coming soon
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
