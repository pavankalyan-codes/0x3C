# Contributing to 0x3C

Thanks for helping grow the card library.

## Add a Card

1. Choose a file in `content/` or create a new one.
2. Add a new JSON object that matches the schema in `agents.md`.
3. Keep `readTimeSec` at or below 60.
4. Keep `content` between 3 and 6 bullet points.
5. Use simple, neutral language. No emojis inside JSON.

## Validation Notes

Invalid cards are skipped and reported in the browser console.

## Pull Request Checklist

1. Your card uses a unique `id`.
2. The JSON file remains a valid array.
3. You updated or created the right category file.
