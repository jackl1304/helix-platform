// ========================================
// SAFE RENDER UTILITIES
// - Verhindern React-Fehler: "Objects are not valid as a React child"
// - Liefert stets Strings für Textausgabe in JSX
// ========================================

import React from 'react';
import { safeArray } from './array-safety';

export function safeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  const valueType = typeof value;
  if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
    return String(value);
  }
  try {
    if (Array.isArray(value)) {
      return safeArray(value).map((v) => safeText(v)).join(', ');
    }
    if (valueType === 'object') {
      return JSON.stringify(value);
    }
  } catch (_err) {
    return '';
  }
  return '';
}

export function SafeText({ value, maxLength = 0, placeholder = '' }: { value: unknown; maxLength?: number; placeholder?: string }) {
  const txt = safeText(value);
  const out = maxLength && txt.length > maxLength ? txt.slice(0, maxLength) + '…' : txt;
  return <>{out || placeholder}</>;
}

export function safeArrayText(values: unknown): string[] {
  return safeArray(values).map((v) => safeText(v));
}



