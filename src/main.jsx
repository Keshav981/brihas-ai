import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { createRoot } from 'react-dom/client';
import './styles.css';

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
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
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

const ThinkingBrainCharacter = () => (
  <motion.div 
    className="thinking-brain-wrapper"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
  >
    <motion.div 
      className="brain-character-inner"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="170" height="145" viewBox="0 0 280 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="brain-svg">
        {/* Soft Ground Shadow */}
        <ellipse cx="140" cy="210" rx="75" ry="10" fill="#dce6d8" opacity="0.75" />

        {/* Floating Animated Question Marks */}
        <motion.g
          animate={{ y: [0, -4, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M218 52 C218 42, 235 42, 235 52 C235 60, 226 62, 226 70" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="226" cy="80" r="3" fill="#38bdf8" />

          <path d="M232 82 C232 75, 245 75, 245 82 C245 87, 238 89, 238 95" stroke="#1c251d" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="238" cy="102" r="2.5" fill="#1c251d" />
        </motion.g>

        {/* Legs & Feet */}
        <path d="M112 170 L112 195 L102 195" stroke="#1c251d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="100" cy="195" r="4" fill="#1c251d" />

        <path d="M152 170 L152 195 L162 195" stroke="#1c251d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="164" cy="195" r="4" fill="#1c251d" />

        {/* Main Brain Body (Cloud Lobes) */}
        <g filter="drop-shadow(0px 8px 20px rgba(255, 117, 143, 0.25))">
          {/* Base Pink Cloud Shape */}
          <path 
            d="M 60 135 
               C 35 135, 20 115, 30 90 
               C 20 70, 38 45, 65 48 
               C 80 30, 110 25, 130 38 
               C 150 20, 185 22, 202 42 
               C 225 40, 248 58, 245 85 
               C 260 108, 245 138, 222 140 
               C 210 158, 180 168, 155 160 
               C 130 172, 95 168, 78 152 
               C 68 150, 62 142, 60 135 Z" 
            fill="url(#pinkBrainGrad)" 
            stroke="#ff85a1" 
            strokeWidth="3"
          />

          {/* Lobe Details Highlight */}
          <path d="M 68 62 C 60 55, 75 42, 85 52" stroke="#ffa6c1" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8"/>
          <path d="M 195 55 C 210 50, 222 62, 215 72" stroke="#ffa6c1" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8"/>
          <path d="M 120 40 C 135 32, 155 35, 165 45" stroke="#ffa6c1" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8"/>

          {/* SPECULAR SHINE */}
          <ellipse cx="72" cy="72" rx="10" ry="16" fill="#ffffff" opacity="0.65" transform="rotate(-25 72 72)" />
        </g>

        {/* Cheeks Glow */}
        <circle cx="102" cy="122" r="11" fill="#ff477e" opacity="0.85" />
        <circle cx="168" cy="122" r="11" fill="#ff477e" opacity="0.85" />

        {/* Eyes (Blinking Animation) */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
        >
          {/* Left Eye */}
          <circle cx="106" cy="104" r="13" fill="#ffffff" stroke="#1c251d" strokeWidth="3" />
          <circle cx="104" cy="104" r="8" fill="#1c251d" />
          <circle cx="102" cy="100" r="3.5" fill="#ffffff" />

          {/* Right Eye */}
          <circle cx="158" cy="104" r="13" fill="#ffffff" stroke="#1c251d" strokeWidth="3" />
          <circle cx="156" cy="104" r="8" fill="#1c251d" />
          <circle cx="154" cy="100" r="3.5" fill="#ffffff" />
        </motion.g>

        {/* Mouth (Pensive Line) */}
        <path d="M 125 116 L 138 116" stroke="#1c251d" strokeWidth="3.5" strokeLinecap="round" />

        {/* Hand Tapping Chin */}
        <path d="M 116 138 Q 128 128 132 122" stroke="#1c251d" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="132" cy="122" r="3" fill="#1c251d" />

        {/* Left Arm Resting */}
        <path d="M 175 135 Q 185 155 178 165" stroke="#1c251d" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="178" cy="165" r="3.5" fill="#1c251d" />

        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="pinkBrainGrad" x1="40" y1="30" x2="240" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff9ebb" />
            <stop offset="50%" stopColor="#ff758f" />
            <stop offset="100%" stopColor="#ff4d6d" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  </motion.div>
);

const CloudBubble = ({ text, emoji, className, isClarity }) => (
  <div className={`cloud-bubble-wrapper ${className}`}>
    <div className={`cloud-bubble-body ${isClarity ? 'clarity' : ''}`}>
      <span className="cloud-emoji">{emoji}</span>
      <span className="cloud-text">{text}</span>
    </div>
    <div className={`cloud-tail-dot dot-1 ${isClarity ? 'clarity-dot' : ''}`}></div>
    <div className={`cloud-tail-dot dot-2 ${isClarity ? 'clarity-dot' : ''}`}></div>
  </div>
);

const InteractiveHeroBrainMascot = () => {
  const [isClarityMode, setIsClarityMode] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const handleClick = () => {
    setIsClarityMode(!isClarityMode);
    setSparkleKey(prev => prev + 1);
  };

  return (
    <div className="hero-interactive-brain-wrapper">
      {/* Fluffy Animated Cloud Thought Bubbles */}
      <AnimatePresence mode="wait">
        {!isClarityMode ? (
          <motion.div 
            key="confused-thoughts"
            className="thought-bubbles-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <CloudBubble className="t-career" emoji="💼" text="Career?" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >
              <CloudBubble className="t-stress" emoji="⚡" text="Stress?" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            >
              <CloudBubble className="t-relationships" emoji="❤️" text="Relationships?" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
            >
              <CloudBubble className="t-finance" emoji="💸" text="Finance?" />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="clarity-thoughts"
            className="thought-bubbles-container clarity-theme"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <CloudBubble className="t-career" emoji="💡" text="Career & Values Aligned!" isClarity />
            </motion.div>

            <motion.div 
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >
              <CloudBubble className="t-stress" emoji="✨" text="Stress Pattern Solved!" isClarity />
            </motion.div>

            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            >
              <CloudBubble className="t-relationships" emoji="🎯" text="3-Day Action Plan!" isClarity />
            </motion.div>

            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
            >
              <CloudBubble className="t-finance" emoji="🌌" text="Mind Map Connected!" isClarity />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="interactive-big-brain"
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        animate={isClarityMode 
          ? { scale: [1, 1.15, 0.95, 1.05, 1], rotate: [-5, 5, -3, 3, 0] } 
          : { y: [0, -8, 0] }
        }
        transition={isClarityMode 
          ? { duration: 0.6, type: "spring", stiffness: 200 } 
          : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <svg width="360" height="300" viewBox="0 0 280 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="big-brain-svg">
          {/* Soft Ground Shadow */}
          <ellipse cx="140" cy="214" rx="90" ry="14" fill="#d0ded0" opacity="0.75" />

          {/* Floating Question Marks (Confused) vs Lightbulb / Stars (Clarity) */}
          {/* Legs & Feet */}
          <path d="M110 172 L110 198 L98 198" stroke="#1c251d" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="96" cy="198" r="4.5" fill="#1c251d" />

          <path d="M154 172 L154 198 L166 198" stroke="#1c251d" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="168" cy="198" r="4.5" fill="#1c251d" />

          {/* Main Brain Body */}
          <g filter="drop-shadow(0px 12px 28px rgba(255, 77, 109, 0.32))">
            <path 
              d="M 60 135 
                 C 35 135, 20 115, 30 90 
                 C 20 70, 38 45, 65 48 
                 C 80 30, 110 25, 130 38 
                 C 150 20, 185 22, 202 42 
                 C 225 40, 248 58, 245 85 
                 C 260 108, 245 138, 222 140 
                 C 210 158, 180 168, 155 160 
                 C 130 172, 95 168, 78 152 
                 C 68 150, 62 142, 60 135 Z" 
              fill={isClarityMode ? "url(#pinkBrainGradClarity)" : "url(#pinkBrainGradLarge)"}
              stroke="#ff85a1" 
              strokeWidth="3.5"
            />

            <path d="M 68 62 C 60 55, 75 42, 85 52" stroke="#ffa6c1" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.85"/>
            <path d="M 195 55 C 210 50, 222 62, 215 72" stroke="#ffa6c1" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.85"/>
            <path d="M 120 40 C 135 32, 155 35, 165 45" stroke="#ffa6c1" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.85"/>

            <ellipse cx="72" cy="72" rx="11" ry="17" fill="#ffffff" opacity="0.65" transform="rotate(-25 72 72)" />
          </g>

          {/* Floating Question Marks (Confused) vs Lightbulb / Stars (Clarity) - RENDERED ON TOP OF BRAIN */}
          {!isClarityMode ? (
            <motion.g
              animate={{ y: [0, -8, 0], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Primary Cyan Floating Question Mark ? */}
              <g filter="drop-shadow(0px 4px 10px rgba(56, 189, 248, 0.5))">
                <path d="M222 28 C222 14, 244 14, 244 28 C244 38, 232 40, 232 50" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="232" cy="62" r="4" fill="#0284c7" />
              </g>

              {/* Secondary Dark Floating Question Mark ? */}
              <g filter="drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.15))">
                <path d="M246 58 C246 50, 260 50, 260 58 C260 64, 253 66, 253 72" stroke="#1c251d" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                <circle cx="253" cy="80" r="3" fill="#1c251d" />
              </g>
            </motion.g>
          ) : (
            <motion.g
              animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Lightbulb Spark */}
              <g filter="drop-shadow(0px 6px 14px rgba(250, 204, 21, 0.6))">
                <circle cx="235" cy="40" r="16" fill="#facc15" />
                <path d="M235 18 L235 10 M255 40 L263 40 M220 25 L213 18 M250 25 L257 18" stroke="#facc15" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            </motion.g>
          )}

          {/* Cheeks Glow */}
          <circle cx="100" cy="124" r={isClarityMode ? "14" : "12"} fill="#ff477e" opacity={isClarityMode ? "1" : "0.85"} />
          <circle cx="170" cy="124" r={isClarityMode ? "14" : "12"} fill="#ff477e" opacity={isClarityMode ? "1" : "0.85"} />

          {/* Eyes (Confused vs Happy Sparkly Eyes) */}
          {!isClarityMode ? (
            <motion.g
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.88, 0.92, 0.96, 1] }}
            >
              {/* Left Eye */}
              <circle cx="106" cy="104" r="14" fill="#ffffff" stroke="#1c251d" strokeWidth="3.5" />
              <circle cx="106" cy="99" r="8.5" fill="#1c251d" />
              <circle cx="104" cy="95" r="4" fill="#ffffff" />

              {/* Right Eye */}
              <circle cx="158" cy="104" r="14" fill="#ffffff" stroke="#1c251d" strokeWidth="3.5" />
              <circle cx="158" cy="99" r="8.5" fill="#1c251d" />
              <circle cx="156" cy="95" r="4" fill="#ffffff" />
            </motion.g>
          ) : (
            <motion.g initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              {/* Happy Arcs Eyes */}
              <path d="M 94 106 Q 106 90 118 106" stroke="#1c251d" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M 146 106 Q 158 90 170 106" stroke="#1c251d" strokeWidth="5" strokeLinecap="round" fill="none" />
            </motion.g>
          )}

          {/* Mouth (Flat Pensive vs Big Joyful Smile) */}
          {!isClarityMode ? (
            <path d="M 124 116 L 140 116" stroke="#1c251d" strokeWidth="4" strokeLinecap="round" />
          ) : (
            <path d="M 122 114 Q 132 128 142 114" stroke="#1c251d" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          )}

          {/* Arms Pose */}
          <path d="M 114 140 Q 128 128 132 122" stroke="#1c251d" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="132" cy="122" r="3.5" fill="#1c251d" />

          <path d="M 176 135 Q 188 155 180 166" stroke="#1c251d" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="180" cy="166" r="4" fill="#1c251d" />

          <defs>
            <linearGradient id="pinkBrainGradLarge" x1="40" y1="30" x2="240" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff9ebb" />
              <stop offset="50%" stopColor="#ff758f" />
              <stop offset="100%" stopColor="#ff4d6d" />
            </linearGradient>
            <linearGradient id="pinkBrainGradClarity" x1="40" y1="30" x2="240" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffb3c6" />
              <stop offset="50%" stopColor="#ff85a1" />
              <stop offset="100%" stopColor="#ff477e" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      <motion.button 
        className={`interactive-brain-pill ${isClarityMode ? 'active-clarity' : ''}`}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>{isClarityMode ? '✨ Clarity Spark Unlocked! (Click to reset)' : '👆 Tap Brihas to connect thoughts!'}</span>
      </motion.button>
    </div>
  );
};

const HeroLifeNavigationMap = () => {
  const [activeId, setActiveId] = useState('rel');
  const [isHovered, setIsHovered] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pulseWaveKey, setPulseWaveKey] = useState(0);

  const inputs = [
    {
      id: 'rel',
      label: 'Relationships',
      sub: 'Build meaningful connections',
      bgCircle: '#E2ECE4',
      iconColor: '#3A6B46',
      glowColor: 'rgba(58, 107, 70, 0.25)',
      outcomeId: 'out-identity',
      outcomeLabel: 'Identity',
      insight: 'When core relationships align, identity clarifies without needing external validation.',
      metricBoost: '+14 pts · 98% Coherence',
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'car',
      label: 'Career',
      sub: 'Find purpose and grow with direction',
      bgCircle: '#F7EFE5',
      iconColor: '#A26B36',
      glowColor: 'rgba(162, 107, 54, 0.25)',
      outcomeId: 'out-clarity',
      outcomeLabel: 'Clarity',
      insight: 'Purposeful career trade-offs eliminate second-guessing and illuminate what truly matters.',
      metricBoost: '+18 pts · 94% Focus',
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    },
    {
      id: 'fin',
      label: 'Finance',
      sub: 'Make smart choices for a secure future',
      bgCircle: '#E1F1ED',
      iconColor: '#2B7365',
      glowColor: 'rgba(43, 115, 101, 0.25)',
      outcomeId: 'out-balance',
      outcomeLabel: 'Balance',
      insight: 'Financial security grounds daily choices, creating harmony across all life priorities.',
      metricBoost: '+15 pts · 96% Stability',
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12" />
          <path d="M6 8h12" />
          <path d="M6 13h7a4 4 0 0 1 0 8H6" />
          <path d="M6 3v18" />
        </svg>
      )
    },
    {
      id: 'hea',
      label: 'Health',
      sub: 'Take care of your body and mind',
      bgCircle: '#F9EAE7',
      iconColor: '#B85648',
      glowColor: 'rgba(184, 86, 72, 0.25)',
      outcomeId: 'out-energy',
      outcomeLabel: 'Energy',
      insight: 'Restorative somatic rest reduces mental overwhelm and unlocks sustained daily energy.',
      metricBoost: '+22 pts · Optimal Flow',
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      )
    },
    {
      id: 'gro',
      label: 'Personal Growth',
      sub: 'Keep evolving into your best self',
      bgCircle: '#ECEEEF',
      iconColor: '#575B66',
      glowColor: 'rgba(87, 91, 102, 0.25)',
      outcomeId: 'out-confidence',
      outcomeLabel: 'Confidence',
      insight: 'Continuous self-reflection turns hesitation into decisive, confident forward action.',
      metricBoost: '+19 pts · 100% Clear',
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    }
  ];

  const outcomes = [
    {
      id: 'out-identity',
      label: 'Identity',
      sub: 'Know who you are at your core',
      bgCircle: '#E2ECE4',
      iconColor: '#3A6B46',
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12c-2.7 0-4.8 2.1-4.8 4.8 0 1.9 1 3.5 2.5 4.3" />
          <path d="M12 7c-4.4 0-8 3.6-8 8 0 2.3.9 4.4 2.4 5.9" />
          <path d="M12 2a13 13 0 0 0-13 13c0 3.3 1.2 6.3 3.3 8.7" />
          <path d="M12 2c7.2 0 13 5.8 13 13 0 3.3-1.2 6.3-3.3 8.7" />
        </svg>
      )
    },
    {
      id: 'out-clarity',
      label: 'Clarity',
      sub: 'See what truly matters',
      bgCircle: '#F7EFE5',
      iconColor: '#A26B36',
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    },
    {
      id: 'out-balance',
      label: 'Balance',
      sub: 'Create harmony in every area of life',
      bgCircle: '#E1F1ED',
      iconColor: '#2B7365',
      hasOrangeDot: true,
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      )
    },
    {
      id: 'out-energy',
      label: 'Energy',
      sub: 'Reduce overwhelm. Increase focus.',
      bgCircle: '#F9EAE7',
      iconColor: '#B85648',
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      )
    },
    {
      id: 'out-confidence',
      label: 'Confidence',
      sub: 'Make better decisions. Move forward.',
      bgCircle: '#ECEEEF',
      iconColor: '#575B66',
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    }
  ];

  // Soft Web Audio Haptic Synth Ping
  const playNodeChime = (freq = 432) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Ignore audio context error
    }
  };

  const handleSelectNode = (id, freq) => {
    setActiveId(id);
    setPulseWaveKey(prev => prev + 1);
    playNodeChime(freq);
  };

  // Auto-cycle through items
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveId(current => {
        const idx = inputs.findIndex(d => d.id === current);
        const nextIdx = (idx + 1) % inputs.length;
        return inputs[nextIdx].id;
      });
    }, 3600);
    return () => clearInterval(interval);
  }, [isHovered]);

  const activeIdx = inputs.findIndex(d => d.id === activeId);
  const activeInput = inputs[activeIdx] || inputs[0];
  const activeColor = activeInput.iconColor;

  return (
    <motion.div
      className="hero-life-nav-map-card-2026"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #FAF8F5 60%, #F5F2EC 100%)',
        border: '1px solid rgba(232, 227, 217, 0.9)',
        borderRadius: '32px',
        padding: '30px 24px 22px',
        boxShadow: '0 30px 70px -15px rgba(28, 37, 29, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)'
      }}
    >
      {/* Dynamic Pulsing Ambient Aura */}
      <div
        style={{
          position: 'absolute',
          top: '-25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85%',
          height: '85%',
          background: `radial-gradient(ellipse at top, ${activeInput.glowColor} 0%, transparent 70%)`,
          pointerEvents: 'none',
          transition: 'background 0.8s ease'
        }}
      />

      {/* Simple live-map status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: activeColor, opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            <span style={{ position: 'relative', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activeColor }} />
          </span>
          <span style={{ fontSize: '10.5px', fontFamily: "'DM Mono', monospace", fontWeight: 600, color: '#6E786F', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            LIFE NAVIGATION MAP
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#6E786F' }}>Tap an area to explore</span>
      </div>

      {/* Header Title — "Your Life Navigation Map" */}
      <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative', zIndex: 2 }}>
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(23px, 2.3vw, 29px)',
            fontWeight: 400,
            color: '#1C251D',
            margin: 0,
            letterSpacing: '-0.02em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          Your Life Navigation
          <span style={{ position: 'relative', display: 'inline-block', marginLeft: '3px' }}>
            Map
            <span
              style={{
                position: 'absolute',
                top: '-6px',
                right: '3px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#3A6B46',
                boxShadow: '0 0 10px rgba(58, 107, 70, 0.8)'
              }}
            />
          </span>
        </h3>
      </div>

      {/* Main Diagram Grid: Left Brackets + Left Inputs | Center Spine | Right Outcome Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 48px 1fr',
          gap: '8px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* LEFT SECTION: Connected Organic SVG Brackets + 5 Input Domain Cards */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Organic Connected SVG Brackets */}
          <div
            style={{
              width: "14px",
              height: "350px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <svg width="14" height="350" viewBox="0 0 14 350" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 11 22 C 2 22, 2 52, 11 82 
                   M 11 94 C 2 94, 2 124, 11 154 
                   M 11 166 C 2 166, 2 196, 11 226 
                   M 11 238 C 2 238, 2 268, 11 298"
                stroke="#3A6B46"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
          </div>

          {/* 5 Input Domain Rows */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            {inputs.map((item, idx) => {
              const isActive = activeId === item.id;
              const freqs = [432, 528, 639, 741, 852];
              return (
                <motion.div
                  key={item.id}
                  onClick={() => handleSelectNode(item.id, freqs[idx])}
                  onMouseEnter={() => handleSelectNode(item.id, freqs[idx])}
                  whileHover={{ x: 4 }}
                  animate={{
                    backgroundColor: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.65)",
                    boxShadow: isActive
                      ? `0 10px 24px -4px ${item.glowColor}, 0 0 0 1.8px ${item.iconColor}`
                      : "0 2px 8px rgba(0,0,0,0.02)"
                  }}
                  transition={{ duration: 0.25 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 11px",
                    borderRadius: "16px",
                    border: `1px solid ${isActive ? item.iconColor : 'rgba(232, 227, 217, 0.8)'}`,
                    cursor: "pointer"
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: item.bgCircle,
                      color: item.iconColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "10px",
                      flexShrink: 0,
                      transform: isActive ? "scale(1.12)" : "scale(1)",
                      transition: "transform 0.25s ease",
                      boxShadow: isActive ? `0 0 14px ${item.glowColor}` : "none"
                    }}
                  >
                    {item.iconSvg}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "13.5px",
                        fontWeight: 600,
                        color: isActive ? item.iconColor : "#1C251D",
                        lineHeight: "1.2"
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6E786F",
                        marginTop: "1.5px",
                        lineHeight: "1.3",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {item.sub}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CENTER SECTION: Organic Living Spine Trunk SVG with Animated Flowing Particle Rays */}
        <div
          style={{
            position: "relative",
            height: "350px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <svg
            width="48"
            height="350"
            viewBox="0 0 48 350"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "100%" }}
          >
            {/* Main Hand-drawn Central Trunk Line */}
            <path
              d="M 24 10 C 24 75, 23 155, 24 235 C 24 285, 24 310, 24 322 M 24 322 L 18 338 M 24 322 L 30 338"
              stroke="#2C2723"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* 5 Horizontal Branch Lines with End Dots & Laser Particle Effect */}
            {[
              { y: 36, leftX: 2, rightX: 46 },
              { y: 106, leftX: 2, rightX: 46 },
              { y: 176, leftX: 2, rightX: 46 },
              { y: 246, leftX: 2, rightX: 46 },
              { y: 316, leftX: 2, rightX: 46 }
            ].map((branch, i) => {
              const isActiveRow = activeIdx === i;
              const rowColor = inputs[i].iconColor;
              return (
                <g key={i}>
                  <line
                    x1={branch.leftX}
                    y1={branch.y}
                    x2="24"
                    y2={branch.y}
                    stroke={isActiveRow ? rowColor : "#2C2723"}
                    strokeWidth={isActiveRow ? "2.6" : "1.5"}
                    opacity={isActiveRow ? 1 : 0.4}
                  />
                  <circle
                    cx={branch.leftX}
                    cy={branch.y}
                    r={isActiveRow ? "4.5" : "3"}
                    fill={isActiveRow ? rowColor : "#1C251D"}
                  />
                  <line
                    x1="24"
                    y1={branch.y}
                    x2={branch.rightX}
                    y2={branch.y}
                    stroke={isActiveRow ? rowColor : "#2C2723"}
                    strokeWidth={isActiveRow ? "2.6" : "1.5"}
                    opacity={isActiveRow ? 1 : 0.4}
                  />
                  <circle
                    cx={branch.rightX}
                    cy={branch.y}
                    r={isActiveRow ? "4.5" : "3"}
                    fill={isActiveRow ? rowColor : "#1C251D"}
                  />
                  <circle
                    cx="24"
                    cy={branch.y}
                    r={isActiveRow ? "6" : "3.5"}
                    fill={isActiveRow ? rowColor : "#1C251D"}
                    stroke={isActiveRow ? "#FFFFFF" : "none"}
                    strokeWidth="1.8"
                  />

                  {/* Flowing Laser Particle when row is active */}
                  {isActiveRow && (
                    <motion.circle
                      key={`laser-${pulseWaveKey}-${i}`}
                      cx={branch.leftX}
                      cy={branch.y}
                      r="4"
                      fill="#FFFFFF"
                      animate={{ cx: [branch.leftX, branch.rightX] }}
                      transition={{ duration: 0.65, ease: "easeInOut" }}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* RIGHT SECTION: 5 Transformation Outcome Cards */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          {outcomes.map((card, idx) => {
            const isMatch = activeIdx === idx;
            const rowColor = inputs[idx].iconColor;
            return (
              <motion.div
                key={card.id}
                onClick={() => handleSelectNode(inputs[idx].id, 500 + idx * 80)}
                animate={{
                  scale: isMatch ? 1.025 : 1,
                  boxShadow: isMatch
                    ? `0 10px 24px -4px ${inputs[idx].glowColor}, 0 0 0 1.8px ${rowColor}`
                    : "0 2px 8px rgba(0,0,0,0.02)"
                }}
                transition={{ duration: 0.25 }}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  padding: "9px 12px",
                  borderRadius: "16px",
                  backgroundColor: isMatch ? "#FFFFFF" : "#F9F8F3",
                  border: `1px solid ${isMatch ? rowColor : "rgba(232, 227, 217, 0.8)"}`,
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: card.bgCircle,
                    color: card.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "10px",
                    flexShrink: 0,
                    transform: isMatch ? "scale(1.12)" : "scale(1)",
                    transition: "transform 0.25s ease",
                    boxShadow: isMatch ? `0 0 12px ${inputs[idx].glowColor}` : "none"
                  }}
                >
                  {card.iconSvg}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: isMatch ? rowColor : "#1C251D",
                      lineHeight: "1.2"
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6E786F",
                      marginTop: "1.5px",
                      lineHeight: "1.3",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {card.sub}
                  </div>
                </div>

                {/* Orange Dot Indicator on Balance Card with Pulsing Aura */}
                {card.hasOrangeDot && (
                  <div
                    style={{
                      position: "absolute",
                      right: "-14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#E07A5F",
                      boxShadow: "0 0 10px rgba(224, 122, 95, 0.7)"
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC INTERACTIVE INSIGHT DRAWER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeInput.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          style={{
            marginTop: '22px',
            padding: '14px 18px',
            borderRadius: '18px',
            backgroundColor: `${activeColor}0F`,
            border: `1px solid ${activeColor}35`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            zIndex: 2
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <span style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", fontWeight: 600, color: activeColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⚡ Pattern Unlocked: {activeInput.label} ➔ {activeInput.outcomeLabel}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#3B473B', lineHeight: '1.45', fontStyle: 'italic' }}>
              "{activeInput.insight}"
            </p>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontFamily: "'DM Mono', monospace",
              fontWeight: 600,
              color: activeColor,
              backgroundColor: '#FFFFFF',
              border: `1px solid ${activeColor}40`,
              padding: '4px 12px',
              borderRadius: '100px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            {activeInput.metricBoost}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Tagline — "One map. Many areas. Better decisions. A better you." */}
      <div style={{ textAlign: "center", marginTop: "22px", position: "relative", zIndex: 2 }}>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(14px, 1.3vw, 16.5px)",
            fontWeight: 500,
            color: "#1C251D",
            margin: 0,
            display: "inline-block",
            letterSpacing: "-0.01em"
          }}
        >
          One map. Many areas. Better decisions. A better{" "}
          <span style={{ position: "relative", display: "inline-block" }}>
            you.
            <svg
              width="36"
              height="8"
              viewBox="0 0 36 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: "absolute",
                bottom: "-5px",
                left: "0",
                width: "100%"
              }}
            >
              <path
                d="M 2 5 Q 9 1, 18 5 T 34 5"
                stroke="#3A6B46"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
        </p>
      </div>
    </motion.div>
  );
};

const SimpleLifeNavigationMap = () => {
  const areas = [
    ['Relationships', 'People who matter', 'users', 'sage'],
    ['Career', 'Work and direction', 'target', 'sand'],
    ['Money', 'Choices for your future', 'check', 'mint'],
    ['Health', 'Body and mind', 'heart', 'rose'],
    ['Growth', 'Becoming more you', 'spark', 'blue'],
  ];
  const outcomes = [
    ['Identity', 'Know yourself', 'identity'],
    ['Clarity', 'See what matters', 'clarity'],
    ['Balance', 'Feel more steady', 'balance'],
    ['Energy', 'Make room to breathe', 'energy'],
    ['Confidence', 'Move forward', 'confidence'],
  ];

  return (
    <div className="simple-life-map">
      <div className="map-heading"><span></span>Your Life Navigation Map</div>
      <p className="map-kicker">The parts of your life connect. Brihas helps you see how.</p>
      <div className="simple-map-grid">
        <div className="map-column map-areas">
          {areas.map(([title, text, icon, tone]) => (
            <div className="map-row" key={title}>
              <div className={`map-icon ${tone}`}><Icon name={icon} size={18}/></div>
              <div><b>{title}</b><small>{text}</small></div>
            </div>
          ))}
        </div>
        <div className="map-spine" aria-hidden="true">
          {[0,1,2,3,4].map(i => <i key={i} style={{ top: `${10 + i * 20}%` }}></i>)}
        </div>
        <div className="map-column map-outcomes">
          {outcomes.map(([title, text, tone]) => (
            <div className={`outcome-card ${tone}`} key={title}>
              <b>{title}</b><small>{text}</small>
            </div>
          ))}
        </div>
      </div>
      <p className="map-footer">One map. Your whole life. Better decisions.</p>
    </div>
  );
};

const LifeMapNavigationVisual = () => {
  const [activeNode, setActiveNode] = useState('Career');

  const nodes = [
    { id: 'Finance', label: 'Finance', x: 26, y: 28, insight: "Financial security grounds daily choices and creates overall stability." },
    { id: 'Career', label: 'Career', x: 38, y: 36, insight: "You're not stuck. You're holding two true things." },
    { id: 'Growth', label: 'Growth', x: 24, y: 55, insight: "Evolving into your best self through intentional choices." },
    { id: 'Relationships', label: 'Relationships', x: 40, y: 72, insight: "Core relationships clarify identity without needing external validation." },
    { id: 'Health', label: 'Health', x: 60, y: 66, insight: "Somatic rest and mindfulness reduce daily cognitive depletion." },
    { id: 'Identity', label: 'Identity', x: 61, y: 44, insight: "Knowing who you are at your core when external noise drops away." },
  ];

  const currentNode = nodes.find(n => n.id === activeNode) || nodes[1];

  return (
    <motion.div 
      className="hero-lifemap-visual-container"
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background Scenic Environment with Organic Light Overlay */}
      <div className="lifemap-bg-landscape">
        <div className="landscape-gradient-overlay" />
        {/* Soft Organic Orbit Rays */}
        <svg className="landscape-orbit-svg" viewBox="0 0 500 460" fill="none">
          <ellipse cx="250" cy="230" rx="280" ry="170" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" transform="rotate(-15 250 230)" />
          <ellipse cx="250" cy="230" rx="220" ry="240" stroke="rgba(200,239,100,0.18)" strokeWidth="1" transform="rotate(35 250 230)" />
          <path d="M-50 120 C 150 220, 350 100, 550 300" stroke="rgba(163,230,53,0.3)" strokeWidth="1.8" fill="none" />
        </svg>
      </div>

      {/* Main Glassmorphic White Card */}
      <div className="lifemap-white-card">
        {/* Header Row */}
        <div className="lifemap-card-header">
          <span className="lifemap-card-title">YOUR LIFE MAP</span>
          <div className="lifemap-card-dots">
            <span></span><span></span><span></span>
          </div>
        </div>

        {/* Interactive Mind Nodes Canvas */}
        <div className="lifemap-nodes-canvas">
          {/* SVG Connecting Lines from YOU (center: 48%, 48%) to each node */}
          <svg className="nodes-lines-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {nodes.map(n => {
              const isActive = activeNode === n.id;
              return (
                <g key={n.id}>
                  <line 
                    x1="48" 
                    y1="48" 
                    x2={n.x} 
                    y2={n.y} 
                    stroke={isActive ? "#3A6B46" : "#A3C2A9"} 
                    strokeWidth={isActive ? "2.2" : "1.4"} 
                    opacity={isActive ? 1 : 0.65}
                  />
                </g>
              );
            })}
          </svg>

          {/* Central Black Node: "YOU" */}
          <motion.div 
            className="center-you-node"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>YOU</span>
          </motion.div>

          {/* 6 Radiating Node Badges */}
          {nodes.map(n => {
            const isActive = activeNode === n.id;
            return (
              <motion.button
                key={n.id}
                className={`lifemap-node-badge ${isActive ? 'active' : ''}`}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                onClick={() => setActiveNode(n.id)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                animate={{
                  y: [0, -3, 0],
                }}
                transition={{
                  y: { duration: 3 + (n.x % 3), repeat: Infinity, ease: 'easeInOut' }
                }}
              >
                {n.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Floating Top Right: Compass Navigator Widget */}
      <motion.div 
        className="lifemap-compass-widget"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="compass-dial-wrapper">
          <div className="compass-aura-glow" />
          <svg className="compass-svg" viewBox="0 0 80 80" fill="none">
            {/* Outer Ring */}
            <circle cx="40" cy="40" r="36" fill="#1C251D" stroke="#A3E635" strokeWidth="2.5" />
            <circle cx="40" cy="40" r="30" fill="#1C251D" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            
            {/* Compass Marks N, E, S, W */}
            <text x="40" y="19" fill="#FFFFFF" fontSize="9" fontWeight="700" textAnchor="middle">N</text>
            <text x="63" y="43" fill="#FFFFFF" fontSize="8" fontWeight="600" textAnchor="middle">E</text>
            <text x="40" y="66" fill="#FFFFFF" fontSize="8" fontWeight="600" textAnchor="middle">S</text>
            <text x="17" y="43" fill="#FFFFFF" fontSize="8" fontWeight="600" textAnchor="middle">W</text>
            
            {/* Compass Center Pivot Point */}
            <circle cx="40" cy="40" r="3.5" fill="#C8EF64" />

            {/* Needle Pointing NW */}
            <g transform="rotate(-45 40 40)">
              <polygon points="40,16 43,40 37,40" fill="#C8EF64" />
              <polygon points="40,64 43,40 37,40" fill="#4B5563" />
            </g>
          </svg>
        </div>

        <div className="compass-label-badge">
          <span className="compass-tag">COMPASS NAVIGATOR</span>
          <span className="compass-direction">NW · Aligned Direction</span>
        </div>
      </motion.div>

      {/* Floating Bottom Right: Today's Insight Card */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentNode.id}
          className="lifemap-insight-card"
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.35 }}
        >
          <div className="insight-card-header">
            <span className="insight-green-dot" />
            <span className="insight-tag">Today's insight</span>
          </div>
          <p className="insight-text">
            {currentNode.insight}
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

const InteractiveLifeNavigationCard = () => {
  const [activeRow, setActiveRow] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const rows = [
    {
      left: { title: 'Relationships', sub: 'Build meaningful connections.', icon: 'users', bg: '#D5E7DB', color: '#2D6043' },
      right: { title: 'Identity', sub: 'Know who you are at your core.', icon: 'brain', bg: '#D5E7DB', color: '#2D6043' }
    },
    {
      left: { title: 'Career', sub: 'Find purpose and grow with direction.', icon: 'target', bg: '#F5EDE4', color: '#9C6D3B' },
      right: { title: 'Clarity', sub: 'See what truly matters next.', icon: 'spark', bg: '#F5EDE4', color: '#9C6D3B' }
    },
    {
      left: { title: 'Finance', sub: 'Make smart choices for a secure future.', icon: 'check', bg: '#E0EFEF', color: '#347668' },
      right: { title: 'Balance', sub: 'Create harmony in every area of life.', icon: 'heart', bg: '#E0EFEF', color: '#347668' }
    },
    {
      left: { title: 'Health', sub: 'Take care of your body and mind.', icon: 'heart', bg: '#F9E8E4', color: '#B85648' },
      right: { title: 'Energy', sub: 'Reduce overwhelm. Increase focus.', icon: 'activity', bg: '#F9E8E4', color: '#B85648' }
    },
    {
      left: { title: 'Personal Growth', sub: 'Keep evolving into your best self.', icon: 'spark', bg: '#E4EEE6', color: '#576359' },
      right: { title: 'Confidence', sub: 'Make better decisions. Move forward.', icon: 'compass', bg: '#E4EEE6', color: '#576359' }
    }
  ];

  // Auto-cycle through rows when not hovering
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveRow(prev => (prev + 1) % rows.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isHovered]);

  // Subtle 3D tilt tracking mouse
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      rotateX: -y / 30,
      rotateY: x / 30
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div style={{ perspective: 1000, width: '100%' }}>
      <motion.div
        className="mock-lifemap-card"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          scale: isHovered ? 1.015 : 1
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Right Border Orange Glowing Dot */}
        <span className="mock-card-orange-dot" />

        {/* Top Header Row */}
        <div className="mock-card-header">
          <div>
            <span className="mock-card-eyebrow">YOUR LIFE NAVIGATION MAP</span>
            <h3 className="mock-card-heading">See the whole picture.</h3>
          </div>
          <div className="mock-card-compass-icon" title="Life Navigator">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#E07A5F" opacity="0.3" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </div>
        </div>

        {/* 5 Rows Grid (Left Domain Card | Connecting Line | Right Outcome Card) */}
        <div className="mock-card-rows-container">
          {rows.map((row, index) => {
            const isActive = activeRow === index;
            return (
              <div 
                key={row.left.title} 
                className="mock-row-grid"
                onMouseEnter={() => setActiveRow(index)}
              >
                {/* Left Domain Card */}
                <motion.div 
                  className={`mock-domain-card ${isActive ? 'active-orange' : ''}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="mock-card-icon" style={{ backgroundColor: row.left.bg, color: row.left.color }}>
                    <Icon name={row.left.icon} size={16} />
                  </div>
                  <div>
                    <h4 className="mock-card-title" style={{ color: isActive ? '#2D6043' : '#1C251D' }}>
                      {row.left.title}
                    </h4>
                    <p className="mock-card-sub">{row.left.sub}</p>
                  </div>
                </motion.div>

                {/* Center Connector Spine */}
                <div className="mock-connector-spine">
                  {isActive ? (
                    <motion.div 
                      className="dashed-orange-line"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : (
                    <div className="grey-solid-line" />
                  )}
                </div>

                {/* Right Outcome Card */}
                <motion.div 
                  className={`mock-outcome-card ${isActive ? 'active-orange' : ''}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="mock-card-icon" style={{ backgroundColor: row.right.bg, color: row.right.color }}>
                    <Icon name={row.right.icon} size={16} />
                  </div>
                  <div>
                    <h4 className="mock-card-title" style={{ color: isActive ? '#2D6043' : '#1C251D' }}>
                      {row.right.title}
                    </h4>
                    <p className="mock-card-sub">{row.right.sub}</p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

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
      desc: 'A 3-day try or a 7-day shift sized to your moment. Clear, practical steps — never generic advice or homework.',
      icon: '⚡',
      tag: '3 & 7-Day Action Shifts',
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
        <div className="how-mock-header" style={{ textAlign: 'center', marginBottom: '44px' }}>
          <p className="eyebrow green-eyebrow" style={{ marginBottom: '10px' }}>HOW IT WORKS</p>
          <h2 style={{ fontSize: 'clamp(32px, 3.8vw, 54px)', letterSpacing: '-2px', fontWeight: 700, margin: '0 0 14px', color: '#1C251D' }}>
            One conversation a day. <em style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#2B7858' }}>A reading of your life.</em>
          </h2>
          <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '16.5px', lineHeight: 1.55, color: '#576359' }}>
            No rigid forms. No homework. Just an intelligent, quiet companion that listens, connects patterns, and guides your daily decisions.
          </p>
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
                <span className="how-tag-pill" style={{ color: s.accentColor, backgroundColor: '#FFFFFF', borderColor: s.accentColor + '40' }}>
                  {s.tag}
                </span>
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

const pebbleWordsAbsolute = [
  // Top Row
  { text: 'Stress', left: '30%', top: '23%', fontSize: '18px', weight: 500, color: '#65606E' },
  { text: 'Anxiety', left: '41%', top: '23%', fontSize: '18px', weight: 500, color: '#5F5D6B' },
  { text: 'Self doubt', left: '52%', top: '23%', fontSize: '23px', weight: 600, color: '#545A57' },
  { text: 'Feeling stuck', left: '66%', top: '23%', fontSize: '19px', weight: 500, color: '#5E665D' },

  // Upper Mid
  { text: 'Pressure', left: '26%', top: '29%', fontSize: '17px', weight: 500, color: '#685E6E' },
  { text: 'Overthinking', left: '46%', top: '30%', fontSize: '42px', weight: 800, color: '#5C4A68' },
  { text: 'Motivation', left: '51%', top: '36%', fontSize: '15px', weight: 400, color: '#7D7569' },
  { text: 'Career', left: '68%', top: '30%', fontSize: '36px', weight: 800, color: '#44634B' },
  { text: 'Future', left: '74%', top: '37%', fontSize: '23px', weight: 600, color: '#6A587A' },

  // Center Core
  { text: 'Boundaries', left: '23%', top: '35%', fontSize: '17px', weight: 500, color: '#686B60' },
  { text: 'Purpose', left: '31%', top: '41%', fontSize: '30px', weight: 700, color: '#5B6858' },
  { text: 'Burnout', left: '50%', top: '41%', fontSize: '52px', weight: 900, color: '#2E4034' },
  { text: 'Health', left: '69%', top: '43%', fontSize: '24px', weight: 600, color: '#586259' },
  { text: 'Confidence', left: '72%', top: '49%', fontSize: '23px', weight: 600, color: '#5A6158' },

  // Mid Center
  { text: 'Bullying', left: '21%', top: '46%', fontSize: '22px', weight: 600, color: '#7B4E59' },
  { text: 'Money', left: '33%', top: '49%', fontSize: '32px', weight: 700, color: '#78604B' },
  { text: 'What next?', left: '43%', top: '46%', fontSize: '15px', weight: 400, color: '#70675C' },
  { text: 'Big decisions', left: '53%', top: '49%', fontSize: '29px', weight: 700, color: '#596053' },
  { text: 'Growth', left: '67%', top: '55%', fontSize: '23px', weight: 600, color: '#5B6E5F' },

  // Lower Mid
  { text: 'Communication', left: '22%', top: '53%', fontSize: '16px', weight: 400, color: '#7A6458' },
  { text: 'Conflict', left: '24%', top: '59%', fontSize: '16px', weight: 400, color: '#826569' },
  { text: 'Identity', left: '48%', top: '56%', fontSize: '27px', weight: 700, color: '#5C4F6B' },
  { text: 'Clarity', left: '65%', top: '62%', fontSize: '48px', weight: 900, color: '#274C3A' },

  // Bottom Center Focal
  { text: 'Relationships', left: '44%', top: '63%', fontSize: '38px', weight: 800, color: '#7D4D59' },

  // Bottom Rows & Supporting
  { text: 'Family', left: '26%', top: '65%', fontSize: '16px', weight: 400, color: '#70645A' },
  { text: 'Breakup', left: '32%', top: '69%', fontSize: '15px', weight: 400, color: '#856165' },
  { text: 'Work pressure', left: '45%', top: '69%', fontSize: '16px', weight: 500, color: '#665F5C' },
  { text: 'Work life balance', left: '57%', top: '69%', fontSize: '16px', weight: 500, color: '#5B665C' },
  { text: 'Starting over', left: '71%', top: '68%', fontSize: '15px', weight: 400, color: '#5D635B' },

  { text: 'Friendship', left: '39%', top: '74%', fontSize: '15px', weight: 400, color: '#6B665E' },
  { text: 'Productivity', left: '54%', top: '74%', fontSize: '15px', weight: 400, color: '#6A7368' },
  { text: 'New beginning', left: '67%', top: '74%', fontSize: '15px', weight: 400, color: '#5E6359' },

  { text: 'Connection', left: '33%', top: '78%', fontSize: '15px', weight: 400, color: '#736560' },
  { text: 'Loneliness', left: '44%', top: '79%', fontSize: '15px', weight: 400, color: '#666170' },
  { text: 'Emotions', left: '47%', top: '84%', fontSize: '15px', weight: 400, color: '#6B625A' },
  { text: 'Balance', left: '77%', top: '62%', fontSize: '15px', weight: 400, color: '#5C6C60' }
];

const OrganicPebbleWordCloud = ({ onSelectWord }) => {
  return (
    <div className="organic-pebble-container">
      <div className="pebble-blob-card">
        {/* Botanical Leaf Stem SVG Accent on Bottom Left */}
        <svg className="botanical-branch-svg" viewBox="0 0 160 160" fill="none">
          <path d="M 10 150 Q 50 110 120 40" stroke="#5E7860" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 35 125 C 20 110 15 90 30 85 C 45 80 50 100 35 125 Z" fill="#7A9878" opacity="0.85" />
          <path d="M 40 120 C 55 105 75 105 75 120 C 75 135 55 135 40 120 Z" fill="#8DAA8B" opacity="0.8" />
          <path d="M 65 95 C 45 80 40 60 55 55 C 70 50 75 70 65 95 Z" fill="#5F7E5D" opacity="0.9" />
          <path d="M 70 90 C 85 75 105 75 105 90 C 105 105 85 105 70 90 Z" fill="#7A9878" opacity="0.85" />
          <path d="M 95 65 C 80 50 75 35 90 30 C 105 25 110 45 95 65 Z" fill="#4B6849" opacity="0.95" />
          <path d="M 100 60 C 115 45 135 45 135 60 C 135 75 115 75 100 60 Z" fill="#6A8A68" opacity="0.85" />
          <path d="M 120 40 C 120 20 140 15 145 30 C 150 45 135 55 120 40 Z" fill="#5F7E5D" opacity="0.9" />
        </svg>

        {/* Header inside Watercolor Blob */}
        <div className="pebble-header-absolute">
          <div className="cloud-icon-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A574C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
            </svg>
          </div>
          <p className="pebble-kicker">WHAT'S WEIGHING ON YOUR MIND TODAY?</p>
        </div>

        {/* 2D Absolute Word Canvas */}
        <div className="pebble-absolute-canvas">
          {pebbleWordsAbsolute.map((item, idx) => (
            <motion.span
              key={idx}
              className="pebble-absolute-tag"
              style={{
                left: item.left,
                top: item.top,
                fontSize: item.fontSize,
                fontWeight: item.weight,
                color: item.color
              }}
              onClick={() => onSelectWord && onSelectWord(item.text)}
              whileHover={{ scale: 1.18, zIndex: 30 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, idx % 2 === 0 ? -3 : 3, 0] }}
              transition={{ duration: 3.5 + (idx % 3), repeat: Infinity, ease: 'easeInOut' }}
            >
              {item.text}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};

const InteractiveWhoThisIsForSection = ({ sectionMotion, stagger, item }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState(['burnout']);
  const [activePersona, setActivePersona] = useState('quiet-decision');
  const [activeCloudWords, setActiveCloudWords] = useState(['Burnout', 'Overthinking', 'Clarity']);

  const toggleTopic = (id) => {
    setSelectedTopics(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const topics = [
    {
      id: 'burnout',
      title: 'Burnout & Overwhelm',
      sub: 'Feeling drained or exhausted',
      icon: '🔥',
      bgColor: '#FFF5F2',
      accentColor: '#E07A5F',
      shadowColor: 'rgba(224, 122, 95, 0.22)'
    },
    {
      id: 'stress',
      title: 'Stress & Overthinking',
      sub: 'Racing thoughts, constant worry',
      icon: '🧠',
      bgColor: '#F5F3FF',
      accentColor: '#8B5CF6',
      shadowColor: 'rgba(139, 92, 246, 0.22)'
    },
    {
      id: 'partner',
      title: 'Partner & Marriage',
      sub: 'Love, conflicts, connection',
      icon: '💖',
      bgColor: '#FDF2F8',
      accentColor: '#EC4899',
      shadowColor: 'rgba(236, 72, 153, 0.22)'
    },
    {
      id: 'family',
      title: 'Family & Parenting',
      sub: 'Something at home is weighing on me',
      icon: '🏡',
      bgColor: '#EFF6FF',
      accentColor: '#3B82F6',
      shadowColor: 'rgba(59, 130, 246, 0.22)'
    },
    {
      id: 'career',
      title: 'Career & Work',
      sub: 'Stuck, unhappy or confused about work',
      icon: '🎯',
      bgColor: '#E4EFE4',
      accentColor: '#2D6043',
      shadowColor: 'rgba(45, 96, 67, 0.22)'
    },
    {
      id: 'money',
      title: 'Money & Financial Stress',
      sub: 'Money is constantly on my mind',
      icon: '💎',
      bgColor: '#FEF3C7',
      accentColor: '#D97706',
      shadowColor: 'rgba(217, 119, 6, 0.22)'
    },
    {
      id: 'direction',
      title: 'Life Direction',
      sub: "I don't know what I want next",
      icon: '🧭',
      bgColor: '#EDE9FE',
      accentColor: '#7C3AED',
      shadowColor: 'rgba(124, 58, 237, 0.22)'
    },
    {
      id: 'decision',
      title: 'A Difficult Decision',
      sub: 'I need clarity before I choose',
      icon: '⚖️',
      bgColor: '#FEF9C3',
      accentColor: '#CA8A04',
      shadowColor: 'rgba(202, 138, 4, 0.22)'
    },
    {
      id: 'motivation',
      title: 'Motivation & Discipline',
      sub: "I know what to do, but I'm not doing it",
      icon: '⚡',
      bgColor: '#FEF3C7',
      accentColor: '#D97706',
      shadowColor: 'rgba(217, 119, 6, 0.22)'
    },
    {
      id: 'confidence',
      title: 'Confidence & Self Worth',
      sub: "I'm doubting myself",
      icon: '✨',
      bgColor: '#CCFBF1',
      accentColor: '#14B8A6',
      shadowColor: 'rgba(20, 184, 166, 0.22)'
    },
    {
      id: 'change',
      title: 'Change, Loss & Moving On',
      sub: "Something changed and I'm struggling to move forward",
      icon: '🌱',
      bgColor: '#F7FEE7',
      accentColor: '#65A30D',
      shadowColor: 'rgba(101, 163, 13, 0.22)'
    },
    {
      id: 'else',
      title: 'Something else',
      sub: 'Anything else on your mind, no topic is off limits',
      icon: '💭',
      bgColor: '#F8FAFC',
      accentColor: '#64748B',
      shadowColor: 'rgba(100, 116, 139, 0.22)'
    }
  ];

  const personas = [
    {
      id: 'quiet-decision',
      title: 'The quiet decision maker',
      sub: 'Weighing a job change, a move, a relationship to leave. Alone, at 1am, on a loop.',
      insight: 'Brihas gives you an objective mirror to test your options at 1am without pressure.',
      icon: '🌌',
      bgColor: '#F3E8FF',
      accentColor: '#8B5CF6'
    },
    {
      id: 'high-functioning',
      title: 'The high functioning tired',
      sub: "Looks fine. Doesn't feel fine. Can't name what's off, or to whom.",
      insight: 'Express exact fatigue, unpick hidden stressors, and restore balance quietly.',
      icon: '🔋',
      bgColor: '#FFF5F2',
      accentColor: '#E07A5F'
    },
    {
      id: 'pattern-repeater',
      title: 'The pattern repeater',
      sub: 'Same fight, different partner. Same burnout, different job. You want to know why.',
      insight: 'Brihas connects dots across past weeks to show why the same pattern loops.',
      icon: '🔄',
      bgColor: '#E4EFE4',
      accentColor: '#2D6043'
    }
  ];

  return (
    <motion.section className="section who-mock-style" id="who" {...sectionMotion}>
      <div className="wrap">
        {/* Main Section Header */}
        <div className="who-mock-header" style={{ marginBottom: '40px' }}>
          <p className="eyebrow green-eyebrow" style={{ marginBottom: '10px' }}>WHO THIS IS FOR</p>
          <h2 style={{ fontSize: 'clamp(32px, 3.8vw, 54px)', letterSpacing: '-2px', fontWeight: 700, margin: '0 0 12px', color: '#1C251D' }}>
            Not crisis. <em style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#2B7858' }}>Attention.</em>
          </h2>
          <p className="who-mock-sub" style={{ maxWidth: '720px', margin: '0 auto', fontSize: '16.5px', lineHeight: 1.55, color: '#576359' }}>
            For questions with no owner. Not sick enough for therapy. Too important for a group chat. Too personal for a search bar.
          </p>
        </div>

        {/* 3 Core Persona Cards with Click Interaction */}
        <motion.div className="persona-feature-grid" {...stagger}>
          {personas.map(p => {
            const isSelected = activePersona === p.id;
            return (
              <motion.article
                key={p.id}
                className={`persona-feature-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setActivePersona(p.id)}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                style={{
                  borderColor: isSelected ? p.accentColor : '#ECEEEA',
                  backgroundColor: isSelected ? p.bgColor : '#FFFFFF',
                  boxShadow: isSelected ? `0 16px 35px -8px ${p.accentColor}30, 0 0 0 2px ${p.accentColor}` : '0 8px 24px rgba(28, 37, 29, 0.03)',
                  cursor: 'pointer'
                }}
                {...item}
              >
                <div className="persona-badge" style={{ backgroundColor: isSelected ? '#FFFFFF' : p.bgColor }}>
                  {p.icon}
                </div>
                <h3 className="persona-title">{p.title}</h3>
                <p className="persona-sub">{p.sub}</p>

                {/* Click Interactive Revealed Insight Text */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      style={{
                        background: '#FFFFFF',
                        border: `1px solid ${p.accentColor}40`,
                        borderRadius: '14px',
                        padding: '12px 14px',
                        fontSize: '13.5px',
                        fontWeight: 500,
                        color: p.accentColor,
                        lineHeight: 1.45
                      }}
                    >
                      ✨ <strong>How Brihas Helps:</strong> {p.insight}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Organic Watercolor Pebble Word Cloud Section 2 (Matching Attached Mockup Image) */}
        <OrganicPebbleWordCloud 
          onSelectWord={(word) => {
            const el = document.getElementById('map');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 11 Topics to Chat On Section Header */}
        <div style={{ textTransform: 'uppercase', textAlign: 'center', marginBottom: '24px' }}>
          <p className="eyebrow" style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.1em', color: '#6E786F', marginBottom: '6px' }}>
            11 TOPICS TO CHAT ON
          </p>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1C251D', margin: 0 }}>
            What's weighing on your mind today?
          </h3>
        </div>

        {/* 12 Topic Cards Grid */}
        <motion.div className="who-mock-grid" {...stagger}>
          {topics.map(t => {
            const isHovered = hoveredCard === t.id;
            const isSelected = selectedTopics.includes(t.id);
            return (
              <motion.article
                key={t.id}
                className="who-mock-card"
                onClick={() => toggleTopic(t.id)}
                onMouseEnter={() => setHoveredCard(t.id)}
                onMouseLeave={() => setHoveredCard(null)}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                style={{
                  borderColor: isSelected ? t.accentColor : (isHovered ? t.accentColor : '#ECEEEA'),
                  backgroundColor: isSelected ? t.bgColor : '#FFFFFF',
                  boxShadow: (isHovered || isSelected)
                    ? `0 16px 35px -8px ${t.shadowColor}, 0 0 0 1px ${t.accentColor}`
                    : '0 8px 24px rgba(28, 37, 29, 0.03)'
                }}
                {...item}
              >
                {/* Visual Emoji Badge */}
                <div className="who-card-icon-wrapper" style={{ backgroundColor: isSelected ? '#FFFFFF' : t.bgColor }}>
                  {t.icon}
                </div>

                {/* Content */}
                <div className="who-card-content">
                  <h3 className="who-card-title">{t.title}</h3>
                  <p className="who-card-sub">{t.sub}</p>
                </div>

                {/* Active Checkmark Badge */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: t.accentColor,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.article>
            );
          })}
        </motion.div>

        {/* Bottom Callout Banner */}
        <motion.div 
          className="who-mock-banner" 
          whileHover={{ scale: 1.01 }}
          style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #FAF9F6 0%, #F4F7F4 100%)',
            border: '1px solid #ECEEEA',
            padding: '28px 36px',
            borderRadius: '26px'
          }}
        >
          <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#1C251D', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
            Built for depth. Designed for privacy.
          </h4>
          <p style={{ fontSize: '15px', color: '#576359', margin: 0, fontWeight: 500 }}>
            No judgment. No advice by default. Just real understanding.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};


const CleanInteractiveMindMapSection = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedNode, setSelectedNode] = useState('Values');

  const nodes = [
    { id: 'Energy', label: 'Energy', category: 'Internal State', x: 28, y: 22, isHighlight: false, insight: 'Energy peaks when physical rest aligns with personal values.' },
    { id: 'Values', label: 'Values', category: 'Core Life', x: 42, y: 26, isHighlight: true, insight: 'Core values guide difficult choices when external noise drops away.' },
    { id: 'Growth', label: 'Growth', category: 'Action Areas', x: 58, y: 24, isHighlight: false, insight: 'Growth happens most when stepping outside familiar routines.' },
    { id: 'Career', label: 'Career', category: 'Action Areas', x: 22, y: 38, isHighlight: false, insight: 'Career satisfaction grows when effort aligns with long term purpose.' },
    { id: 'Goals', label: 'Goals', category: 'Action Areas', x: 74, y: 35, isHighlight: false, insight: 'Short milestone goals yield 3x higher follow through.' },
    { id: 'Burnout', label: 'Burnout', category: 'Internal State', x: 26, y: 55, isHighlight: false, insight: 'Burnout is cognitive depletion from unassigned decision load.' },
    { id: 'YOU', label: 'YOU', category: 'Center', x: 50, y: 50, isCenter: true },
    { id: 'Beliefs', label: 'Beliefs', category: 'Core Life', x: 38, y: 68, isHighlight: true, insight: 'Subconscious beliefs dictate 90% of recurring decision loops.' },
    { id: 'Confidence', label: 'Confidence', category: 'Internal State', x: 62, y: 65, isHighlight: true, insight: 'Confidence builds when small daily choices align with core identity.' },
    { id: 'Relationships', label: 'Relationships', category: 'Core Life', x: 76, y: 55, isHighlight: false, insight: 'Clear boundary setting reduces friction in daily interactions.' },
    { id: 'Health', label: 'Health', category: 'Core Life', x: 24, y: 78, isHighlight: false, insight: 'Somatic vitality is built through consistent daily rest.' },
    { id: 'Boundaries', label: 'Boundaries', category: 'Action Areas', x: 38, y: 82, isHighlight: false, insight: 'Saying no to non-essentials preserves room for what matters.' },
    { id: 'Purpose', label: 'Purpose', category: 'Internal State', x: 50, y: 84, isHighlight: true, insight: 'Clear purpose illuminates long term direction and choices.' },
    { id: 'Finance', label: 'Finance', category: 'Action Areas', x: 65, y: 80, isHighlight: false, insight: 'Financial peace increases when security guides daily spending.' },
    { id: 'Rest', label: 'Rest', category: 'Internal State', x: 76, y: 75, isHighlight: false, insight: 'Deliberate sleep recovery refreshes cognitive bandwidth.' }
  ];

  const highlightedNodeIds = ['Values', 'Beliefs', 'Purpose', 'Confidence'];

  const filteredNodes = nodes.filter(n => {
    if (n.isCenter) return true;
    if (activeFilter === 'All') return true;
    return n.category === activeFilter;
  });

  const currentNode = nodes.find(n => n.id === selectedNode) || nodes[1];

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <p className="eyebrow" style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.08em', color: '#6E786F', marginBottom: '12px', textTransform: 'uppercase' }}>
              INTERACTIVE MIND MAP
            </p>
            <h2 style={{ fontSize: 'clamp(32px, 3.8vw, 54px)', letterSpacing: '-2.4px', fontWeight: 500, lineHeight: 1.08, margin: 0, color: '#1C251D' }}>
              Understand yourself.<br />
              Decide with <em style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 500, color: '#2B7858' }}>confidence.</em>
            </h2>
          </div>

          <p style={{ fontSize: '14px', color: '#6E786F', maxWidth: '340px', margin: 0, lineHeight: 1.5, textAlign: 'right' }}>
            Click any node to explore how your life patterns link together.
          </p>
        </div>

        {/* Filter Pills & Legend Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Core Life', 'Action Areas', 'Internal State'].map(cat => {
              const isActive = activeFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '100px',
                    fontSize: '13px',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: isActive ? 600 : 400,
                    border: `1px solid ${isActive ? '#1C251D' : '#E2E6E2'}`,
                    backgroundColor: isActive ? '#1C251D' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#4F584F',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(28,37,29,0.12)' : 'none'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Legend Indicators */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px', fontFamily: "'DM Mono', monospace", color: '#6E786F' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3A9775' }} />
              Active Connection
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E07A5F' }} />
              Secondary Loop
            </span>
          </div>
        </div>

        {/* Ethereal Mind Map Canvas Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '540px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #d8e5d7 0%, #c4d7c3 40%, #dce7dc 100%)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            boxShadow: '0 20px 50px -10px rgba(28, 37, 29, 0.08), inset 0 0 40px rgba(255, 255, 255, 0.4)',
            overflow: 'hidden'
          }}
        >
          {/* Concentric Elliptical Orbit Stage */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            {/* Concentric Ellipse Rings Centered at 50%, 50% */}
            <ellipse cx="50%" cy="50%" rx="160" ry="100" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            <ellipse cx="50%" cy="50%" rx="270" ry="165" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            <ellipse cx="50%" cy="50%" rx="390" ry="220" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

            {/* SVG Dashed Connecting Rays from YOU (50%, 50%) to Active Highlight Nodes */}
            {filteredNodes.map(node => {
              if (node.isCenter) return null;
              const isConn = highlightedNodeIds.includes(node.id) || selectedNode === node.id;
              if (!isConn) return null;
              return (
                <line
                  key={`ray-${node.id}`}
                  x1="50%"
                  y1="50%"
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke="#3A9775"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                  opacity="0.85"
                />
              );
            })}
          </svg>

          {/* Central "YOU" Obsidian Sphere Centered at 50%, 50% */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#1C2B21',
              border: '2px solid #2E4635',
              boxShadow: '0 0 24px rgba(28, 43, 33, 0.4), 0 0 0 10px rgba(58, 151, 117, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              zIndex: 10
            }}
          >
            YOU
          </div>

          {/* Floating Nodes */}
          {filteredNodes.map(node => {
            if (node.isCenter) return null;
            const isSelected = selectedNode === node.id;
            const isHighlight = highlightedNodeIds.includes(node.id);

            return (
              <motion.div
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  scale: isSelected ? 1.08 : 1,
                  boxShadow: isSelected
                    ? '0 8px 20px rgba(58,151,117,0.3), 0 0 0 2px #3A9775'
                    : isHighlight
                    ? '0 4px 14px rgba(58,151,117,0.18)'
                    : '0 2px 8px rgba(0,0,0,0.04)'
                }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                  padding: '7px 16px',
                  borderRadius: '100px',
                  backgroundColor: isHighlight || isSelected ? '#E6F2ED' : '#FFFFFF',
                  border: `1.5px solid ${isHighlight || isSelected ? '#3A9775' : '#E2E6E2'}`,
                  color: isHighlight || isSelected ? '#1C2B21' : '#1C251D',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  zIndex: isSelected ? 12 : 5,
                  whiteSpace: 'nowrap'
                }}
              >
                {node.label}
              </motion.div>
            );
          })}
        </div>

        {/* Pattern Insight Drawer under the canvas */}
        {currentNode && currentNode.insight && (
          <motion.div
            key={currentNode.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: '20px',
              padding: '16px 24px',
              borderRadius: '18px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E6E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 6px 20px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px' }}>✨</span>
              <div>
                <strong style={{ fontSize: '13px', color: '#1C251D', display: 'block', marginBottom: '2px' }}>
                  Pattern Noticed: {currentNode.label} ➔ Life Connection
                </strong>
                <span style={{ fontSize: '13px', color: '#4F584F', fontStyle: 'italic' }}>
                  "{currentNode.insight}"
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(currentNode.id)}
              style={{
                padding: '6px 16px',
                borderRadius: '100px',
                border: '1px solid #3A9775',
                backgroundColor: 'rgba(58, 151, 117, 0.08)',
                color: '#2E7858',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Explore Node →
            </button>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

const Interactive3DMindMapDashboard = () => {
  const [activeId, setActiveId] = useState('Confidence');
  const [isRotating, setIsRotating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotAngle, setRotAngle] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [thoughtInput, setThoughtInput] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  // Mouse Drag to Rotate State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  useEffect(() => {
    let interval;
    if (isRotating) {
      interval = setInterval(() => {
        setRotAngle(prev => (prev + 0.4) % 360);
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isRotating]);

  const activeNode = nodes3DData.find(n => n.id === activeId) || nodes3DData[0];

  const handleThoughtSubmit = (e) => {
    e.preventDefault();
    if (!thoughtInput.trim()) return;
    setToastMsg(`✨ Thought logged under ${activeNode.label}: "${thoughtInput}"`);
    setThoughtInput('');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    setDragStartX(clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const deltaX = clientX - dragStartX;
    setRotAngle(prev => (prev + deltaX * 0.4) % 360);
    setDragStartX(clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(1.35, +(prev + 0.05).toFixed(2)));
    } else {
      setZoomLevel(prev => Math.max(0.75, +(prev - 0.05).toFixed(2)));
    }
  };

  return (
    <div 
      className="mindmap-3d-viewport-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Ethereal Ambient Background */}
      <div className="ethereal-bg-landscape"></div>
      
      {/* Top Left Header Card */}
      <div className="glass-card-widget widget-top-left" onClick={(e) => e.stopPropagation()}>
        <div className="widget-header-title">
          <small>Good morning, Keshav ☀️</small>
          <h2>Your Mind Map</h2>
          <p>Explore what matters most to you.</p>
        </div>
        <div className="widget-focus-pill">
          <span className="focus-sparkle">✦</span>
          <div>
            <span className="f-label">Today’s focus</span>
            <strong>Build momentum in <span className="highlight-node-name">{activeNode.label}</span></strong>
          </div>
        </div>
        <div className="widget-streak">
          <div className="streak-header">
            <span>🔥 7 Days Streak</span>
            <small className="streak-dot"></small>
          </div>
          <div className="streak-bars">
            {[1,1,1,1,1,1,1].map((_, i) => (
              <span key={i} className="s-bar active"></span>
            ))}
          </div>
          <small className="streak-sub">Keep showing up!</small>
        </div>
      </div>

      {/* Top Right View Controls Toolbar */}
      <div className="glass-controls-toolbar widget-top-right" onClick={(e) => e.stopPropagation()}>
        <button className={`ctrl-btn ${isRotating ? 'active' : ''}`} onClick={() => setIsRotating(!isRotating)}>
          <span className="ctrl-icon">🔄</span>
          <span>{isRotating ? 'Pause' : 'Rotate'}</span>
        </button>
        <button className={`ctrl-btn ${zoomLevel > 1 ? 'active' : ''}`} onClick={() => setZoomLevel(zoomLevel === 1 ? 1.2 : 1)}>
          <span className="ctrl-icon">🔍</span>
          <span>Zoom</span>
        </button>
        <button className="ctrl-btn" onClick={() => { setIsRotating(false); setZoomLevel(1); setRotAngle(0); setActiveId('Confidence'); }}>
          <span className="ctrl-icon">🎯</span>
          <span>Focus</span>
        </button>
      </div>

      {/* Mid Right "Pattern Noticed" Insight Card */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeNode.id}
          className="glass-card-widget widget-mid-right"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="insight-badge">
            <span className="sparkle-icon">✨</span>
            <span>Pattern noticed</span>
          </div>
          <p className="insight-text">"{activeNode.insight}"</p>
          <button className="insight-action-btn" onClick={() => setToastMsg(`🎯 Exploring pattern: ${activeNode.label}`)}>
            <span>Explore</span> <Icon name="arrow" size={12}/>
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Right "Your Plans" Card */}
      <div className="glass-card-widget widget-bottom-right" onClick={(e) => e.stopPropagation()}>
        <div className="plans-widget-header">
          <span>Your Plans</span>
          <span className="cal-icon">📅</span>
        </div>
        <div className="plan-progress-item">
          <div className="progress-info">
            <span>3-Day Plan</span>
            <small>2/3</small>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: '66%' }}></div></div>
        </div>
        <div className="plan-progress-item">
          <div className="progress-info">
            <span>7-Day Plan</span>
            <small>5/7</small>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: '71%' }}></div></div>
        </div>
        <a href="#plans" className="widget-btn-link">View Plans →</a>
      </div>

      {/* Bottom Left View & Audio Equalizer Player */}
      <div className="widget-bottom-left-stack" onClick={(e) => e.stopPropagation()}>
        <div className="glass-card-widget widget-view-toggle">
          <small className="v-label">View</small>
          <div className="v-buttons">
            <button className="v-btn active">🎛️</button>
            <button className="v-btn">☰</button>
            <button className="v-btn">🪐</button>
          </div>
        </div>

        <div className="glass-card-widget widget-audio-player">
          <div className="audio-icon-box">
            <span className="orb-disc"></span>
          </div>
          <div className="audio-info">
            <strong>Calm Focus</strong>
            <small>{isPlayingAudio ? 'Now playing' : 'Paused'}</small>
          </div>
          <div className="audio-equalizer">
            <span className={`eq-bar ${isPlayingAudio ? 'anim-1' : ''}`}></span>
            <span className={`eq-bar ${isPlayingAudio ? 'anim-2' : ''}`}></span>
            <span className={`eq-bar ${isPlayingAudio ? 'anim-3' : ''}`}></span>
          </div>
          <button className="audio-play-btn" onClick={() => setIsPlayingAudio(!isPlayingAudio)}>
            {isPlayingAudio ? '❚❚' : '▶'}
          </button>
        </div>
      </div>

      {/* Central 3D Interactive Orbit Canvas */}
      <div className="map-3d-scene" style={{ transform: `scale(${zoomLevel})` }}>
        {/* Concentric 3D Orbit Stage */}
        <div className="orbit-3d-stage" style={{ transform: `rotateX(62deg) rotateZ(${rotAngle}deg)` }}>
          <div className="ring-3d ring-outer"></div>
          <div className="ring-3d ring-middle"></div>
          <div className="ring-3d ring-inner"></div>

          {/* SVG Connecting Light Rays */}
          <svg className="svg-rays-3d">
            {nodes3DData.map((node) => {
              const rad = ((node.angle + rotAngle) * Math.PI) / 180;
              const x2 = 300 + Math.cos(rad) * node.rx;
              const y2 = 300 - Math.sin(rad) * node.ry;
              const isSelected = activeNode.id === node.id;
              return (
                <g key={`ray-${node.id}`}>
                  <line 
                    x1="300" y1="300" x2={x2} y2={y2} 
                    className={`ray-line ${isSelected ? 'selected-ray' : ''}`} 
                  />
                  {isSelected && <circle cx={x2} cy={y2} r="4" fill="#3a9775" className="pulse-dot" />}
                </g>
              );
            })}
          </svg>

          {/* Central 3D Chrome "YOU" Sphere & Base */}
          <div className="center-orb-3d-base">
            <div className="base-ring-tier-1"></div>
            <div className="base-ring-tier-2"></div>
            <div 
              className="center-obsidian-sphere" 
              onClick={(e) => { e.stopPropagation(); setActiveId('Confidence'); }}
            >
              <span>YOU</span>
            </div>
          </div>

          {/* 12 Tactile 3D Puck Disc Nodes with Upright Billboarding */}
          {nodes3DData.map((node) => {
            const rad = ((node.angle + rotAngle) * Math.PI) / 180;
            const px = 300 + Math.cos(rad) * node.rx;
            const py = 300 - Math.sin(rad) * node.ry;
            const isSelected = activeId === node.id;
            const isHighlight = node.isHighlight;

            return (
              <div
                key={node.id}
                className={`puck-node-3d ${isSelected ? 'active-puck' : ''} ${isHighlight ? 'sage-highlight-puck' : ''}`}
                style={{ 
                  left: `${px}px`, 
                  top: `${py}px`,
                  transform: `translate(-50%, -50%) rotateZ(${-rotAngle}deg) rotateX(-62deg)`
                }}
                onClick={(e) => { e.stopPropagation(); setActiveId(node.id); }}
              >
                <div className="puck-top-face">
                  <span className="puck-icon">{node.icon}</span>
                  <span className="puck-title">{node.label}</span>
                </div>
                <div className="puck-side-bevel"></div>
                <div className="puck-bottom-shadow"></div>
                {isSelected && <div className="puck-led-ring"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Center Quick Thought Input Bar */}
      <div className="widget-bottom-center-stack" onClick={(e) => e.stopPropagation()}>
        <form className="quick-thought-input-bar" onSubmit={handleThoughtSubmit}>
          <span className="t-icon">☀️</span>
          <input 
            type="text" 
            placeholder="Say something on your mind..." 
            value={thoughtInput}
            onChange={(e) => setThoughtInput(e.target.value)}
          />
          <button type="submit" className="t-send-btn">
            <Icon name="arrow" size={14}/>
          </button>
        </form>

        <div className="control-helper-pill">
          <span>👆 Drag to rotate</span>
          <span className="dot-sep">•</span>
          <span>🖱️ Scroll to zoom</span>
          <span className="dot-sep">•</span>
          <span>🔍 Click a node to focus</span>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            className="interactive-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const mapNodesData = [
  { id: 'burnout', title: 'Burnout & Overwhelm', desc: 'Feeling drained or exhausted', icon: '🔥', activeId: 'energy' },
  { id: 'stress', title: 'Stress & Overthinking', desc: 'Racing thoughts, constant worry', icon: '🧠', activeId: 'clarity' },
  { id: 'partner', title: 'Partner & Marriage', desc: 'Love, conflicts, connection', icon: '💖', activeId: 'family' },
  { id: 'family', title: 'Family & Parenting', desc: 'Something at home is weighing on me', icon: '🏡', activeId: 'partner' },
  { id: 'career', title: 'Career & Work', desc: 'Stuck, unhappy or confused about work', icon: '🎯', activeId: 'money' },
  { id: 'money', title: 'Money & Financial Stress', desc: 'Money is constantly on my mind', icon: '💎', activeId: 'career' },
  { id: 'direction', title: 'Life Direction', desc: "I don't know what I want next", icon: '🧭', activeId: 'decision' },
  { id: 'decision', title: 'A Difficult Decision', desc: 'I need clarity before I choose', icon: '⚖️', activeId: 'direction' },
  { id: 'motivation', title: 'Motivation & Discipline', desc: "I know what to do, but I'm not doing it", icon: '⚡', activeId: 'confidence' },
  { id: 'confidence', title: 'Confidence & Self-Worth', desc: "I'm doubting myself", icon: '✨', activeId: 'motivation' },
  { id: 'change', title: 'Change, Loss & Moving On', desc: 'Struggling to move forward', icon: '🌱', activeId: 'burnout' },
  { id: 'other', title: 'Something else', desc: 'Anything else on your mind — no limit', icon: '💭', activeId: 'stress' }
];

const heroChatDialogues = [
  { topic: 'Career & Work', icon: '🎯', user: "I feel stuck at my job. Looks fine on paper, but I'm completely unfulfilled.", ai: "Let's unpack that. Is it the daily work itself, or the feeling that you're building someone else's dream?" },
  { topic: 'Money & Stress', icon: '💎', user: "I can't stop worrying about financial security late at night.", ai: "That 1 AM loop is heavy. What specific number or milestone would make you feel truly safe?" },
  { topic: 'Stress & Overthinking', icon: '🧠', user: "My brain has 20 tabs open and I can't pick what to focus on.", ai: "Take a breath. If you could resolve just ONE question today, which one frees up the most mental space?" },
  { topic: 'Life Direction', icon: '🧭', user: "Everyone thinks I have it figured out, but I don't know what I want next.", ai: "It's okay to outgrow old goals. What used to excite you that you haven't given time to lately?" }
];

const conversationScenarios = [
  {
    topicId: 'burnout',
    date: 'Tue, 11 Aug',
    bqText: 'BQ up',
    tag: 'Relational Strain',
    messages: [
      { id: 1, sender: 'user', text: "I'm feeling bad, like, due to, I'm getting fat" },
      { id: 2, sender: 'ai', text: "That's weighing on you. Is it the physical thing itself, or more what it's saying to you about... control, or how things are slipping?" },
      { id: 3, sender: 'user', text: "I want to go gym but cant" },
      { id: 4, sender: 'ai', text: "What's stopping you — is it time, energy, something else?" },
      { id: 5, sender: 'user', text: "Work less tome" },
      { id: 6, sender: 'ai', text: "So work's taking everything right now. That's the bottleneck. I remember you've mentioned feeling depleted before — sounds like it's gotten tighter. What's different about work lately, or is it just the same pressure but you're running on even less?" },
      { id: 7, sender: 'user', text: "Its hectic" },
      { id: 8, sender: 'ai', text: "Hectic in what way — is it the volume, the pace, people, all of it tangled together?" },
      { id: 9, sender: 'user', text: "Volume" },
      { id: 10, sender: 'ai', text: "A lot coming at you all at once. That's the kind of thing that makes everything else — gym, eating right, just breathing — feel impossible because there's nothing left in the tank by end of day." }
    ]
  },
  {
    topicId: 'career',
    date: 'Wed, 12 Aug',
    bqText: 'Clarity +4',
    tag: 'Career Friction',
    messages: [
      { id: 1, sender: 'user', text: "Can't sleep. Weighing whether to accept this new job offer or stay." },
      { id: 2, sender: 'ai', text: "The 1 AM decision loop. When you imagine staying another year at your current role, what's the immediate feeling in your gut — relief or quiet regret?" },
      { id: 3, sender: 'user', text: "Regret... but what if the new company is worse?" },
      { id: 4, sender: 'ai', text: "That's the classic fear of unknown discomfort vs familiar discomfort. Let's break down what's actually keeping you on the fence." }
    ]
  }
];

const topicCategories = [
  {
    id: 'mind',
    title: 'Mind & Emotional Balance',
    icon: '🧠',
    accentColor: '#7C3AED',
    bgColor: '#F5EEFD',
    borderColor: '#E9D5FC',
    topics: ['Burnout & Overwhelm', 'Stress & Overthinking', 'Self Doubt'],
    scenarioIdx: 0
  },
  {
    id: 'relationships',
    title: 'Relationships & Family',
    icon: '💖',
    accentColor: '#E55B6E',
    bgColor: '#FDEEEF',
    borderColor: '#FCCEE3',
    topics: ['Partner & Marriage', 'Family & Parenting', 'Boundary Setting'],
    scenarioIdx: 0
  },
  {
    id: 'career',
    title: 'Career & Financial Growth',
    icon: '🎯',
    accentColor: '#2D6043',
    bgColor: '#EAF4EC',
    borderColor: '#CBE5D3',
    topics: ['Career & Work', 'Financial Stress', 'Decision Paralysis'],
    scenarioIdx: 1
  },
  {
    id: 'purpose',
    title: 'Purpose & Daily Habits',
    icon: '🌱',
    accentColor: '#D97706',
    bgColor: '#FEF3E8',
    borderColor: '#FDE0C2',
    topics: ['Purpose & Trajectory', 'Habit Building'],
    scenarioIdx: 0
  }
];

const LiveBrihasAppMockup = () => {
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [visibleMsgCount, setVisibleMsgCount] = useState(2);

  const activeCategory = topicCategories[activeCategoryIdx];
  const currentScenario = conversationScenarios[scenarioIndex];
  const chatEndRef = useRef(null);

  useEffect(() => {
    const totalMsgs = currentScenario.messages.length;
    const interval = setInterval(() => {
      setVisibleMsgCount((count) => {
        if (count < totalMsgs) {
          return count + 1;
        }
        return count;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [scenarioIndex, currentScenario.messages.length]);

  useEffect(() => {
    if (visibleMsgCount >= currentScenario.messages.length) {
      const timeout = setTimeout(() => {
        setScenarioIndex((s) => (s + 1) % conversationScenarios.length);
        setVisibleMsgCount(2);
      }, 3600);
      return () => clearTimeout(timeout);
    }
  }, [visibleMsgCount, currentScenario.messages.length]);

  useEffect(() => {
    try {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch (e) {
      // safe fallback
    }
  }, [visibleMsgCount]);

  return (
    <div style={{ width: '100%' }}>
      {/* 4 Category Cards Flow Section */}
      <div className="category-cards-flow-section">
        <p className="kicker" style={{ textAlign: 'center', marginBottom: '14px', letterSpacing: '0.12em', color: '#576359' }}>
          11 LIFE TOPICS · BUCKETED INTO 4 CORE CATEGORIES
        </p>
        <div className="category-cards-grid">
          {topicCategories.map((cat, idx) => {
            const isActive = activeCategoryIdx === idx;
            return (
              <motion.div
                key={cat.id}
                className={`category-flow-card ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategoryIdx(idx);
                  setScenarioIndex(cat.scenarioIdx);
                  setVisibleMsgCount(2);
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  borderColor: isActive ? cat.accentColor : '#EAECE8',
                  boxShadow: isActive ? `0 10px 24px ${cat.borderColor}` : '0 4px 14px rgba(0,0,0,0.03)'
                }}
              >
                <div className="cat-card-header">
                  <span className="cat-card-icon" style={{ background: cat.bgColor, color: cat.accentColor }}>{cat.icon}</span>
                  <span className="cat-topic-badge" style={{ color: cat.accentColor, background: cat.bgColor }}>{cat.topics.length} Topics</span>
                </div>
                <h4 className="cat-card-title">{cat.title}</h4>
                <div className="cat-topics-list">
                  {cat.topics.map((t, i) => (
                    <span key={i} className="cat-topic-tag">{t}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="hero-phone-stage">
        <motion.div 
          className="iphone-15-pro-frame"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {/* iPhone 15 Pro Dynamic Island Notch */}
          <div className="dynamic-island-pill">
            <div className="camera-dot" />
          </div>

          <div className="brihas-app-screen">
            {/* iOS Status Bar */}
            <div className="brihas-app-top-status">
              <span>4:43</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px' }}>📶 5G</span>
                <div className="brihas-battery-badge">79%⚡</div>
              </div>
            </div>

            {/* Brihas App Top Navbar */}
            <div className="brihas-app-navbar">
              <button className="brihas-nav-circle-btn">✕</button>
              <span className="brihas-nav-logo-text">brihas.ai</span>
              <button className="brihas-nav-circle-btn">☰</button>
            </div>

            {/* Subheader Bar */}
            <div className="brihas-app-subhead">
              <div className="brihas-subhead-left">
                <div className="brihas-icon-btn-pill">←</div>
                <div className="brihas-icon-btn-pill">⟲</div>
              </div>
              <div className="brihas-brand-center">
                <div className="brihas-logo-mark">⅄</div>
                <span>{activeCategory.title.split('&')[0]}</span>
              </div>
              <span className="brihas-quota-badge">1/6 today</span>
            </div>

            {/* Sub-Topics Pill Row for Selected Category */}
            <div className="brihas-topics-scroll">
              {activeCategory.topics.map((t, i) => (
                <div key={i} className="brihas-topic-item">
                  <div className="brihas-topic-circle" style={{ background: activeCategory.bgColor, color: activeCategory.accentColor }}>{activeCategory.icon}</div>
                  <span className="brihas-topic-title">{t}</span>
                </div>
              ))}
            </div>

          {/* Chat Conversation Body */}
          <div className="brihas-app-chat-body">
            {/* Date Tag & Status Bar */}
            <div className="brihas-date-strip">
              <span>ˇ</span>
              <span>{currentScenario.date}</span>
              <span className="brihas-bq-up">{currentScenario.bqText}</span>
              <span className="brihas-tag-pill">{currentScenario.tag}</span>
            </div>

            {/* Live Chat Messages Stream */}
            <AnimatePresence>
              {currentScenario.messages.slice(0, visibleMsgCount).map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35 }}
                >
                  {msg.sender === 'user' ? (
                    <div className="brihas-user-msg-wrap">
                      <div className="brihas-user-bubble">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div className="brihas-ai-msg-wrap">
                      <div className="brihas-avatar-circle">⅄</div>
                      <div className="brihas-ai-bubble-box">
                        <span className="brihas-ai-name">Brihas</span>
                        <div className="brihas-ai-bubble">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="brihas-input-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '15px', color: '#4A4A4A' }}>🎙</span>
              <span className="brihas-input-placeholder">Share what's on your mind...</span>
            </div>
            <button className="brihas-send-circle">↑</button>
          </div>

          {/* Bottom Tabs */}
          <div className="brihas-bottom-tabs">
            <div className="brihas-tab-item active">
              <span style={{ fontSize: '16px' }}>💬</span>
              <span>Chats</span>
              <div className="brihas-tab-badge">1</div>
            </div>
            <div className="brihas-tab-item">
              <span style={{ fontSize: '16px' }}>⌂</span>
              <span>Insights</span>
            </div>
            <div className="brihas-tab-item">
              <span style={{ fontSize: '16px' }}>🏃</span>
              <span>Journey</span>
            </div>
            <div className="brihas-tab-item">
              <span style={{ fontSize: '16px' }}>👤</span>
              <span>You</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
    </div>
  );
};

const Hero3DOrbConstellationStage = () => {
  return (
    <div className="orb-constellation-stage">
      {/* SVG Connecting Constellation Lines */}
      <svg width="540" height="480" viewBox="0 0 540 480" fill="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        <path d="M 200 60 Q 270 140 270 240" stroke="#E9D5FC" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.65" />
        <path d="M 430 110 Q 350 170 270 240" stroke="#FED7AA" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.65" />
        <path d="M 460 250 Q 360 240 270 240" stroke="#E9D5FC" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.65" />
        <path d="M 410 390 Q 340 320 270 240" stroke="#BBF7D0" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.65" />
        <path d="M 180 410 Q 220 330 270 240" stroke="#FFEDD5" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.65" />
        <path d="M 80 180 Q 170 200 270 240" stroke="#DBEAFE" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.65" />
      </svg>

      {/* Central 3D Orb Sphere */}
      <motion.div 
        className="brihas-center-orb"
        animate={{ scale: [1, 1.05, 0.98, 1], rotate: [0, 4, -4, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span>BRIHAS</span>
      </motion.div>

      {/* Rotating Circular Text Ring around Central Orb */}
      <motion.div 
        className="orbiting-text-ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        <svg width="290" height="290" viewBox="0 0 290 290">
          <path id="orbitTextCirclePath" d="M 145,145 m -125,0 a 125,125 0 1,1 250,0 a 125,125 0 1,1 -250,0" fill="none" />
          <text fill="#6D28D9" fontSize="11.5" fontWeight="600" letterSpacing="0.22em">
            <textPath href="#orbitTextCirclePath" startOffset="0%">
              ✦ UNDERSTAND ✦ DECIDE ✦ MOVE FORWARD ✦ REAL CONVERSATIONS ✦ REAL CLARITY ✦
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Floating Card Node 1: Relationships */}
      <motion.div 
        className="orb-node-card node-relationships"
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="orb-node-icon-wrap" style={{ background: '#F3ECFE', color: '#7C3AED' }}>💜</div>
        <h4>Relationships</h4>
        <p>Build stronger connections</p>
      </motion.div>

      {/* Floating Card Node 2: Career */}
      <motion.div 
        className="orb-node-card node-career"
        animate={{ y: [6, -6, 6] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        <div className="orb-node-icon-wrap" style={{ background: '#FFF7ED', color: '#EA580C' }}>💼</div>
        <h4>Career</h4>
        <p>Find purpose and direction</p>
      </motion.div>

      {/* Floating Card Node 3: Life Decisions */}
      <motion.div 
        className="orb-node-card node-decisions"
        animate={{ y: [-4, 6, -4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      >
        <div className="orb-node-icon-wrap" style={{ background: '#F3ECFE', color: '#7C3AED' }}>🎯</div>
        <h4>Life Decisions</h4>
        <p>Make confident choices</p>
      </motion.div>

      {/* Floating Card Node 4: Well-being */}
      <motion.div 
        className="orb-node-card node-wellbeing"
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        <div className="orb-node-icon-wrap" style={{ background: '#F0FDF4', color: '#16A34A' }}>🍃</div>
        <h4>Well-being</h4>
        <p>Feel better. Live better.</p>
      </motion.div>

      {/* Floating Card Node 5: Goals & Growth */}
      <motion.div 
        className="orb-node-card node-goals"
        animate={{ y: [-6, 4, -6] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
      >
        <div className="orb-node-icon-wrap" style={{ background: '#FFF7ED', color: '#EA580C' }}>🎯</div>
        <h4>Goals & Growth</h4>
        <p>Clarify what you want</p>
      </motion.div>

      {/* Floating Card Node 6: Mind & Thoughts */}
      <motion.div 
        className="orb-node-card node-mind"
        animate={{ y: [4, -6, 4] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 1.0 }}
      >
        <div className="orb-node-icon-wrap" style={{ background: '#EFF6FF', color: '#2563EB' }}>☁️</div>
        <h4>Mind & Thoughts</h4>
        <p>Understand yourself deeper</p>
      </motion.div>

      {/* Cursive Tagline */}
      <div className="hero-script-tagline">
        Understand. Decide. Move forward.
      </div>
    </div>
  );
};

function App() {
  const [openFaq, setOpenFaq] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
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

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: Math.round(x), y: Math.round(y) });
  };

  // Hero Section Input State
  const [heroInputText, setHeroInputText] = useState('');

  // Quotient Section State
  const [dimFilter, setDimFilter] = useState('All');
  const [activeDimId, setActiveDimId] = useState('clarity');
  const [simulatedSession, setSimulatedSession] = useState(false);

  // Mind Map Section State
  const [mindFilter, setMindFilter] = useState('All');
  const [activeNodeId, setActiveNodeId] = useState('Identity');

  // Mobile Comparison State
  const [mobileCompTab, setMobileCompTab] = useState('THERAPY');

  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const mapParallax = useTransform(scrollY, [0, 750], [0, 50]);

  const sectionMotion = reduceMotion ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: .6, ease: [0.22, 1, 0.36, 1] } };
  const stagger = reduceMotion ? {} : { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: .1 }, variants: { hidden: {}, visible: { transition: { staggerChildren: .08 } } } };
  const item = reduceMotion ? {} : { variants: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: .45, ease: [0.22, 1, 0.36, 1] } } } };

  // Filtered Quotient Dimensions
  const filteredDimensions = dimFilter === 'All' 
    ? quotientDimensions 
    : quotientDimensions.filter(d => d.status === dimFilter);

  const activeDimension = quotientDimensions.find(d => d.id === activeDimId) || quotientDimensions[0];

  // Filtered Mind Nodes
  const filteredMindNodes = mindFilter === 'All'
    ? mindNodesData
    : mindNodesData.filter(n => n.category === mindFilter || n.isCore);

  const activeNode = mindNodesData.find(n => n.id === activeNodeId) || mindNodesData[0];

  return (
    <>
    <main id="top">
      {/* Top Privacy Ribbon Ticker */}
      <div className="ribbon">
        <div className="ribbon__rail">
          <div className="ribbon__track">
            <span>100% Private &amp; Encrypted</span><b>✦</b>
            <span>Zero Ads · Never Sold or Shared</span><b>✦</b>
            <span>Delete History Anytime in One Click</span><b>✦</b>
            <span>Full User Control</span><b>✦</b>
            <span>Your Trust is Everything</span><b>✦</b>
            <span>AI Advises. You Decide</span><b>✦</b>
          </div>
          <div className="ribbon__track" aria-hidden="true">
            <span>100% Private &amp; Encrypted</span><b>✦</b>
            <span>Zero Ads · Never Sold or Shared</span><b>✦</b>
            <span>Delete History Anytime in One Click</span><b>✦</b>
            <span>Full User Control</span><b>✦</b>
            <span>Your Trust is Everything</span><b>✦</b>
            <span>AI Advises. You Decide</span><b>✦</b>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="nav-brihas-exact">
        <div className="nav__inner">
          <div className="wordmark">brihas<span>.ai</span></div>
          <nav className="nav__links">
            <a href="#what">What it is</a>
            <a href="#who">Who it's for</a>
            <a href="#how">How it works</a>
            <a href="#plans">Plans</a>
          </nav>
          <div className="nav__right">
            <a href="#plans" className="nav-signin-link">Sign in</a>
            <a href="#plans" className="btn-ghost">Begin Here</a>
            <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
              <Icon name={mobileMenu ? "close" : "menu"} size={22}/>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div 
            className="mobile-drawer"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            <a href="#what" onClick={() => setMobileMenu(false)}>What it is</a>
            <a href="#who" onClick={() => setMobileMenu(false)}>Who it's for</a>
            <a href="#how" onClick={() => setMobileMenu(false)}>How it works</a>
            <a href="#plans" onClick={() => setMobileMenu(false)}>Plans</a>
            <a href="#plans" onClick={() => setMobileMenu(false)} className="nav-signin-link">Sign in</a>
            <a href="#plans" onClick={() => setMobileMenu(false)} className="button button-dark">Begin Here</a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exact Hero Stage with Dynamic Cursor Mouse Tracking Background Mesh */}
      {/* Editorial Centered Hero Section */}
      <section className="hero-exact">
        <div className="hero__inner">
          <h1 className="hq-h1">
            Too important for a group chat.<br />
            Too personal for a search bar.
          </h1>

          <form className="hq-bar" onSubmit={(e) => { e.preventDefault(); if (heroInputText.trim()) { const el = document.getElementById('map'); if (el) el.scrollIntoView({ behavior: 'smooth' }); } }}>
            <input 
              className="hq-input" 
              type="text" 
              placeholder="What's on your mind?" 
              aria-label="What's on your mind?"
              value={heroInputText}
              onChange={(e) => setHeroInputText(e.target.value)}
            />
            <button type="submit" className="hq-go" aria-label="Begin">
              <Icon name="arrow" size={19} />
            </button>
          </form>

          <div className="hq-chips">
            <span className="hq-chips-lead">START ANYWHERE</span>
            <div className="hq-chip-container">
              {['A decision', 'Someone close', 'Work', 'Money', 'Myself'].map((pill, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  className="hq-chip"
                  onClick={() => setHeroInputText(`I want to reflect on ${pill.toLowerCase()}...`)}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <div className="hq-stores">
            <span className="hq-stores-lead">COMING SOON ON</span>
            <div className="hq-store-container">
              <span className="hq-store">
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="asg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#1ECFFF" />
                      <stop offset="1" stopColor="#0A67F0" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="24" height="24" rx="5.4" fill="url(#asg2)" />
                  <path d="M8.24 16.93l-.78 1.36a.95.95 0 1 1-1.64-.95l.58-1a1.4 1.4 0 0 1 1.84.59zM12 6.02l.6-1.05a.95.95 0 1 1 1.65.95L9.9 13.4h2.87c.93 0 1.45.55 1.27 1.32H5.16a.95.95 0 0 1 0-1.9h2.36l3.02-5.24-.94-1.63a.95.95 0 0 1 1.64-.95l.36.62zM16.2 13.4h2.42a.95.95 0 0 1 0 1.9h-1.32l.9 1.56a.95.95 0 1 1-1.65.95c-1.5-2.62-2.64-4.58-3.4-5.9-.78-1.34-.22-2.68.33-3.14.62 1.06 1.53 2.65 2.73 4.75z" fill="#fff" />
                </svg>
                <span>App Store</span>
              </span>

              <span className="hq-store">
                <svg width="16" height="17" viewBox="0 0 20 22">
                  <path d="M1.6 1.8c-.37.96 0 1.86.75 2.29L12.99 11 1.53 19.9c-.6-.43-.86-1.31-.53-2.27z" fill="#4CAF50" />
                  <path d="M1.6 1.8 13.06 9.5l3.39 3.39-11.65 7.68c-.75.43-1.55.08-1.92-.88z" fill="#F44336" opacity=".001" />
                  <path d="M2.35 4.09 13.8 11l-11.45 6.91c-.75-.43-1.12-1.33-.75-2.29z" fill="#FFC107" opacity=".001" />
                  <path d="M1.53 2.1 12.99 11 1.53 19.9C1.2 18.94 1.2 3.06 1.53 2.1z" fill="#34A853" />
                  <path d="M12.99 11 1.53 2.1c.6-.5 1.36-.42 2 .0L17.9 9.6c1.06.6 1.06 2.2 0 2.8L15.53 13.8z" fill="#4285F4" />
                  <path d="M12.99 11 3.53 19.9c-.64.42-1.4.5-2 0l11.46-8.9z" fill="#FBBC04" />
                  <path d="M15.53 13.8 3.53 20.9c-.64.42-1.4.5-2 0l11.46-8.9z" fill="#EA4335" />
                </svg>
                <span>Google Play</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Ribbon Bar */}
      <div className="trust">
        <div className="trust__inner">
          <div className="trust__cell"><b>What you share stays here</b><span>Fully private &amp; encrypted.</span></div>
          <div className="trust__cell"><b>Zero ads. Never sold.</b><span>Your trust is everything.</span></div>
          <div className="trust__cell"><b>Delete history anytime</b><span>In one click.</span></div>
          <div className="trust__cell"><b>AI advises. You decide.</b><span>Not therapy, not a diagnosis.</span></div>
        </div>
      </div>

      {/* 2ND SECTION: WHAT IS WEIGHING ON YOUR MIND */}
      <motion.section className="section weighing-mind-section" id="topics" {...sectionMotion}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <div className="weighing-mind-header" style={{ marginBottom: '32px' }}>
            <p className="eyebrow green-eyebrow" style={{ justifyContent: 'center' }}><i></i> EXPLORE REAL CONCERNS</p>
            <h2 style={{ fontFamily: "'DM Sans', 'Poppins', sans-serif", fontSize: 'clamp(28px, 3.8vw, 44px)', fontWeight: '700', color: '#1C251D', margin: '8px 0 12px', letterSpacing: '-0.02em' }}>What is weighing on your mind?</h2>
            <p className="weighing-mind-sub" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', color: '#576359', maxWidth: '640px', margin: '0 auto', lineHeight: '1.55' }}>
              Burnout, overthinking, career decisions, relationships, or self doubt — click any topic below to start reflecting.
            </p>
          </div>

          {/* Organic Watercolor Pebble Word Cloud */}
          <OrganicPebbleWordCloud 
            onSelectWord={(word) => {
              setHeroInputText(`I want to reflect on ${word.toLowerCase()}...`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </motion.section>

      {/* 3RD SECTION: WHO THIS IS FOR */}
      <InteractiveWhoThisIsForSection sectionMotion={sectionMotion} stagger={stagger} item={item} />

      {/* 3RD SECTION: HOW IT WORKS */}
      <InteractiveHowItWorksSection sectionMotion={sectionMotion} stagger={stagger} item={item} />

      {/* 4TH SECTION: MODERN INTERACTIVE READING / QUOTIENT SECTION (WHAT THIS IS FOR) */}
      <motion.section className="section quotient" id="quotient" {...sectionMotion}>
        <div className="wrap">
          <div className="reading-header">
            <p className="eyebrow green-eyebrow"><i></i> YOUR DAILY CLARITY SCORE</p>
            <h2>A clear mirror<br/>for your <em>mind.</em></h2>
            <p className="reading-sub">Track how balanced you feel across 6 core areas of your life.</p>
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

      {/* 5TH SECTION: INTERACTIVE MIND MAP SECTION */}
      <CleanInteractiveMindMapSection />

      {/* 6TH SECTION: Comparison Table & Non-Scrollable Mobile Comparison View */}
      <section className="comparison">
        <div className="wrap">
          <div className="comparison-intro">
            <p className="eyebrow">Why not therapy, journaling, or ChatGPT?</p>
            <h2>Brihas brings together<br/>what others do <em>separately.</em></h2>
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
                  ['Action plan','Sometimes','No','No','✓ 3 & 7-Day Plans'],
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
                  ['Action plan', mobileCompTab === 'THERAPY' ? 'Sometimes' : 'No', '✓ 3 & 7-Day Plans'],
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

      {/* Plans Section - Prices Hidden */}
      <motion.section className="section plans" id="plans" {...sectionMotion}>
        <div className="wrap">
          <div className="centered-heading">
            <p className="eyebrow">Plans & Access</p>
            <h2>Choose your path to <em>daily clarity.</em></h2>
            <p>Start with a 7-day trial or select a plan tailored to your daily rhythm.</p>
          </div>

          {/* Introductory Trial Banner */}
          <motion.article className="simple-trial-card" {...item}>
            <div className="trial-left">
              <span className="trial-badge">⚡ 7-DAY TRIAL</span>
              <h3>Start with a 7-Day Trial</h3>
              <p>Experience daily Brihas conversations and get your first Quotient reading before committing.</p>
            </div>
            <div className="trial-middle">
              <span className="trial-chip">3 Sessions · 30 Mins Total</span>
            </div>
            <div className="trial-right">
              <a className="button button-dark" href="#plans">Start 7-Day Trial <Icon name="arrow"/></a>
            </div>
          </motion.article>

          {/* 3 Simple Main Plan Cards Side-by-Side (Prices Hidden) */}
          <motion.div className="simple-plan-grid" {...stagger}>
            {[
              {
                name: 'Reflect',
                subtitle: 'Light, steady check-ins to stay mindful.',
                allocation: '🌿 30 Sessions · 10 mins/day',
                features: [
                  'Daily 1:1 conversation at your pace',
                  'Full Brihas Quotient reading',
                  'Key insights saved in session notes',
                  '24/7 private access anytime'
                ],
                featured: false
              },
              {
                name: 'Converse',
                subtitle: 'For ongoing self-understanding & clarity.',
                allocation: '✨ 60 Sessions · 20 mins/day',
                features: [
                  'Everything in Reflect',
                  'All 6 Quotient dimensions in full detail',
                  'Weekly trends & progress comparison',
                  'Full Living Timeline & pattern tracking'
                ],
                featured: true
              },
              {
                name: 'Depth',
                subtitle: 'For working through major life transitions.',
                allocation: '🌌 120 Sessions · 40 mins/day',
                features: [
                  'Everything in Converse',
                  'Personalised 3 & 7-day action plans',
                  'Full interactive Mind Map access',
                  'Weekly review & direction compass'
                ],
                featured: false
              }
            ].map((plan) => (
              <motion.div 
                className={`simple-plan-card ${plan.featured ? 'featured-plan' : ''}`}
                key={plan.name}
                {...item}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
              >
                {plan.featured && <div className="popular-ribbon">⭐ MOST POPULAR</div>}
                
                <div className="plan-card-header">
                  <h3>{plan.name}</h3>
                  <p className="plan-subtitle">{plan.subtitle}</p>
                </div>

                <div className="plan-card-pricing" style={{ marginBottom: '20px' }}>
                  <div className="time-allocation-pill">
                    <span>{plan.allocation}</span>
                  </div>
                </div>

                <div className="plan-card-features">
                  <ul>
                    {plan.features.map(f => (
                      <li key={f}>
                        <Icon name="check" size={15}/> 
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="plan-card-action">
                  <a className={`button ${plan.featured ? 'button-dark' : 'button-outline'}`} style={{ width: '100%' }} href="#plans">
                    Get Started with {plan.name} <Icon name="arrow"/>
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <section className="faq wrap" id="faq">
        <div>
          <p className="eyebrow">FAQ</p>
          <h2>FAQ.</h2>
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
        <a className="brand" href="#top">brihas<span>.ai</span><sup>™</sup></a>
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
