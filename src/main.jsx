import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { createRoot } from 'react-dom/client';
// styles.css is <link>-ed by the host page (browser modules can't import CSS)
const Icon = ({ name, size = 20 }) => {
  const paths = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    spark: <path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z"/>,
    dots: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></>,
    brain: <><path d="M9.5 2A2.5 2.5 0 0 0 7 4.5V5A2.5 2.5 0 0 0 4.5 7.5v.5A2.5 2.5 0 0 0 2 10.5v1A2.5 2.5 0 0 0 4.5 14v.5A2.5 2.5 0 0 0 7 17v.5A2.5 2.5 0 0 0 9.5 20h1a2.5 2.5 0 0 0 2.5-2.5V4.5A2.5 2.5 0 0 0 10.5 2h-1Z"/><path d="M14.5 2A2.5 2.5 0 0 1 17 4.5V5A2.5 2.5 0 0 1 19.5 7.5v.5A2.5 2.5 0 0 1 22 10.5v1A2.5 2.5 0 0 1 19.5 14v.5A2.5 2.5 0 0 1 17 17v.5A2.5 2.5 0 0 1 14.5 20h-1a2.5 2.5 0 0 1-2.5-2.5V4.5A2.5 2.5 0 0 1 13.5 2h1Z"/></>,
    heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>,
    activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    compass: <><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>,
    menu: <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>,
    close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    refresh: <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
    lockKey: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.3"/></>,
    chat: <><path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/></>,
    user: <><circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.7-3.9 3.4-5.6 7-5.6s6.3 1.7 7 5.6"/></>,
    shieldCheck: <><path d="M12 21s7-3.5 7-9V5.5L12 3 5 5.5V12c0 5.5 7 9 7 9Z"/><path d="m9 11.8 2.2 2.2L15 10.2"/></>,
    trash: <><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/></>,
    doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></>,
    server: <><rect x="4" y="4" width="16" height="6" rx="1.6"/><rect x="4" y="14" width="16" height="6" rx="1.6"/><path d="M8 7h.01M8 17h.01"/></>,
    chatLock: <><path d="M20 14.5a2 2 0 0 1-2 2H8l-4 3.2V5.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"/><rect x="9.6" y="8.4" width="5" height="4.2" rx="1"/><path d="M10.6 8.4V7.3a1.5 1.5 0 0 1 3 0v1.1"/></>,
    chatCheck: <><path d="M20 14.5a2 2 0 0 1-2 2H8l-4 3.2V5.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"/><path d="m8.6 10 2.4 2.4 4.4-4.4"/></>,
    eyeOff: <><path d="M10.6 6.2A9 9 0 0 1 12 6c5 0 9 6 9 6a15 15 0 0 1-2.2 2.7M6.6 8.1A15 15 0 0 0 3 12s4 6 9 6a9 9 0 0 0 3.4-.66"/><path d="m3 3 18 18"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

const quotientDimensions = [
  { id: 'clarity', title: 'Decision Clarity', status: 'Clear pattern', badgeClass: 'badge-green', icon: 'target', iconBg: 'icon-peach', score: 84, detail: 'You make consistent, values aligned decisions when given structured reflection time.', recommendation: 'Focus on high leverage career choices this week.' },
  { id: 'awareness', title: 'Self Awareness', status: 'Taking shape', badgeClass: 'badge-orange', icon: 'brain', iconBg: 'icon-purple', score: 68, detail: 'Recognizing emotional triggers quickly, though still working through old reaction loops.', recommendation: 'Track triggers in your next daily check in.' },
  { id: 'steadiness', title: 'Emotional Steadiness', status: 'Taking shape', badgeClass: 'badge-orange', icon: 'heart', iconBg: 'icon-teal', score: 64, detail: 'Steadiness increases when rest is prioritized; dips during high stress work transitions.', recommendation: 'Set strict evening boundary buffers.' },
  { id: 'bandwidth', title: 'Cognitive Bandwidth', status: 'Early signal', badgeClass: 'badge-grey', icon: 'activity', iconBg: 'icon-blue', score: 55, detail: 'Mental clutter is elevated. Several unassigned decisions are consuming active working memory.', recommendation: 'Offload top 3 pending choices into Brihas.' },
  { id: 'coherence', title: 'Relational Coherence', status: 'Clear pattern', badgeClass: 'badge-green', icon: 'users', iconBg: 'icon-peach', score: 78, detail: 'Strong alignment with core relationships; healthy boundaries are establishing.', recommendation: 'Maintain open dialogue with key partners.' },
  { id: 'direction', title: 'Life Direction', status: 'Taking shape', badgeClass: 'badge-orange', icon: 'compass', iconBg: 'icon-tan', score: 72, detail: 'Long term trajectory is clarifying as secondary distractions are pruned.', recommendation: 'Review your 3 month focus goals.' },
];

const mindNodesData = [
  { id: 'Identity', label: 'Identity', x: 50, y: 48, category: 'Core Life', isCore: true, desc: 'Who you are at your core when external noise drops away.', connections: ['Values', 'Beliefs', 'Confidence', 'Purpose'] },
  { id: 'Career', label: 'Career', x: 26, y: 24, category: 'Action Areas', desc: 'Direction, ambition, and balancing effort with fulfilment.', connections: ['Burnout', 'Work', 'Goals', 'Money'] },
  { id: 'Relationships', label: 'Relationships', x: 62, y: 52, category: 'Core Life', desc: 'The bonds that support, test, and shape your daily energy.', connections: ['Love', 'Boundaries', 'Friendship', 'Family'] },
  { id: 'Health', label: 'Health', x: 26, y: 72, category: 'Core Life', desc: 'Physical stamina, mental rest, and somatic awareness.', connections: ['Rest', 'Energy', 'Burnout'] },
  { id: 'Finance', label: 'Finance', x: 58, y: 76, category: 'Action Areas', desc: 'Resource security, decision clarity, and long term peace.', connections: ['Money', 'Career', 'Future'] },
  { id: 'Burnout', label: 'Burnout', x: 30, y: 40, category: 'Internal State', desc: 'Early warning indicators of cognitive depletion.', connections: ['Health', 'Work', 'Rest'] },
  { id: 'Confidence', label: 'Confidence', x: 58, y: 58, category: 'Internal State', desc: 'Trusting your choices without constant second guessing.', connections: ['Identity', 'Growth', 'Change'] },
  { id: 'Purpose', label: 'Purpose', x: 48, y: 82, category: 'Internal State', desc: 'The underlying why behind how you allocate your time.', connections: ['Identity', 'Values', 'Goals'] },
  { id: 'Boundaries', label: 'Boundaries', x: 38, y: 76, category: 'Action Areas', desc: 'Saying no to preserve room for what actually matters.', connections: ['Relationships', 'Rest', 'Energy'] },
  { id: 'Growth', label: 'Growth', x: 54, y: 15, category: 'Action Areas', desc: 'Evolving beyond old patterns through intentional choices.', connections: ['Confidence', 'Learning', 'Change'] },
  { id: 'Beliefs', label: 'Beliefs', x: 34, y: 62, category: 'Core Life', desc: 'Assumptions about yourself and the world driving choices.', connections: ['Identity', 'Values'] },
  { id: 'Values', label: 'Values', x: 42, y: 20, category: 'Core Life', desc: 'Non negotiable principles guiding hard trade offs.', connections: ['Identity', 'Purpose'] },
  { id: 'Rest', label: 'Rest', x: 20, y: 84, category: 'Internal State', desc: 'Deliberate recovery for body and mind.', connections: ['Health', 'Burnout', 'Boundaries'] },
  { id: 'Energy', label: 'Energy', x: 38, y: 10, category: 'Internal State', desc: 'Daily vitality and emotional bandwidth.', connections: ['Health', 'Boundaries'] },
  { id: 'Goals', label: 'Goals', x: 52, y: 28, category: 'Action Areas', desc: 'Tangible milestones aligned with your identity.', connections: ['Career', 'Purpose'] },
];

const faqs = [
  ['Is Brihas therapy?', 'No. Brihas is a private thinking companion for everyday decisions and recurring patterns. It does not replace licensed mental health care or crisis support.'],
  ['How is Brihas different from a chatbot?', 'Brihas builds continuity. It connects the choices, beliefs, and life areas you share over time into one living picture, not a series of reset conversations.'],
  ['Who can see what I share?', 'Only you. Your conversations are private by design, and you control what is saved, revisited, or removed.'],
  ['What is the Brihas Quotient?', 'It is a clear, evolving snapshot of your life navigation: the areas that feel aligned, the ones asking for attention, and the patterns linking them.'],
];

const InteractiveHowItWorksSection = ({ sectionMotion, stagger, item }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'You talk freely.\nBrihas listens.',
      desc: 'No rigid forms or questionnaires. Speak freely in English, Hindi, or Hinglish via voice or text whenever thoughts pile up.',
      icon: '💬',
      tag: 'Voice & Text · English / Hindi',
      accentColor: '#8B5CF6',
      bgColor: '#F3E8FF',
      preview: {
        eyebrow: 'STEP 1 · NATURAL CONVERSATION',
        quote: '"I feel drained at work and can\'t figure out if I should leave or set boundaries..."',
        sub: 'Brihas listens & captures context without judgment.'
      }
    },
    {
      num: '02',
      title: 'Brihas builds a\nlife reading.',
      desc: 'Six core dimensions updated every session. Range narrows into actionable certainty as evidence grows.',
      icon: '📊',
      tag: '6D Quotient · Life Score',
      accentColor: '#E07A5F',
      bgColor: '#FFF5F2',
      preview: {
        eyebrow: 'STEP 2 · MULTI-DIMENSIONAL READING',
        quote: 'Career Alignment: 62% ➔ 74% | Emotional Clarity: Stable | Energy: Depleted',
        sub: 'Live visual tracking across 6 life dimensions.'
      }
    },
    {
      num: '03',
      title: 'Patterns surface\nquietly over time.',
      desc: 'Themes, hidden triggers, and life connections noticed over time — held safely across weeks.',
      icon: '🔍',
      tag: 'Pattern Detection · Evolving Map',
      accentColor: '#2D6043',
      bgColor: '#E4EFE4',
      preview: {
        eyebrow: 'STEP 3 · DEEP PATTERN INSIGHTS',
        quote: 'Pattern Detected: "You take on extra tasks when feeling uncertain about recognition."',
        sub: 'Connecting dots across past conversations quietly.'
      }
    },
    {
      num: '04',
      title: 'You get clear\nmicro-actions.',
      desc: 'A 3 day try or a 7 day shift sized to your moment. Clear, practical steps — never generic advice or homework.',
      icon: '⚡',
      tag: '3 & 7 day Action Shifts',
      accentColor: '#3B82F6',
      bgColor: '#EFF6FF',
      preview: {
        eyebrow: 'STEP 4 · ACTIONABLE NEXT STEPS',
        quote: 'Day 1: Decline 1 non-essential task | Day 2: 15-min quiet review | Day 3: Re-assess score',
        sub: 'Micro-shifts designed for immediate momentum.'
      }
    }
  ];

  return (
    <motion.section className="section how-mock-style" id="how" {...sectionMotion}>
      <div className="wrap">
        {/* Section Header */}
        <div className="how-mock-header" style={{ textAlign: 'left', marginBottom: '28px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
          <p className="eyebrow green-eyebrow" style={{ marginBottom: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i></i> HOW IT WORKS</p>
          <h2 className="section-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 2.5vw, 25px)', fontWeight: 700, color: '#1C251D', margin: 0, textAlign: 'left', lineHeight: 1.22 }}>
            One conversation a day. <span style={{ fontStyle: 'italic', color: '#237446', fontWeight: 600 }}>A reading of your life.</span>
          </h2>
        </div>

        {/* 4 Pipeline Step Cards Row */}
        <motion.div className="how-new-steps-grid" {...stagger}>
          {steps.map((s, index) => {
            const isActive = activeStep === index;
            return (
              <motion.article
                key={s.num}
                className={`how-new-card ${isActive ? 'active' : ''}`}
                onClick={() => setActiveStep(index)}
                onMouseEnter={() => setActiveStep(index)}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                style={{
                  borderColor: isActive ? s.accentColor : '#EBECE8',
                  backgroundColor: '#FFFFFF',
                  boxShadow: isActive ? `0 12px 30px -8px ${s.accentColor}20` : '0 6px 20px rgba(28, 37, 29, 0.03)'
                }}
                {...item}
              >
                <div className="how-card-top-row">
                  <span className="how-num-pill" style={{ backgroundColor: s.accentColor, color: '#FFFFFF' }}>
                    {s.num}
                  </span>
                  <span className="how-emoji-badge">{s.icon}</span>
                </div>
                <h3 className="how-step-title" style={{ whiteSpace: 'pre-line' }}>{s.title}</h3>
                <p className="how-step-desc">{s.desc}</p>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Dynamic Interactive Preview Showcase Card */}
        <motion.div 
          className="how-preview-card" 
          key={activeStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            marginTop: '28px',
            background: 'linear-gradient(135deg, #FAF9F6 0%, #FFFFFF 100%)',
            border: `1.5px solid ${steps[activeStep].accentColor}`,
            borderRadius: '26px',
            padding: '24px 32px',
            boxShadow: '0 16px 40px rgba(28, 37, 29, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.08em', color: steps[activeStep].accentColor, fontWeight: 700 }}>
              {steps[activeStep].preview.eyebrow}
            </span>
            <span style={{ fontSize: '12px', color: '#6E786F', fontWeight: 500 }}>
              Hover or tap cards above to explore
            </span>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #ECEEEA',
            borderRadius: '16px',
            padding: '16px 20px',
            fontSize: '15px',
            fontWeight: 600,
            color: '#1C251D',
            marginBottom: '8px',
            lineHeight: 1.5
          }}>
            {steps[activeStep].preview.quote}
          </div>

          <p style={{ fontSize: '13.5px', color: '#576359', margin: 0, fontWeight: 500 }}>
            ✨ {steps[activeStep].preview.sub}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

/* ══════════ <topic-orb> — Brihas.ai interactive 3D topic universe ══════════ */
if (typeof window !== 'undefined' && !customElements.get('topic-orb')) {
  const TOPICS = [
    ['Burnout', 1], ['Overthinking', 1], ['Career', 1], ['Relationships', 1],
    ['Clarity', 1], ['Money', 1], ['Identity', 1], ['Big decisions', 1],
    ['Purpose', 2], ['Anxiety', 2], ['Self doubt', 2], ['Peace of mind', 2],
    ['Health', 2], ['Growth', 2], ['Confidence', 2], ['Direction', 2],
    ['Future', 2], ['Inner Peace', 2], ['Work pressure', 2], ['Family', 2],
    ['Marriage', 2], ['Boundaries', 2], ['Regret', 2], ['Stress', 2],
    ['Motivation', 3], ['Friendship', 3], ['Loneliness', 3], ['Balance', 3],
    ['Mindset', 3], ['Productivity', 3], ['Grief', 3], ['Guilt', 3],
    ['Discipline', 3], ['Self worth', 3], ['Habits', 3], ['Belonging', 3],
    ['Starting over', 3], ['Comparison', 3], ['Energy', 3], ['Trust', 3],
    ['Forgiveness', 3], ['Sleep', 3], ['Ambition', 3], ['Conflict', 3]
  ];

  const INK = '#131A15', FOREST = '#1F5C41', SAGE = '#42604A',
        LAV = '#5B4C7C', BROWN = '#5F4530', COPPER = '#8A4E23';
  const HUES = [FOREST, INK, SAGE, LAV, BROWN, COPPER];

  const CSS = `
topic-orb { display:block; container-type:inline-size; width:100%; }
.orb-layout-grid {
  display:flex; flex-direction:column; align-items:center; text-align:center;
  width:100%; max-width:680px; margin:0 auto; padding: 10px 0;
}
.orb-head { text-align:left; margin:0 0 20px; width:100%; display:flex; flex-direction:column; align-items:flex-start; }
.orb-head-badge {
  display:inline-flex; align-items:center; gap:6px;
  padding:5px 14px; border-radius:100px;
  border:1px solid rgba(35, 116, 70, 0.35);
  background:rgba(35, 116, 70, 0.04);
  margin-bottom:14px;
}
.orb-head-badge .dot {
  width:7px; height:7px; border-radius:50%; background:#237446; display:inline-block;
}
.orb-head-badge span {
  font-family:'DM Sans',sans-serif; font-size:11px; font-weight:700;
  letter-spacing:.08em; text-transform:uppercase; color:#237446;
}
.orb-head h3 {
  font-family:'Playfair Display',Georgia,serif;
  font-size:clamp(32px, 5.2vw, 48px); font-weight:700;
  letter-spacing:-.02em; line-height:1.15; color:#1C251D; margin:0 0 6px;
  text-align:left;
}
.orb-head h3 em {
  font-family:'Playfair Display',Georgia,serif;
  font-style:italic; font-weight:600; color:#237446;
}
.orb-sub {
  font-family:'Playfair Display',Georgia,serif; font-style:italic;
  font-size:clamp(16px, 2.5vw, 20px); color:#6E786F; margin:0;
  text-align:left;
}
.orb-right-col { display:flex; flex-direction:column; align-items:center; width:100%; }
.orb-stage { position:relative; width:100%; aspect-ratio:1/1;
  max-width:min(100%,640px); margin:0 auto;
  touch-action:none; cursor:grab;
  -webkit-user-select:none; user-select:none;
}
.orb-stage:focus-visible { outline:1.5px solid #2B7858; outline-offset:8px; border-radius:50%; }
.orb-stage.is-drag { cursor:grabbing; }
.orb-glow, .orb-shell, .orb-rings, .orb-grid, .orb-field, .orb-link { position:absolute; inset:0; }
.orb-glow {
  border-radius:50%;
  background:
    radial-gradient(46% 44% at 30% 24%, rgba(142,127,176,.22), transparent 70%),
    radial-gradient(48% 46% at 74% 72%, rgba(110,138,114,.22), transparent 72%),
    radial-gradient(58% 56% at 52% 50%, rgba(255,255,255,.55), transparent 74%);
  filter:blur(28px);
}
.orb-shell {
  border-radius:50%;
  border:1px solid rgba(28,37,29,.08);
  background:
    radial-gradient(52% 48% at 32% 22%, rgba(255,255,255,.58), rgba(255,255,255,.05) 58%, transparent 74%),
    radial-gradient(72% 72% at 50% 54%, rgba(253,251,246,.14), transparent 76%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.72),
    inset 0 -40px 80px -62px rgba(28,37,29,.16),
    0 56px 84px -64px rgba(28,37,29,.26);
  -webkit-backdrop-filter:blur(2px); backdrop-filter:blur(2px);
}
.orb-rings, .orb-grid, .orb-link { overflow:visible; pointer-events:none; }
.orb-field { pointer-events:none; }
.orb-w {
  position:absolute; left:0; top:0;
  font-family:'DM Sans',ui-sans-serif,system-ui,sans-serif;
  white-space:nowrap; pointer-events:auto; cursor:pointer;
  background:none; border:0; padding:2px 4px; margin:0;
  transition:color .3s ease, opacity .28s ease;
  will-change:transform,opacity,filter;
}
.orb-w:focus-visible { outline:1.5px solid ${FOREST}; outline-offset:3px; border-radius:6px; }
.orb-w.is-on { color:${FOREST} !important; }
.orb-foot {
  display:flex; flex-direction:column; align-items:center; gap:3px;
  margin:12px 0 0; text-align:center;
}
.orb-foot b {
  font-family:'DM Mono',ui-monospace,monospace;
  font-size:11px; letter-spacing:.2em; text-transform:uppercase;
  font-weight:500; color:${INK};
}
.orb-hint {
  font-family:'Playfair Display',Georgia,serif; font-style:italic;
  font-size:14.5px; color:${SAGE};
}
.orb-cta {
  margin-top:14px; cursor:pointer;
  font-family:'DM Sans',ui-sans-serif,system-ui,sans-serif;
  font-size:14.5px; color:#FDFBF6; letter-spacing:-.01em;
  padding:12px 22px; border-radius:999px; border:0;
  background:${INK};
  box-shadow:0 14px 26px -16px rgba(28,37,29,.5);
  transition:background .2s ease, transform .2s ease;
}
.orb-cta:hover { background:${FOREST}; transform:translateY(-1px); }
.orb-snd {
  position:absolute; right:1%; bottom:5%;
  width:40px; height:40px; border-radius:50%; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  color:${SAGE}; border:1px solid rgba(28,37,29,.1);
  background:rgba(255,255,255,.66);
  -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
  box-shadow:0 8px 18px -12px rgba(28,37,29,.3), inset 0 1px 0 rgba(255,255,255,.9);
  transition:color .2s ease, border-color .2s ease, background .2s ease;
}
.orb-snd:hover { color:${FOREST}; border-color:rgba(43,120,88,.3); background:rgba(255,255,255,.92); }
.orb-snd[aria-pressed="true"] { color:${FOREST}; }
@container (max-width: 620px) {
  .orb-stage { max-width:100%; }
  .orb-snd { width:36px; height:36px; right:0; bottom:2%; }
}
@media (prefers-reduced-motion: reduce) { .orb-w { transition:none; } }
`;

  function injectCSS() {
    if (document.getElementById('topic-orb-css')) return;
    const s = document.createElement('style');
    s.id = 'topic-orb-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  const SND_ON = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5"/><path d="M18.5 7a7 7 0 0 1 0 10"/></svg>`;
  const SND_OFF = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z"/><path d="m16 10 4 4M20 10l-4 4"/></svg>`;

  class TopicOrb extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      injectCSS();

      this.innerHTML = `
        <div class="orb-layout-grid">
          <div class="orb-head">
            <div class="orb-head-badge">
              <span class="dot"></span>
              <span>WHAT&rsquo;S ON YOUR MIND</span>
            </div>
            <p class="orb-sub">Explore <span>what matters to you.</span></p>
          </div>
          <div class="orb-right-col">
            <div class="orb-stage">
              <div class="orb-glow"></div>
              <div class="orb-shell"></div>
              <svg class="orb-rings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
              <svg class="orb-grid" aria-hidden="true"></svg>
              <svg class="orb-link" aria-hidden="true"></svg>
              <div class="orb-field" role="group" aria-label="Topics"></div>
              <button class="orb-snd" type="button" aria-pressed="false" aria-label="Toggle ambient sound">${SND_OFF}</button>
            </div>
            <div class="orb-foot">
              <b>Drag to explore</b>
              <span class="orb-hint">Spin the orb and discover more.</span>
              <button class="orb-cta" type="button" hidden></button>
            </div>
          </div>
        </div>`;

      this.stage = this.querySelector('.orb-stage');
      this.field = this.querySelector('.orb-field');
      this.rings = this.querySelector('.orb-rings');
      this.grid  = this.querySelector('.orb-grid');
      this.link  = this.querySelector('.orb-link');
      this.sndBtn = this.querySelector('.orb-snd');
      this.cta = this.querySelector('.orb-cta');

      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.compact = null;
      this.yaw = 0.6; this.pitch = -0.1;
      this.vYaw = 0.0016; this.vPitch = 0;
      this.hover = false; this.drag = null; this.focus = null;
      this.hot = null;
      this.sound = null; this.picked = null; this.visible = true;

      this._buildRings();
      this._buildWords();
      this._bind();

      this._tick = this._tick.bind(this);
      this._render();
      requestAnimationFrame(this._tick);

      this._io = new IntersectionObserver(es => { this.visible = es[0].isIntersecting; },
        { threshold: 0.02 });
      this._io.observe(this);
      this._ro = new ResizeObserver(() => {
        const before = this.compact;
        this._layout();
        if (this.compact !== before) this._bindWords();
        this._stale = true; this._render();
      });
      this._ro.observe(this.stage);
    }

    disconnectedCallback() {
      this._io && this._io.disconnect();
      this._ro && this._ro.disconnect();
      this._stopSound();
      cancelAnimationFrame(this._raf);
    }

    _buildRings() {
      const ell = (rx, ry, rot, op, dash) =>
        `<ellipse cx="50" cy="50" rx="${rx}" ry="${ry}" transform="rotate(${rot} 50 50)"
           fill="none" stroke="rgba(43,120,88,${op})" stroke-width="0.28"
           ${dash ? `stroke-dasharray="${dash}"` : ''} vector-effect="non-scaling-stroke"/>`;
      this.rings.innerHTML = ell(49.6, 14, -16, .22, '') + ell(49.6, 31, 13, .12, '1.6 2.4');
    }

    _drawGlobe(g, R, cx, cy, FOV, box) {
      const step = 9, front = [], back = [];
      const put = (arr, pts) => { if (pts.length > 1) arr.push('M' + pts.join('L')); };
      const project = (lat, lon) => {
        const cl = Math.cos(lat), x = cl * Math.sin(lon), y = Math.sin(lat), z = cl * Math.cos(lon);
        const x1 = x * g.cyw - z * g.syw, z1 = x * g.syw + z * g.cyw;
        const y2 = y * g.cp - z1 * g.sp, z2 = y * g.sp + z1 * g.cp;
        const s = FOV / (FOV - z2 * R);
        return { p: `${(cx + x1 * R * s).toFixed(1)} ${(cy + y2 * R * s).toFixed(1)}`, near: z2 > 0 };
      };
      const trace = fn => {
        let run = [], side = null;
        for (let t = 0; t <= 360; t += step) {
          const q = project(...fn(t * Math.PI / 180));
          if (side === null) side = q.near;
          if (q.near !== side) { put(side ? front : back, run); run = [run[run.length - 1]].filter(Boolean); side = q.near; }
          run.push(q.p);
        }
        put(side ? front : back, run);
      };
      for (let i = 0; i < 6; i++) {
        const lon = i * Math.PI / 6;
        trace(t => [t <= Math.PI ? t - Math.PI / 2 : Math.PI / 2 - (t - Math.PI), lon]);
      }
      for (let i = -2; i <= 2; i++) {
        const lat = i * (Math.PI / 6);
        trace(t => [lat, t]);
      }
      g.svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      g.svg.innerHTML =
        `<path d="${back.join('')}" fill="none" stroke="rgba(28,37,29,.05)" stroke-width="0.7"/>` +
        `<path d="${front.join('')}" fill="none" stroke="rgba(43,120,88,.13)" stroke-width="0.8"/>`;
    }

    _buildWords() {
      const buckets = [[], [], []];
      TOPICS.forEach(t => buckets[t[1] - 1].push(t));
      const order = [];
      for (let k = 0; order.length < TOPICS.length; k++)
        for (const b of buckets) if (b[k]) order.push(b[k]);
      this.order = order;
      this.words = [];
      this._layout();
    }

    _layout() {
      const w = this.stage.getBoundingClientRect().width || 640;
      const compact = w < 560;
      if (compact === this.compact) return;
      this.compact = compact;

      this.field.textContent = '';
      const order = compact ? this.order.filter(t => t[1] < 3).slice(0, 18) : this.order;
      const n = order.length;
      this.words = order.map(([label, tier], i) => {
        const y = 1 - (2 * i + 1) / n;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const th = Math.PI * (3 - Math.sqrt(5)) * i;
        const j = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
        const base = tier === 1 ? 1 : tier === 2 ? 0.84 : 0.66;
        const shell = base * (0.87 + j * 0.26);
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'orb-w';
        el.textContent = label;
        el.style.color = HUES[i % HUES.length];
        el.style.fontSize = (tier === 1 ? 1 : tier === 2 ? (compact ? 0.82 : 0.7) : 0.54) + 'em';
        el.style.fontWeight = tier === 1 ? 600 : tier === 2 ? 500 : 500;
        el.style.letterSpacing = tier === 1 ? '-.02em' : '-.01em';
        el.addEventListener('click', () => this._select(i));
        el.addEventListener('pointerenter', () => { this.hot = i; this._render(); });
        el.addEventListener('pointerleave', () => { this.hot = null; this._render(); });
        this.field.appendChild(el);
        return { label, tier, el, x: Math.cos(th) * r * shell, y: y * shell,
                 z: Math.sin(th) * r * shell };
      });
    }

    _bind() {
      const s = this.stage;
      s.addEventListener('pointerenter', () => { this.hover = true; });
      s.addEventListener('pointerleave', () => { this.hover = false; });

      s.addEventListener('pointerdown', e => {
        if (e.target.closest('.orb-snd')) return;
        s.setPointerCapture(e.pointerId);
        s.classList.add('is-drag');
        this.drag = { x: e.clientX, y: e.clientY, moved: 0 };
        this.focus = null;
      });

      s.addEventListener('pointermove', e => {
        if (!this.drag) return;
        const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y, k = 0.006;
        this.yaw += dx * k;
        this.pitch = Math.max(-1.05, Math.min(1.05, this.pitch + dy * k * 0.7));
        this.vYaw = dx * k * 0.5;
        this.vPitch = dy * k * 0.35;
        this.drag.moved += Math.abs(dx) + Math.abs(dy);
        this.drag.x = e.clientX; this.drag.y = e.clientY;
        this._render();
      });

      const end = () => {
        if (!this.drag) return;
        if (this.drag.moved < 4) this.vYaw = this.vYaw || 0.0016;
        this.drag = null;
        s.classList.remove('is-drag');
      };
      s.addEventListener('pointerup', end);
      s.addEventListener('pointercancel', end);

      this.sndBtn.addEventListener('click', () => this._toggleSound());

      s.tabIndex = 0;
      s.setAttribute('role', 'application');
      s.setAttribute('aria-label', 'Topic globe — use arrow keys to rotate');
      s.addEventListener('keydown', e => {
        const step = 0.055;
        if (e.key === 'ArrowLeft') this.vYaw = -step;
        else if (e.key === 'ArrowRight') this.vYaw = step;
        else if (e.key === 'ArrowUp') this.vPitch = -step * 0.7;
        else if (e.key === 'ArrowDown') this.vPitch = step * 0.7;
        else return;
        this.focus = null;
        e.preventDefault();
      });
      this.cta.addEventListener('click', () => {
        if (!this.picked) return;
        this.dispatchEvent(new CustomEvent('topicstart',
          { detail: { topic: this.picked }, bubbles: true }));
      });
    }

    _select(i) {
      const w = this.words[i];
      this.words.forEach(o => o.el.classList.toggle('is-on', o === w));
      const R = Math.hypot(w.x, w.z);
      this.focus = { yaw: Math.atan2(w.x, w.z), pitch: Math.atan2(w.y, R) };
      this.vYaw = 0; this.vPitch = 0;
      this.picked = w.label;
      this.cta.textContent = `Talk about ${w.label} →`;
      this.cta.hidden = false;
      this.dispatchEvent(new CustomEvent('topicselect',
        { detail: { topic: w.label }, bubbles: true }));
    }

    _tick() {
      this._raf = requestAnimationFrame(this._tick);
      if (!this.visible || this.drag) return;

      const idle = 0.0016;
      if (this.focus) {
        const dy = ((this.focus.yaw - this.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        this.yaw += dy * 0.07;
        this.pitch += (this.focus.pitch - this.pitch) * 0.07;
        if (Math.abs(dy) < 0.004) { this.focus = null; this.vYaw = idle * 0.5; }
      } else {
        this.vYaw += (idle - this.vYaw) * 0.012;
        this.vPitch *= 0.94;
        const slow = this.hover ? 0.22 : 1;
        this.yaw += this.vYaw * slow * (this.reduced ? 0.2 : 1);
        this.pitch += this.vPitch * slow;
        this.pitch += (-0.06 - this.pitch) * 0.004;
      }
      this._render();
    }

    _render() {
      if (!this.words || !this.words.length) return;
      const box = this.stage.getBoundingClientRect();
      if (!box.width) return;

      const R = box.width * 0.455, cx = box.width / 2, cy = box.height / 2;
      const FOV = R * 3.1;
      const cyw = Math.cos(this.yaw), syw = Math.sin(this.yaw);
      const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
      const fs = Math.max(this.compact ? 15.5 : 15, box.width * 0.037) + 'px';
      if (fs !== this._fs) {
        this.stage.style.fontSize = this._fs = fs;
        this._stale = true;
      }
      if (this._stale) { this._measure(); this._stale = false; }

      const pts = [];
      const boxes = [];
      const rim = box.width / 2 - 3;
      this._drawGlobe({ svg: this.grid, cyw, syw, cp, sp }, R, cx, cy, FOV, box);
      let wi = -1;
      for (const w of this.words) {
        wi++;
        const x1 = w.x * cyw - w.z * syw, z1 = w.x * syw + w.z * cyw;
        const y2 = w.y * cp - z1 * sp,    z2 = w.y * sp + z1 * cp;
        const X = x1 * R, Y = y2 * R, Z = z2 * R;
        const s = FOV / (FOV - Z);
        const d = (z2 + 1) / 2;
        const op = (0.5 + 0.5 * d) * (w.tier === 3 ? 0.9 : 1);

        let dx = X * s, dy = Y * s;
        const hw = (w.w || 0) * s / 2, hh = (w.h || 0) * s / 2;
        const a = dx * dx + dy * dy;
        if (a > 0.01) {
          const b = 2 * (Math.abs(dx) * hw + Math.abs(dy) * hh);
          const c = hw * hw + hh * hh - rim * rim;
          if (a + b + c > 0) {
            const k = Math.max(0, (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a));
            dx *= k; dy *= k;
          }
        }
        const px = cx + dx, py = cy + dy;
        const lift = this.hot === wi ? 1.14 : 1;

        const st = w.el.style;
        st.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%,-50%) scale(${(s * lift).toFixed(3)})`;
        st.opacity = (lift > 1 ? 1 : op).toFixed(3);
        st.filter = (lift === 1 && d < 0.45) ? `blur(${((0.45 - d) * 2.2).toFixed(2)}px)` : 'none';
        st.zIndex = lift > 1 ? 200 : Math.round(d * 100);
        st.pointerEvents = d > 0.42 ? 'auto' : 'none';
        if (d > 0.5) pts.push({ x: px, y: py, hot: lift > 1 });
        boxes.push({ el: w.el, d: lift > 1 ? 2 : d, op, x: px, y: py, hw, hh });
      }
      this._occlude(boxes);
      this._drawLinks(pts, box);
      if (this.sound) this._sound(Math.abs(this.vYaw) + Math.abs(this.vPitch));
    }

    _measure() {
      if (!this.words.length) return;
      for (const w of this.words) { w.w = w.el.offsetWidth; w.h = w.el.offsetHeight; }
    }

    _bindWords() {
      this.picked = null;
      this.cta.hidden = true;
    }

    _occlude(boxes) {
      if (!this.words[0].w) this._measure();
      boxes.sort((a, b) => b.d - a.d);
      const kept = [];
      for (const b of boxes) {
        let hidden = false;
        for (const k of kept) {
          if (Math.abs(b.x - k.x) < (b.hw + k.hw) - 5 &&
              Math.abs(b.y - k.y) < (b.hh + k.hh) - 3) { hidden = true; break; }
        }
        if (hidden) {
          b.el.style.opacity = (b.op * 0.14).toFixed(3);
          b.el.style.pointerEvents = 'none';
        } else {
          kept.push(b);
        }
      }
    }

    _drawLinks(pts, box) {
      let d = '', hot = '';
      const lim = box.width * 0.24;
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          if (Math.hypot(a.x - b.x, a.y - b.y) < lim) {
            const seg = `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
            if (a.hot || b.hot) hot += seg; else d += seg;
          }
        }
      this.link.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      this.link.innerHTML =
        `<path d="${d}" fill="none" stroke="rgba(43,120,88,.13)" stroke-width="0.7"/>` +
        `<path d="${hot}" fill="none" stroke="rgba(31,92,65,.5)" stroke-width="1.1"/>`;
    }

    _toggleSound() {
      if (this.sound) { this._stopSound(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const gain = ctx.createGain(); gain.gain.value = 0;
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass'; filt.frequency.value = 460; filt.Q.value = 0.7;
      const osc = [110, 110.4, 164.8].map((f, i) => {
        const o = ctx.createOscillator();
        o.type = i === 2 ? 'triangle' : 'sine';
        o.frequency.value = f;
        const g = ctx.createGain(); g.gain.value = i === 2 ? 0.22 : 0.5;
        o.connect(g).connect(filt); o.start();
        return o;
      });
      filt.connect(gain).connect(ctx.destination);
      gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 2.4);
      this.sound = { ctx, gain, filt, osc };
      const s = this.sound;
      this.sndBtn.setAttribute('aria-pressed', 'true');
      this.sndBtn.innerHTML = SND_ON;
      try { ctx.resume && ctx.resume(); } catch (e) {}
      const check = () => { if (this.sound === s && ctx.state !== 'running') this._stopSound(); };
      ctx.addEventListener && ctx.addEventListener('statechange', check);
      setTimeout(check, 500);
    }

    _stopSound() {
      if (!this.sound) return;
      const { ctx, gain, osc } = this.sound;
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
      setTimeout(() => { osc.forEach(o => o.stop()); ctx.close(); }, 900);
      this.sound = null;
      this.sndBtn.setAttribute('aria-pressed', 'false');
      this.sndBtn.innerHTML = SND_OFF;
    }

    _sound(speed) {
      const { ctx, filt } = this.sound;
      filt.frequency.setTargetAtTime(360 + Math.min(speed * 26000, 900), ctx.currentTime, 0.6);
    }
  }

  customElements.define('topic-orb', TopicOrb);
}

const ExactImageWordCloudSection = ({ onSelectWord }) => {
  const orbRef = useRef(null);

  useEffect(() => {
    const el = orbRef.current;
    if (!el) return;

    const handleSelect = (e) => {
      if (e.detail && e.detail.topic && onSelectWord) {
        onSelectWord(e.detail.topic);
      }
    };

    el.addEventListener('topicselect', handleSelect);
    el.addEventListener('topicstart', handleSelect);
    return () => {
      el.removeEventListener('topicselect', handleSelect);
      el.removeEventListener('topicstart', handleSelect);
    };
  }, [onSelectWord]);

  return (
    <div className="starting-word-cloud-container" style={{ width: '100%', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
      <topic-orb ref={orbRef}></topic-orb>
    </div>
  );
};

const CleanInteractiveMindMapSection = ({ onStartTopic }) => {
  const [selectedNode, setSelectedNode] = useState('Values');

  return (
    <motion.section
      className="mindmap-section-clean"
      id="map"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="wrap">
        {/* Intro Header Grid */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p className="eyebrow green-eyebrow" style={{ marginBottom: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i></i> INTERACTIVE MIND MAP</p>
          <h2 className="section-subhead section-subhead--center">Your themes, and <span style={{ fontStyle: 'italic', color: '#237446', fontWeight: 600 }}>how they connect.</span></h2>
        </div>

        <your-map
          ref={el => {
            if (!el || el._wired) return;
            el._wired = true;
            el.addEventListener('nodeselect', e => setSelectedNode(e.detail.label));
            el.addEventListener('nodestart', e => onStartTopic && onStartTopic(e.detail.label));
          }}
        ></your-map>
      </div>
    </motion.section>
  );
};

// ══════════ OFFICIAL BRIHAS.AI LOGO COMPONENT ══════════
const BrihasLogo = ({ size = 28, showTag = true, className = "" }) => (
  <div className={`brihas-official-logo-brand ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
    {/* Abstract Human Apex Chevron Icon */}
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="18" cy="6" r="3" fill="#1C251D" />
      <path d="M 6 26 L 18 13 L 30 26" stroke="#1C251D" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    
    {/* Serif Typography */}
    <span style={{ 
      fontFamily: "'Playfair Display', Georgia, serif", 
      fontSize: size >= 32 ? '28px' : '22px', 
      fontWeight: 500, 
      color: '#1C251D', 
      letterSpacing: '-0.01em',
      lineHeight: 1,
      display: 'inline-flex',
      alignItems: 'baseline'
    }}>
      brihas.ai<sup style={{ fontSize: '11px', fontWeight: 400, marginLeft: '2px', color: '#6E8A72' }}>™</sup>
    </span>
  </div>
);

function App() {
  const [openFaq, setOpenFaq] = useState(0);
  const [showReflect, setShowReflect] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x, y });
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Hero Section Input State
  const [isListening, setIsListening] = useState(false);

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is supported in Chrome, Safari, and modern browsers.");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setHeroInputText(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };
  
  const [heroInputText, setHeroInputText] = useState('');

  // Quotient Section State
  const [dimFilter, setDimFilter] = useState('All');
  const [activeDimId, setActiveDimId] = useState('clarity');
  const [simulatedSession, setSimulatedSession] = useState(false);

  // Mobile Comparison State
  const [mobileCompTab, setMobileCompTab] = useState('THERAPY');

  const reduceMotion = useReducedMotion();

  const sectionMotion = reduceMotion ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: .6, ease: [0.22, 1, 0.36, 1] } };
  const stagger = reduceMotion ? {} : { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: .1 }, variants: { hidden: {}, visible: { transition: { staggerChildren: .08 } } } };
  const item = reduceMotion ? {} : { variants: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: .45, ease: [0.22, 1, 0.36, 1] } } } };

  // Filtered Quotient Dimensions
  const filteredDimensions = dimFilter === 'All' 
    ? quotientDimensions 
    : quotientDimensions.filter(d => d.status === dimFilter);

  const activeDimension = quotientDimensions.find(d => d.id === activeDimId) || quotientDimensions[0];

  return (
    <>
    <main id="top">
      {/* Top Header Navigation Bar with ONLY Logo Left and Hamburger Menu Right */}
      <header className="target-nav-header">
        <div className="target-nav-inner wrap">
          {/* Brand Logo Left */}
          <a href="#top" aria-label="Brihas.ai Home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <BrihasLogo size={28} />
          </a>

          {/* Coming soon badges, moved out of the hero into the header */}
          <div className="hq-stores">
            <span className="hq-stores-lead">Coming soon</span>
            <div className="hq-store-container">
              <span className="hq-store">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.36c.63-.76 1.07-1.82.95-2.88-.93.04-2.07.62-2.73 1.39-.59.68-1.11 1.77-.97 2.81 1.04.08 2.12-.55 2.75-1.32z"/>
                </svg>
                <span>App Store</span>
              </span>

              <span className="hq-store">
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path d="M3.6 1.8c-.37.96 0 1.86.75 2.29L15.99 12 4.35 20.9c-.6-.43-.86-1.31-.53-2.27z" fill="#4CAF50" />
                  <path d="M15.99 12 4.53 3.1c.6-.5 1.36-.42 2 .0L20.9 10.6c1.06.6 1.06 2.2 0 2.8L18.53 14.8z" fill="#4285F4" />
                  <path d="M15.99 12 6.53 20.9c-.64.42-1.4.5-2 0l11.46-8.9z" fill="#FBBC04" />
                  <path d="M18.53 14.8 6.53 21.9c-.64.42-1.4.5-2 0l11.46-8.9z" fill="#EA4335" />
                </svg>
                <span>Google Play</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Editorial Centered Hero Section */}
      <section className="hero-exact">
        <div className="hero__inner">
          {/* Main Headline Matching Target Design */}
          <h1 className="hero-title-main">
            <span className="hero-line-dark">Your Thinking Partner.</span>
            <span className="hero-line-bronze">For everything you carry alone.</span>
          </h1>

          <p className="hero-sub-text">
            Too important for a group chat. Too personal for a search bar.
          </p>

          {/* Search Box */}
          <form className="hq-bar" onSubmit={(e) => { e.preventDefault(); if (heroInputText.trim()) { const el = document.getElementById('topics'); if (el) el.scrollIntoView({ behavior: 'smooth' }); } }}>
            <input 
              className="hq-input" 
              type="text" 
              placeholder={isListening ? "Listening... Speak your thoughts" : "What's on your mind?"} 
              aria-label="What's on your mind?"
              value={heroInputText}
              onChange={(e) => setHeroInputText(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                type="button" 
                className={`hq-mic-btn ${isListening ? 'listening' : ''}`} 
                onClick={toggleVoiceInput}
                aria-label="Voice Input"
                title="Speak to Brihas.ai"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
              </button>
              <button type="submit" className="hq-go" aria-label="Begin">
                <Icon name="arrow" size={17} />
              </button>
            </div>
          </form>

          {/* Start Anywhere Chips with Icons */}
          <div className="hq-chips">
            <div className="hq-chip-container">
              {[
                { label: 'Stress & Overthinking', icon: '⚡' },
                { label: 'Partner & Marriage', icon: '🤍' },
                { label: 'Career & Money', icon: '💼' },
                { label: 'A Difficult Decision', icon: '⚖️' }
              ].map((item, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  className="hq-chip"
                  onClick={() => setHeroInputText(`I want to reflect on ${item.label.toLowerCase()}...`)}
                >
                  <span className="chip-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2ND SECTION: WHAT IS WEIGHING ON YOUR MIND - 3D TOPIC UNIVERSE ORB */}
      <motion.section className="section weighing-mind-section" id="topics" {...sectionMotion}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <ExactImageWordCloudSection 
            onSelectWord={(word) => {
              setHeroInputText(`I want to reflect on ${word.toLowerCase()}...`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </motion.section>

      {/* 3RD SECTION: PRIVACY & TRUST */}
      <motion.section className="section privacy-section" id="privacy" {...sectionMotion}>
        <div className="wrap">
          <div className="pv-head">
            <span className="pv-pill"><Icon name="lockKey" size={14} /> Your privacy, our promise</span>
            <h2 className="pv-h2">
              You can share anything here.
              <em>You are safe. Always.</em>
            </h2>
          </div>

          <div className="pv-flow">
            <div className="pv-step">
              <span className="pv-step-icon"><Icon name="chat" size={46} /></span>
              <b>You share</b>
            </div>
            <span className="pv-arrow" aria-hidden="true">
              <svg viewBox="0 0 34 8" fill="none"><path d="M0 4h27M23.5 1l3.5 3-3.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>

            <div className="pv-step">
              <span className="pv-step-icon"><Icon name="lockKey" size={46} /></span>
              <b>We encrypt</b>
            </div>
            <span className="pv-arrow" aria-hidden="true">
              <svg viewBox="0 0 34 8" fill="none"><path d="M0 4h27M23.5 1l3.5 3-3.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>

            <div className="pv-shield">
              <ul className="pv-specs">
                <li><Icon name="shieldCheck" size={20} /><span>ISO 27001<br />Certified</span></li>
                <li><Icon name="user" size={20} /><span>PII Protection<br />(Personal Identity Information)</span></li>
                <li><Icon name="lockKey" size={20} /><span>Encryption &amp;<br />Decryption</span></li>
              </ul>

              <div className="pv-crest" aria-label="brihas data security shield">
                <svg className="pv-crest-svg" viewBox="0 0 240 280" aria-hidden="true">
                  <path className="pv-sh pv-sh3" d="M120 6 232 44v104c0 74-56 106-112 126C64 254 8 222 8 148V44Z" />
                  <path className="pv-sh pv-sh2" d="M120 22 216 55v93c0 65-49 93-96 110-47-17-96-45-96-110V55Z" />
                  <path className="pv-sh pv-sh1" d="M120 38 200 66v82c0 56-42 80-80 95-38-15-80-39-80-95V66Z" />
                </svg>
                <span className="pv-crest-text">
                  <b>brihas</b>
                  <em>data security shield</em>
                  <i><Icon name="lockKey" size={22} /></i>
                </span>
              </div>

              <ul className="pv-specs">
                <li><Icon name="doc" size={20} /><span>Digital Personal Data Protection Act Compliant</span></li>
                <li><Icon name="server" size={20} /><span>Secure Storage<br />&amp; Access Control</span></li>
                <li><Icon name="shieldCheck" size={20} /><span>Regular Security<br />Audits &amp; Monitoring</span></li>
              </ul>
            </div>

            <span className="pv-arrow" aria-hidden="true">
              <svg viewBox="0 0 34 8" fill="none"><path d="M0 4h27M23.5 1l3.5 3-3.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <div className="pv-step">
              <span className="pv-step-icon"><Icon name="chatLock" size={46} /></span>
              <b>We process safely</b>
            </div>
            <span className="pv-arrow" aria-hidden="true">
              <svg viewBox="0 0 34 8" fill="none"><path d="M0 4h27M23.5 1l3.5 3-3.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>

            <div className="pv-step">
              <span className="pv-step-icon"><Icon name="chatCheck" size={46} /></span>
              <b>You receive</b>
            </div>
          </div>

          <div className="pv-strip">
            <div className="pv-claim"><Icon name="shieldCheck" size={26} /><b>End-to-end encrypted</b></div>
            <div className="pv-claim"><Icon name="eyeOff" size={26} /><b>We can&rsquo;t see your data</b></div>
            <div className="pv-claim"><Icon name="trash" size={26} /><b>Yours to delete</b></div>
          </div>
        </div>
      </motion.section>

      {/* 4TH SECTION: HOW IT WORKS */}
      <InteractiveHowItWorksSection sectionMotion={sectionMotion} stagger={stagger} item={item} />

      {/* 5TH SECTION: MODERN INTERACTIVE READING / QUOTIENT SECTION */}
      <motion.section className="section quotient" id="quotient" {...sectionMotion}>
        <div className="wrap">
          <div className="reading-header" style={{ textAlign: 'left', marginBottom: '28px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
            <p className="eyebrow green-eyebrow" style={{ marginBottom: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i></i> YOUR DAILY CLARITY SCORE</p>
            <h2 className="section-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4.5vw, 42px)', fontWeight: 700, color: '#1C251D', margin: 0, textAlign: 'left', lineHeight: 1.2 }}>
              See how your clarity <span style={{ fontStyle: 'italic', color: '#237446', fontWeight: 600 }}>changes over time.</span>
            </h2>
          </div>

          <div className="reading-toolbar">
            <div className="reading-filters">
              <span className="filter-label"><Icon name="filter" size={13}/> Filter status:</span>
              {['All', 'Clear pattern', 'Taking shape', 'Early signal'].map(status => (
                <button 
                  key={status} 
                  className={`filter-pill ${dimFilter === status ? 'active' : ''}`}
                  onClick={() => setDimFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <button 
              className={`simulate-btn ${simulatedSession ? 'active' : ''}`}
              onClick={() => setSimulatedSession(!simulatedSession)}
            >
              <Icon name="refresh" size={13}/> {simulatedSession ? 'Reset View' : 'Simulate Session Check-in'}
            </button>
          </div>

          <div className="reading-grid-container">
            {/* Left Main Card */}
            <div className="reading-card-wrapper">
              <span className="illustrative-badge">ILLUSTRATIVE</span>
              <div className="reading-card">
                <div className="card-header">
                  <span className="card-tag">YOUR READING · TODAY</span>
                  <span className="card-status"><i className="status-dot"></i> {simulatedSession ? 'Refined & Aligned' : 'Taking shape'}</span>
                </div>

                <div className="score-row">
                  <motion.span 
                    className="score-value"
                    key={simulatedSession ? 'sim' : 'normal'}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {simulatedSession ? '74 to 80' : '62 to 68'}
                  </motion.span>
                  <span className="score-label">Brihas Quotient / 100</span>
                </div>

                <div className="score-progress">
                  <motion.div 
                    className="score-bar" 
                    animate={{ width: simulatedSession ? '77%' : '65%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  ></motion.div>
                </div>

                <div className="dimensions-list">
                  {filteredDimensions.map(d => (
                    <motion.div 
                      key={d.id} 
                      className={`dim-item ${activeDimId === d.id ? 'selected' : ''}`}
                      onClick={() => setActiveDimId(d.id)}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="dim-left">
                        <span className={`dim-icon ${d.iconBg}`}><Icon name={d.icon} size={13}/></span>
                        <span className="dim-title">{d.title}</span>
                      </div>
                      <div className="dim-right">
                        <span className={`dim-badge ${d.badgeClass}`}>{d.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Interactive Detail & Feature Highlights */}
            <div className="reading-side-panel">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeDimension.id + (simulatedSession ? '-sim' : '')}
                  className="dimension-detail-card"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="detail-header">
                    <span className={`dim-icon ${activeDimension.iconBg}`}><Icon name={activeDimension.icon} size={16}/></span>
                    <div>
                      <h4>{activeDimension.title}</h4>
                      <span className={`dim-badge ${activeDimension.badgeClass}`}>{activeDimension.status}</span>
                    </div>
                  </div>

                  <div className="detail-score-meter">
                    <div className="meter-label">
                      <span>Dimension Maturity</span>
                      <strong>{activeDimension.score}%</strong>
                    </div>
                    <div className="meter-track">
                      <div className="meter-fill" style={{ width: `${activeDimension.score}%` }}></div>
                    </div>
                  </div>

                  <p className="detail-body">{activeDimension.detail}</p>
                  
                  <div className="detail-action-box">
                    <small>RECOMMENDED ACTION</small>
                    <p>{activeDimension.recommendation}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* 3 Step Highlight Row */}
              <div className="reading-highlights">
                <div className="highlight-col">
                  <span className="hl-num">1</span>
                  <p>Six dimensions of living</p>
                </div>
                <div className="highlight-col">
                  <span className="hl-num">2</span>
                  <p>Computed per session</p>
                </div>
                <div className="highlight-col">
                  <span className="hl-num">3</span>
                  <p>Peer benchmarked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 6TH SECTION: INTERACTIVE MIND MAP SECTION */}
      <CleanInteractiveMindMapSection
        onStartTopic={(label) => {
          setHeroInputText(`I want to reflect on ${label.toLowerCase()}...`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 7TH SECTION: Comparison Table */}
      <section className="comparison">
        <div className="wrap">
          <div className="comparison-intro" style={{ textAlign: 'center', marginBottom: '28px' }}>
            <p className="eyebrow green-eyebrow" style={{ marginBottom: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i></i> WHY BRIHAS</p>
            <h2 className="section-subhead section-subhead--center">What others do separately, <span style={{ fontStyle: 'italic', color: '#237446', fontWeight: 600 }}>brought together.</span></h2>
          </div>
          
          {/* Desktop Table View */}
          <div className="table-wrap desktop-only-table">
            <table>
              <thead>
                <tr>
                  <th>CAPABILITY</th>
                  <th>THERAPY</th>
                  <th>JOURNALING</th>
                  <th>GENERAL AI CHAT</th>
                  <th className="brihas-col">BRIHAS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Remembers across weeks','Yes, if you stay','Only if re-read','No, resets each chat','✓ Living Continuity'],
                  ['Structured score','Rarely','No','No','✓ 6D Quotient'],
                  ['Available at 1am','No','Yes','Yes','✓ 24/7 Access'],
                  ['Action plan','Sometimes','No','No','✓ 3 & 7 day Plans'],
                  ['Living timeline','Session notes','Static pages','Resets each chat','✓ Evolving Timeline'],
                  ['Maps life beliefs','In your head','No','No','✓ Personal Life Map']
                ].map(row => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td className={i === 4 ? 'brihas-col highlight-cell' : ''} key={i}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Non-Scrollable Interactive Glanceable Comparison */}
          <div className="mobile-comp-wrapper">
            <div className="mobile-comp-tabs">
              {['THERAPY', 'JOURNALING', 'GENERAL AI CHAT'].map(tab => (
                <button
                  key={tab}
                  className={`comp-tab-btn ${mobileCompTab === tab ? 'active' : ''}`}
                  onClick={() => setMobileCompTab(tab)}
                >
                  Vs {tab === 'GENERAL AI CHAT' ? 'AI Chat' : tab}
                </button>
              ))}
            </div>

            <div className="mobile-comp-card">
              <div className="comp-card-header">
                <span className="alt-title">{mobileCompTab}</span>
                <span className="brihas-title"><Icon name="check" size={14}/> BRIHAS</span>
              </div>
              <div className="comp-items-list">
                {[
                  ['Remembers across weeks', mobileCompTab === 'THERAPY' ? 'Yes, if you stay' : mobileCompTab === 'JOURNALING' ? 'Only if re-read' : 'No, resets each chat', '✓ Living Continuity'],
                  ['Structured score', mobileCompTab === 'THERAPY' ? 'Rarely' : 'No', '✓ 6D Quotient'],
                  ['Available at 1am', mobileCompTab === 'THERAPY' ? 'No' : 'Yes', '✓ 24/7 Access'],
                  ['Action plan', mobileCompTab === 'THERAPY' ? 'Sometimes' : 'No', '✓ 3 & 7 day Plans'],
                  ['Living Timeline', mobileCompTab === 'THERAPY' ? 'Session notes' : mobileCompTab === 'JOURNALING' ? 'Static pages' : 'Resets each chat', '✓ Evolving Timeline'],
                  ['Maps life beliefs', mobileCompTab === 'THERAPY' ? 'In your head' : 'No', '✓ Personal Life Map']
                ].map(([feature, altVal, brihasVal]) => (
                  <div key={feature} className="comp-item-row">
                    <div className="comp-feature-name">{feature}</div>
                    <div className="comp-side-by-side">
                      <div className="comp-box alt-box"><small>{mobileCompTab === 'GENERAL AI CHAT' ? 'AI Chat' : mobileCompTab}</small><span>{altVal}</span></div>
                      <div className="comp-box brihas-box"><small>Brihas</small><span>{brihasVal}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <motion.section className="section plans" id="plans" {...sectionMotion}>
        <div className="wrap">
          <div className="plans-main-header" style={{ textAlign: 'left', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
            <p className="eyebrow green-eyebrow" style={{ marginBottom: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i></i> PLANS &amp; PRICING</p>
            <h2 className="section-subhead">Start with a trial, then <span style={{ fontStyle: 'italic', color: '#237446', fontWeight: 600 }}>choose your rhythm.</span></h2>
          </div>

          {/* 3 Tier Pricing Cards Grid */}
          <div className="pricing-cards-exact-grid">
            {/* CARD 1: CONVERSE */}
            <div className="pricing-tier-card card-converse card-most-chosen-highlight">
              <div className="tier-card-header">
                <div className="tier-icon-circle icon-green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#237446" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="tier-name">Converse</h3>
                  <p className="tier-tagline">For ongoing self-understanding</p>
                </div>
              </div>

              <div className="tier-stats-bar bar-green" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="stat-box">
                  <strong>600</strong>
                  <span>minutes / cycle</span>
                </div>
                <div className="stat-box">
                  <strong>20 min</strong>
                  <span>a day</span>
                </div>
              </div>

              <ul className="tier-features-list check-green">
                <li><span className="chk">✓</span> <span>Everything in Reflect</span></li>
                <li><span className="chk">✓</span> <span>All 6 dimensions, in full detail</span></li>
                <li><span className="chk">✓</span> <span>Your journey, trend and cohort</span></li>
              </ul>

              <div className="tier-action-bottom">
                <a href="#plans" className="tier-btn btn-outline-green">
                  Sign in to see pricing ➔
                </a>
              </div>
            </div>

            {/* CARD 2: DEPTH */}
            <div className="pricing-tier-card card-depth">
              <div className="tier-card-header">
                <div className="tier-icon-circle icon-green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#237446" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                  </svg>
                </div>
                <div>
                  <h3 className="tier-name">Depth</h3>
                  <p className="tier-tagline">For working through something specific</p>
                </div>
              </div>

              <div className="tier-stats-bar bar-green" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="stat-box">
                  <strong>1,200</strong>
                  <span>minutes / cycle</span>
                </div>
                <div className="stat-box">
                  <strong>20 min</strong>
                  <span>a day</span>
                </div>
              </div>

              <ul className="tier-features-list check-green">
                <li><span className="chk">✓</span> <span>Everything in Converse</span></li>
                <li><span className="chk">✓</span> <span>Personalised 3-day &amp; 7-day plans</span></li>
                <li><span className="chk">✓</span> <span>Mind map: identity, goal, beliefs and more</span></li>
              </ul>

              <div className="tier-action-bottom">
                <a href="#plans" className="tier-btn btn-outline-green">
                  Sign in to see pricing ➔
                </a>
              </div>
            </div>

            {/* CARD 3: TRIAL */}
            <div className="pricing-tier-card card-trial">
              <div className="tier-card-header">
                <div className="tier-icon-circle icon-green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#237446" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20V10"/>
                    <path d="M12 14C14.5 14 17 12.5 17 9.5C14 9.5 12 11.5 12 14Z" fill="#DEF2E6" stroke="#237446"/>
                    <path d="M12 11C9.5 11 7 9.5 7 6.5C10 6.5 12 8.5 12 11Z" fill="#DEF2E6" stroke="#237446"/>
                    <path d="M6 20H18" stroke="#237446" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="tier-name">Trial</h3>
                  <p className="tier-tagline">Test drive your thinking partner</p>
                </div>
              </div>

              <div className="tier-stats-bar bar-green" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="stat-box">
                  <strong>60</strong>
                  <span>minutes / cycle</span>
                </div>
                <div className="stat-box">
                  <strong>20 min</strong>
                  <span>a day</span>
                </div>
              </div>

              <ul className="tier-features-list check-green">
                <li><span className="chk">✓</span> <span>Full 6D Quotient reading</span></li>
                <li><span className="chk">✓</span> <span>Live voice &amp; text reflection</span></li>
                <li><span className="chk">✓</span> <span>Complete session privacy</span></li>
              </ul>

              <div className="tier-action-bottom">
                <a href="#plans" className="tier-btn btn-outline-green">
                  Sign in to see pricing ➔
                </a>
              </div>
            </div>
          </div>

          {/* MORE PLANS: REFLECT */}
          <div className="more-plans-toggle-container" style={{ marginTop: '36px', textAlign: 'center' }}>
            <button 
              onClick={() => setShowReflect(!showReflect)} 
              className="more-plans-pill-button"
            >
              <span>More plans</span> <span style={{ fontSize: '12px', transition: 'transform 0.2s ease' }}>{showReflect ? '▲' : '▼'}</span>
            </button>

            {showReflect && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ marginTop: '28px', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}
              >
                {/* CARD: REFLECT */}
                <div className="pricing-tier-card card-reflect" style={{ border: '2px solid #237446', background: '#FAFDFB' }}>
                  <div className="tier-card-header">
                    <div className="tier-icon-circle icon-green">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#237446" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="tier-name">Reflect</h3>
                      <p className="tier-tagline">Steady, low-key check-ins</p>
                    </div>
                  </div>

                  <div className="tier-stats-bar bar-green" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="stat-box">
                      <strong>300</strong>
                      <span>minutes / cycle</span>
                    </div>
                    <div className="stat-box">
                      <strong>20 min</strong>
                      <span>a day</span>
                    </div>
                  </div>

                  <ul className="tier-features-list check-green">
                    <li><span className="chk">✓</span> <span>Your full Brihas Quotient reading</span></li>
                    <li><span className="chk">✓</span> <span>A glimpse into 2 of your 6 dimensions</span></li>
                    <li><span className="chk">✓</span> <span>Summaries, always saved</span></li>
                  </ul>

                  <div className="tier-action-bottom">
                    <a href="#plans" className="tier-btn btn-outline-green">
                      Sign in to see pricing ➔
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <section className="faq wrap" id="faq">
        <div className="faq-main-header" style={{ textAlign: 'left', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
          <p className="eyebrow green-eyebrow" style={{ marginBottom: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i></i> FAQ</p>
          <h2 className="section-subhead">The questions people ask <span style={{ fontStyle: 'italic', color: '#237446', fontWeight: 600 }}>before they begin.</span></h2>
        </div>
        <div className="faq-list">
          {faqs.map(([q,a],i) => (
            <div className={'faq-item '+(openFaq===i?'open':'')} key={q}>
              <button onClick={() => setOpenFaq(openFaq===i ? -1 : i)}>
                <span>{q}</span>
                <Icon name="plus"/>
              </button>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>

    {/* Footer */}
    <footer>
      <div className="wrap footer-top">
        <a href="#top" style={{ textDecoration: 'none' }}><BrihasLogo size={28} /></a>
        <p>Think clearly. Decide better.<br/>Move forward with confidence.</p>
        <a className="button button-dark" href="#plans">Begin here <Icon name="arrow"/></a>
      </div>
      <div className="wrap footer-bottom">
        <span>© 2025 Brihas.ai™. All rights reserved.</span>
        <div><a href="#privacy">Privacy</a><a href="#">Terms</a><a href="#">Instagram</a></div>
      </div>
    </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App/>);
