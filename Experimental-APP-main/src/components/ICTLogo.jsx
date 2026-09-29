// src/components/ICTLogo.jsx
import React from 'react';

/**
 * CodeStack Schedule Logo Symbol (SVG)
 * Replicates the official branding:
 * - Segmented circular track (pastel turquoise, orange, purple)
 * - Calendar icon with top banner & rings, code braces { /}
 * - Clock hands forming a checkmark (orange short hand, purple long hand)
 */
export const CodeStackIconSymbol = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <clipPath id="calendarBodyClip">
          <rect x="28" y="37" width="44" height="39" rx="8" ry="8" />
        </clipPath>
        <filter id="csShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* --- Outer Segmented Ring (R = 43) --- */}
      {/* Top-Right Arc: Pastel Orange */}
      <path
        d="M 57 7.5 A 43 43 0 0 1 87.5 28"
        stroke="#F49760"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {/* Right/Bottom-Right Arc: Pastel Purple */}
      <path
        d="M 92.5 43.5 A 43 43 0 0 1 61.5 92.5"
        stroke="#9897DA"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {/* Bottom-Left Arc: Pastel Teal */}
      <path
        d="M 45 92.5 A 43 43 0 0 1 7.5 56.5"
        stroke="#6BB6BD"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {/* Top-Left Arc: Pastel Teal */}
      <path
        d="M 7.5 43.5 A 43 43 0 0 1 45 7.5"
        stroke="#6BB6BD"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      {/* --- Inner Concentric Segmented Ring (R = 34) --- */}
      <path
        d="M 16.5 47 A 34 34 0 0 1 47 16.5"
        stroke="#6BB6BD"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M 47 83.5 A 34 34 0 0 1 16.5 53"
        stroke="#6BB6BD"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M 83.5 53 A 34 34 0 0 1 53 83.5"
        stroke="#6BB6BD"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Axis Marker Ticks */}
      <line x1="50" y1="7.5" x2="50" y2="16.5" stroke="#6BB6BD" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="50" y1="83.5" x2="50" y2="92.5" stroke="#6BB6BD" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="7.5" y1="50" x2="16.5" y2="50" stroke="#6BB6BD" strokeWidth="2.2" strokeLinecap="round" />

      {/* --- Calendar Face --- */}
      <g filter="url(#csShadow)">
        {/* Calendar Body (Soft Light Background) */}
        <rect
          x="28"
          y="37"
          width="44"
          height="39"
          rx="8"
          ry="8"
          fill="#FFFDF7"
          stroke="#6BB6BD"
          strokeWidth="3"
        />

        {/* Top Header Banner */}
        <g clipPath="url(#calendarBodyClip)">
          <rect x="27" y="36" width="46" height="12" fill="#7CBEC4" />
        </g>

        {/* Binder Rings (2 loops at top) */}
        <rect x="36" y="31" width="4.5" height="10" rx="2.25" fill="#6BB6BD" />
        <rect x="59.5" y="31" width="4.5" height="10" rx="2.25" fill="#6BB6BD" />

        {/* Code Braces { /} inside calendar body */}
        <text
          x="33"
          y="66"
          fill="#5AA8B0"
          fontSize="14"
          fontWeight="800"
          fontFamily="'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
        >
          {'{'}
        </text>
        <text
          x="53"
          y="66"
          fill="#5AA8B0"
          fontSize="13"
          fontWeight="800"
          fontFamily="'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
        >
          {'/}'}
        </text>

        {/* --- Clock Hands / Checkmark --- */}
        {/* Short Orange Hand (10 o'clock) */}
        <line
          x1="50"
          y1="53"
          x2="34"
          y2="41"
          stroke="#F49760"
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Long Purple Hand / Checkmark (extends past top right) */}
        <line
          x1="50"
          y1="53"
          x2="74"
          y2="26"
          stroke="#9897DA"
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Center Clock Pivot */}
        <circle cx="50" cy="53" r="4.6" fill="#9897DA" />
      </g>
    </svg>
  );
};

export const ICTLogo = ({
  variant = 'light', // 'light' | 'dark'
  iconOnly = false,
  size = 40,
  showSubtext = true,
  onClick,
}) => {
  const isDark = variant === 'dark';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {/* CodeStack Schedule Icon */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.26)}px`,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(107, 182, 189, 0.25)',
          boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.35)' : '0 4px 14px rgba(107, 182, 189, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          padding: '2px',
          transition: 'transform 180ms ease, box-shadow 180ms ease',
        }}
      >
        <CodeStackIconSymbol size={Math.round(size * 0.9)} />
      </div>

      {/* Brand Text */}
      {!iconOnly && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                fontWeight: 900,
                fontSize: `${size * 0.44}px`,
                letterSpacing: '-0.01em',
                color: isDark ? '#7CD5DF' : '#4FA3AC',
                fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              }}
            >
              CODESTACK
            </span>
            <span
              style={{
                fontWeight: 900,
                fontSize: `${size * 0.44}px`,
                letterSpacing: '-0.01em',
                color: '#F49760',
                fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              }}
            >
              SCHEDULE
            </span>
          </div>
          {showSubtext && (
            <span
              style={{
                fontSize: `${Math.max(size * 0.25, 10)}px`,
                fontWeight: 500,
                color: isDark ? '#94A3B8' : '#64748B',
                letterSpacing: '0.02em',
                marginTop: '1px',
              }}
            >
              Smart Schedule & Productivity
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const CodeStackLogo = ICTLogo;
