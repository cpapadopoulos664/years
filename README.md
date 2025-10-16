# Years Grid

A tiny site that visualizes 25,185 boxes in a grid (1,000 per column). Boxes fill one per day on the server until all are filled. Color distribution:

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

Progress persists in `server/data.json`. Day boundaries use UTC.


