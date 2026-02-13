"use client";

import { useState, useRef, useEffect } from "react";
import { Orb } from "@/components/ui/orb";
import "./product-showcase.css";

const TAB_DURATION = 5000; // ms per tab

/* ─── Workflow Prompt (right panel) ─── */
const PROMPT_EXAMPLES = [
  {
    label: "Lead qualification",
    prompt: "Create an AI workflow that qualifies inbound leads by analyzing company size, industry, and budget, then updates HubSpot and schedules meetings with qualified prospects",
  },
  {
    label: "Email outreach",
    prompt: "Build an automated email sequence that sends personalized outreach via SendGrid, tracks opens and clicks, and automatically follows up with engaged recipients",
  },
  {
    label: "CRM automation",
    prompt: "Set up an intelligent pipeline that syncs lead data across Google Forms, Gemini AI scoring, and HubSpot CRM, with automated deal creation and task assignment",
  },
];

const TRANSLATIONS: Record<string, string[]> = {
  [PROMPT_EXAMPLES[0].prompt]: [
    "Create an AI workflow that qualifies inbound leads by analyzing company size, industry, and budget, then updates HubSpot and schedules meetings with qualified prospects",
    "(ES) Crear un flujo de IA que califique leads entrantes analizando tamaño de empresa, industria y presupuesto, luego actualice HubSpot y programe reuniones",
    "(FR) Créer un workflow IA qui qualifie les prospects entrants en analysant la taille de l'entreprise, le secteur et le budget, puis met à jour HubSpot",
    "(DE) Erstellen Sie einen KI-Workflow, der eingehende Leads nach Unternehmensgröße, Branche und Budget qualifiziert und HubSpot aktualisiert",
    "(JP) 企業規模・業種・予算を分析してインバウンドリードを選別し、HubSpotを更新して商談を設定するAIワークフローを作成",
    "(ZH) 创建AI工作流，通过分析公司规模、行业和预算来筛选潜在客户，然后更新HubSpot并安排会议",
  ],
  [PROMPT_EXAMPLES[1].prompt]: [
    "Build an automated email sequence that sends personalized outreach via SendGrid, tracks opens and clicks, and automatically follows up with engaged recipients",
    "(ES) Construir una secuencia de correo automatizada que envíe alcance personalizado vía SendGrid, rastree aperturas y clics, y haga seguimiento automático",
    "(FR) Construire une séquence d'emails automatisée qui envoie des messages personnalisés via SendGrid, suit les ouvertures et clics, et relance automatiquement",
    "(DE) Erstellen Sie eine automatisierte E-Mail-Sequenz, die personalisierte Nachrichten über SendGrid sendet, Öffnungen und Klicks verfolgt und automatisch nachfasst",
    "(JP) SendGrid経由でパーソナライズされたメールを送信し、開封とクリックを追跡し、関心のある受信者に自動フォローアップするシーケンスを構築",
    "(ZH) 构建自动化邮件序列，通过SendGrid发送个性化外联邮件，追踪打开和点击，并自动跟进感兴趣的收件人",
  ],
  [PROMPT_EXAMPLES[2].prompt]: [
    "Set up an intelligent pipeline that syncs lead data across Google Forms, Gemini AI scoring, and HubSpot CRM, with automated deal creation and task assignment",
    "(ES) Configurar un pipeline inteligente que sincronice datos de leads entre Google Forms, puntuación de Gemini IA y HubSpot CRM, con creación automática de negocios",
    "(FR) Configurer un pipeline intelligent qui synchronise les données de leads entre Google Forms, le scoring Gemini IA et HubSpot CRM, avec création automatique de deals",
    "(DE) Richten Sie eine intelligente Pipeline ein, die Lead-Daten zwischen Google Forms, Gemini-KI-Scoring und HubSpot CRM synchronisiert, mit automatischer Deal-Erstellung",
    "(JP) Google Forms、Gemini AIスコアリング、HubSpot CRM間でリードデータを同期し、案件の自動作成とタスク割り当てを行うパイプラインを構築",
    "(ZH) 设置智能管道，在Google Forms、Gemini AI评分和HubSpot CRM之间同步潜在客户数据，自动创建交易和分配任务",
  ],
};

