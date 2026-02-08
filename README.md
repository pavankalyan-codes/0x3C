# 0x3C

Tech, in 60 seconds.

0x3C is an open-source, card-based micro-learning app for engineers. Each card is a single concept, readable in under 60 seconds. All content is JSON-driven.

## Quick Start

1. Serve the folder with a static server.
2. Open `index.html` in your browser.

Example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Content

Cards live in `content/` as JSON arrays. Each object must follow the schema in `agents.md`.

You can also load a remote JSON file by passing `?src=`:

```
http://localhost:8080/?src=https://raw.githubusercontent.com/your-org/your-repo/main/content/networking.json
```

## Contributing

See `CONTRIBUTING.md` for how to add new cards.
