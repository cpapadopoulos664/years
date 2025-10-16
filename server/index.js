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

// Persistence for daily progress
const dataDir = path.join(__dirname);
const dataPath = path.join(dataDir, 'data.json');

function readState() {
  if (!fs.existsSync(dataPath)) {
    return { filledCount: 0, lastFillDate: null };
  }
  try {
    const content = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(content);
  } catch (_e) {
    return { filledCount: 0, lastFillDate: null };
  }
}

function writeState(state) {
  fs.writeFileSync(dataPath, JSON.stringify(state, null, 2));
}

function todayKey(date = new Date()) {
  // Use UTC date so day boundaries are consistent regardless of server TZ
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function advanceOnePerDay() {
  const state = readState();
  const currentDay = todayKey();

  if (state.filledCount >= TOTAL_BOXES) {
    return state;
  }

  if (state.lastFillDate !== currentDay) {
    state.filledCount = Math.min(TOTAL_BOXES, (state.filledCount || 0) + 1);
    state.lastFillDate = currentDay;
    writeState(state);
  }
  return state;
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

// Daily fill progress endpoint
app.get('/api/progress', (_req, res) => {
  const state = advanceOnePerDay();
  res.json({
    filledCount: state.filledCount,
    lastFillDate: state.lastFillDate,
  });
});

// Fallback to SPA (match any non-API route)
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  // Ensure state file exists on startup
  const state = readState();
  if (state.filledCount > TOTAL_BOXES) {
    writeState({ filledCount: TOTAL_BOXES, lastFillDate: state.lastFillDate });
  } else if (!fs.existsSync(dataPath)) {
    writeState({ filledCount: state.filledCount || 0, lastFillDate: state.lastFillDate });
  }
  console.log(`Server running on http://localhost:${PORT}`);
});