const LANG_FLAGS = ["🇺🇸", "🇪🇸", "🇫🇷", "🇩🇪", "🇯🇵", "🇨🇳"];
const LANG_LABELS = ["English", "Español", "Français", "Deutsch", "日本語", "中文"];

function WorkflowPrompt({ onPause, onDone }: { onPause?: (p: boolean) => void; onDone?: () => void }) {
  const [input, setInput] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [langIdx, setLangIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSubmit = (overrideText?: string) => {
    const text = overrideText || input.trim() || PROMPT_EXAMPLES[0].prompt;
    if (isTranslating) return;

    const translations = TRANSLATIONS[text] || [
      text,
      `Crear un flujo de trabajo de IA que ${text.toLowerCase()}`,
      `Créer un workflow IA qui ${text.toLowerCase()}`,
      `Einen KI-Workflow erstellen, der ${text.toLowerCase()}`,
      `${text}を実行するAIワークフローを作成`,
      `创建AI工作流来${text.toLowerCase()}`,
    ];

    setIsTranslating(true);
    onPause?.(true);
    let idx = 0;
    setDisplayText(translations[0]);
    setLangIdx(0);

    timerRef.current = setInterval(() => {
      idx++;
      if (idx < translations.length) {
        setDisplayText(translations[idx]);
        setLangIdx(idx);
      } else {
        // Done — show original text, stop, and trigger modal
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setDisplayText(text);
        setIsTranslating(false);
        setLangIdx(0);
        onPause?.(false);
        onDone?.();
      }
    }, 400);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="wf-panel wf-panel-right wf-builder-panel">
      <div className="wf-builder-idle">
        <div className="wf-builder-sparkle">✦</div>
        <p className="wf-builder-prompt-label">Describe your workflow</p>
        <div className="wf-builder-input-wrap">
          <textarea
            className={`wf-builder-input${isTranslating ? " wf-builder-input--translating" : ""}`}
            placeholder="Describe your workflow… e.g. 'Qualify inbound leads, score them with AI, and sync to CRM'"
            value={isTranslating ? displayText : input}
            onChange={(e) => !isTranslating && setInput(e.target.value)}
            onFocus={() => onPause?.(true)}
            onBlur={() => { if (!isTranslating) onPause?.(false); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            readOnly={isTranslating}
            rows={3}
          />
          <button
            className={`wf-builder-send${isTranslating ? " wf-builder-send--spin" : ""}`}
            onClick={() => handleSubmit()}
            aria-label="Generate"
            disabled={isTranslating}
          >
            {isTranslating ? (
              <span className="wf-builder-spinner" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            )}
          </button>
        </div>
        {/* Language label + flag dots during translation */}
        {isTranslating && (
          <div className="wf-translate-indicator">
            <span className="wf-translate-lang-label" key={langIdx}>{LANG_FLAGS[langIdx]} {LANG_LABELS[langIdx]}</span>
            <div className="wf-translate-dots">
              {LANG_FLAGS.map((_, i) => (
                <span key={i} className={`wf-translate-dot${i === langIdx ? " wf-translate-dot--active" : ""}`} />
              ))}
            </div>
          </div>
        )}
        {!isTranslating && (
          <div className="wf-builder-chips">
            {PROMPT_EXAMPLES.map((ex) => (
              <button key={ex.label} className="wf-builder-chip" onClick={() => { setInput(ex.prompt); handleSubmit(ex.prompt); }}>
                {ex.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


/* ─── data ─── */
const TABS = [
  { key: "agents", label: "AI Crew" },
  { key: "workflows", label: "Workflows" },
  { key: "chatbot", label: "Chatbot Builder" },
  { key: "speech", label: "Voice Agents" },
  { key: "voiceCloning", label: "Voice Cloning" },
];

const VOICES = [
  { id: "alloy", name: "Zara", desc: "Chill & Effortless", bg: "bg05", audio: "/audio/voices/alloy.wav" },
  { id: "echo", name: "Kai", desc: "Deep & Iconic", bg: "bg02", audio: "/audio/voices/echo.wav" },
  { id: "fable", name: "Luna", desc: "Soft & Magnetic", bg: "bg04", audio: "/audio/voices/fable.wav" },
  { id: "onyx", name: "Renzo", desc: "Bold & Cinematic", bg: "bg08", audio: "/audio/voices/onyx.wav" },
  { id: "nova", name: "Aria", desc: "Sleek & Vibey", bg: "bg06", audio: "/audio/voices/nova.wav" },
  { id: "shimmer", name: "Jett", desc: "Hype & Electric", bg: "bg01", audio: "/audio/voices/shimmer.wav" },
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

export default function ProductShowcase() {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [orbAgentState, setOrbAgentState] = useState<"thinking" | "listening" | "talking" | null>(null);

  const handlePreview = (voiceId: string, audioSrc: string) => {
    if (playingVoice === voiceId && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingVoice(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    setPlayingVoice(voiceId);
    audio.play();
    audio.onended = () => setPlayingVoice(null);
  };

  // Auto-rotation with refs to avoid stale closures
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const progressRef = useRef(0);
  const pausedRef = useRef(false);
  const activeIdxRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(performance.now());
  const showModalRef = useRef(false);
  useEffect(() => { showModalRef.current = showSignupModal; }, [showSignupModal]);

  // Keep refs in sync
  useEffect(() => { pausedRef.current = paused || playingVoice !== null; }, [paused, playingVoice]);
  useEffect(() => { activeIdxRef.current = activeTabIdx; }, [activeTabIdx]);

  // Cycle the orb through idle → listening → thinking → talking
  useEffect(() => {
    const states: ("thinking" | "listening" | "talking" | null)[] = [null, "listening", "thinking", "talking"];
    let idx = 0;
    const interval = setInterval(() => {
      if (paused) return;
      idx = (idx + 1) % states.length;
      setOrbAgentState(states[idx]);
    }, 3000);
    return () => clearInterval(interval);
  }, [paused]);

  // Single rAF loop — no intervals, no race conditions
  useEffect(() => {
    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      if (!pausedRef.current && !showModalRef.current) {
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
      {/* ── Full-page signup modal ── */}
      {showSignupModal && (
        <div className="signup-modal-overlay" onClick={() => setShowSignupModal(false)}>
          <div className="signup-modal" onClick={(e) => e.stopPropagation()}>
            <button className="signup-modal-close" onClick={() => setShowSignupModal(false)} aria-label="Close">✕</button>
            <h2 className="signup-modal-title">Your workflow is ready</h2>
            <a className="signup-modal-btn" href="https://dashboard.spinabot.com" target="_blank" rel="noopener noreferrer">
              Deploy Now
            </a>
          </div>
        </div>
      )}

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
                  <p className="product-title" aria-hidden="true">Voice Agents</p>
                  <p className="product-subtitle">Deploy AI voice agents that handle calls, answer questions & resolve tickets — in 6 premium voices</p>
                </div>

                <div className="main-content-area">
                  <div className="main-content-inner">
                    <div className="omnibox-card">
                      <div className="card-divider" />
                      <div className="card-split">
                        {/* ── Voice list ── */}
                        <div className="voice-panel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                          <div className="voice-list" role="radiogroup" aria-label="Voice">
                            {VOICES.map((voice) => {
                              const isSelected = voice.id === selectedVoice;
                              return (
                                <div key={voice.id} className="voice-item" data-selected={isSelected || undefined}>
                                  <label>
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
                                    className={`voice-preview-btn${playingVoice === voice.id ? ' voice-preview-btn--playing' : ''}`}
                                    aria-label={playingVoice === voice.id ? 'Stop' : 'Preview'}
                                    onClick={() => handlePreview(voice.id, voice.audio)}
                                  >
                                    {playingVoice === voice.id ? (
                                      <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                                        <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                                      </svg>
                                    ) : (
                                      <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path fill="currentColor" d="M9.244 2.368C7.414 1.184 5 2.497 5 4.676v14.648c0 2.18 2.414 3.493 4.244 2.309l11.318-7.324c1.675-1.084 1.675-3.534 0-4.618z" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* ── Orb Call Panel ── */}
                        <div className="orb-call-panel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                          <div className="orb-call-inner">
                            {/* Voice name + status */}
                            <div className="orb-voice-label">
                              <span className="orb-voice-name">{selectedVoiceData.name}</span>
                              <span className="orb-voice-status">
                                {orbAgentState === "talking" ? "Speaking…" : orbAgentState === "listening" ? "Listening…" : orbAgentState === "thinking" ? "Thinking…" : "Ready to talk"}
                              </span>
                            </div>

                            {/* The Orb */}
                            <div className="orb-container">
                              <Orb
                                colors={["#ffffff", "#a0a0a0"]}
                                agentState={orbAgentState}
                                seed={42}
                              />
                            </div>

                            {/* Call controls */}
                            <div className="orb-controls">
                              <button className="orb-ctrl-btn orb-ctrl-btn--mic" aria-label="Microphone">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
                              </button>
                              <button className="orb-ctrl-btn orb-ctrl-btn--call" aria-label="Start call">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M5.723 3C4.248 3 2.927 4.206 3.097 5.796c.251 2.36.993 4.662 2.19 6.723a17.1 17.1 0 006.195 6.195c2.075 1.205 4.348 1.913 6.69 2.172 1.598.177 2.829-1.143 2.829-2.636v-1.753a2.75 2.75 0 00-1.974-2.639l-1.682-.495a2.69 2.69 0 00-2.702.719c-.377.392-.914.452-1.285.212a12.3 12.3 0 01-3.652-3.651c-.24-.372-.18-.908.213-1.285a2.69 2.69 0 00.718-2.702l-.494-1.682A2.75 2.75 0 007.504 3z"/></svg>
                              </button>
                              <button className="orb-ctrl-btn orb-ctrl-btn--end" aria-label="End call">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
                            </div>

                            <div className="orb-caption">Click the phone to start a voice call with {selectedVoiceData.name}</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="cta-area">
                  <a className="cta-btn" href="https://dashboard.spinabot.com" target="_blank" rel="noopener noreferrer">Sign up</a>
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
                  <a className="cta-btn" href="https://dashboard.spinabot.com" target="_blank" rel="noopener noreferrer">Deploy AI Crew</a>
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
                            <span className="wf-step-logo">
                              <img src="/logos/googleform.svg" alt="Google Forms" width="18" height="18" />
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
                            <span className="wf-step-logo">
                              <img src="/logos/gemini.svg" alt="Gemini" width="18" height="18" />
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
                            <span className="wf-step-logo">
                              <img src="/logos/sendgrid.png" alt="SendGrid" width="18" height="18" />
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
                            <span className="wf-step-logo">
                              <img src="/logos/gmail.svg" alt="Gmail" width="18" height="18" />
                            </span>
                            <span className="wf-step-label">Auto follow-up</span>
                            <span className="wf-step-badge wf-step-badge--action">Gmail</span>
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
                            <span className="wf-step-logo">
                              <img src="/logos/hubspot.svg" alt="HubSpot" width="18" height="18" />
                            </span>
                            <span className="wf-step-label">Create deal in CRM</span>
                            <span className="wf-step-badge wf-step-badge--action">HubSpot</span>
                          </div>
                        </div>
                      </div>

                      {/* ── Right: language-cycling prompt ── */}
                      <WorkflowPrompt onPause={setPaused} onDone={() => setShowSignupModal(true)} />
                    </div>
                  </div>
                </div>

                <div className="cta-area">
                  <a className="cta-btn" href="https://dashboard.spinabot.com" target="_blank" rel="noopener noreferrer">Sign up</a>
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
                              <span>SpinaBot activated</span>
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
                  <a className="cta-btn" href="https://dashboard.spinabot.com" target="_blank" rel="noopener noreferrer">Sign up</a>
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
                  <a className="cta-btn" href="https://dashboard.spinabot.com" target="_blank" rel="noopener noreferrer">Sign up</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
