# Years Grid

A tiny site that visualizes 25,185 boxes in a grid (1,000 per column). Boxes fill one per UTC day computed from a fixed start date (2025-10-16). Color distribution:

- Green: first 3,285
- Blue: next 14,600
- Red: remaining

## Development

1. Install dependencies:

```bash
npm install
```

2. Start server:

```bash
npm start
```

Open `http://localhost:3000`.

Progress is derived from the fixed start date (2025-10-16) and does not persist to disk. Day boundaries use UTC.


