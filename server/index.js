const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Config
const TOTAL_BOXES = 25185;
const PER_COLUMN = 1000; // 1,000 boxes per column
const GREEN_COUNT = 3285;
const BLUE_COUNT = 14600;
const RED_COUNT = TOTAL_BOXES - GREEN_COUNT - BLUE_COUNT; // remaining

// Date utilities (UTC-based)
function todayKey(date = new Date()) {
  // Use UTC date so day boundaries are consistent regardless of server TZ
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Fixed start date: count days passed since 2025-10-16 (exclusive)
// i.e., 2025-10-16 => 0, 2025-10-17 => 1, etc.
const START_DATE_UTC = new Date(Date.UTC(2025, 9, 16)); // months are 0-based

function utcMidnight(date) {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  );
}

function computeFilledFromStart(today = new Date()) {
  const diffMs = utcMidnight(today) - START_DATE_UTC;
  if (diffMs < 0) return 0; // before start date
  const daysElapsed = Math.floor(diffMs / 86400000);
  const inclusiveCount = daysElapsed + 1; // count start day as day 1
  return Math.min(TOTAL_BOXES, inclusiveCount);
}

// Health and config endpoint
app.get('/api/config', (_req, res) => {
  res.json({
    totalBoxes: TOTAL_BOXES,
    perColumn: PER_COLUMN,
    greenCount: GREEN_COUNT,
    blueCount: BLUE_COUNT,
    redCount: RED_COUNT,
  });
});

// Daily fill progress endpoint (derived from fixed start date)
app.get('/api/progress', (_req, res) => {
  const filledCount = computeFilledFromStart();
  res.json({
    filledCount,
    sinceDate: todayKey(START_DATE_UTC),
  });
});

// Fallback to SPA (match any non-API route)
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


