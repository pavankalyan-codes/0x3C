📘 0x3C — Product Requirements Document (PRD)
1. Product Overview

Product Name: 0x3C
Tagline: Tech, in 60 seconds.

0x3C is an open-source, card-based micro-learning application for engineers.
Each card explains one technical concept (e.g., TCP, UDP, IPv6, Round Robin) in under 60 seconds using clean visuals and concise content.

The application consumes JSON-based content, allowing anyone to contribute new learning cards via GitHub.

2. Core Principles

⏱ One concept per card

🧠 60 seconds max reading time

🎨 Beautiful, minimal, dark-mode-first UI

📄 Content driven entirely by JSON

🌍 Open-source & community-editable

🚫 No user login required (v1)

3. Target Audience

Software engineers

Backend / cloud / system design learners

Students preparing for interviews

Engineers who prefer fast, visual learning

4. Functional Requirements
4.1 Card Experience

Each screen shows exactly one card

Card contains:

Title

Short explanation (bullet points preferred)

Optional diagram hint / emoji

Estimated reading time (≤ 60 sec)

Users can:

Swipe / click Next

Swipe / click Previous

Smooth transitions between cards

4.2 Content Source (JSON-Driven)

All learning content must come from static JSON files

No hardcoded learning content in UI

JSON can be:

Local file

Remote (GitHub raw URL)

App should re-render automatically when JSON schema is valid

4.3 Open Source Contribution Model

JSON files live in a /content directory

Anyone can:

Fork repo

Add or edit cards

Raise PR

Clear contribution guidelines required

4.4 Categories / Topics

Cards should support grouping by category:

Examples:

Networking

Cloud

System Design

OS

Security

Filtering by category is optional (v1.1)

5. Non-Functional Requirements

⚡ Fast load time

📱 Fully responsive (mobile-first)

🌙 Dark mode default

♿ Basic accessibility (readable contrast, font size)

🚀 Deployable as static site

6. JSON Schema (Content Contract)
6.1 Card JSON Structure
{
  "id": "tcp-vs-udp",
  "title": "TCP vs UDP",
  "category": "Networking",
  "difficulty": "Beginner",
  "readTimeSec": 45,
  "content": [
    "TCP is connection-oriented and reliable",
    "UDP is connectionless and faster",
    "TCP guarantees delivery, UDP does not"
  ],
  "tags": ["tcp", "udp", "protocols"],
  "source": "RFC 793"
}

6.2 Content Rules

readTimeSec must be ≤ 60

content should have 3–6 bullet points max

Language must be:

Simple

Neutral

No emojis in JSON (UI may add)

id must be unique

7. App Architecture (High-Level)
Frontend

Reads JSON at startup

Converts JSON objects → card components

Stateless UI (v1)

Data Flow
JSON File → Parser → Card Model → Card UI

8. UI / UX Guidelines

Monospace font preferred (JetBrains Mono / IBM Plex Mono)

Card layout:

Title (bold)

Divider

Bullet points

Footer (⏱ time + category)

Animations:

Subtle fade / slide

No heavy motion

9. Error Handling

If JSON is invalid:

Show developer-friendly error

If card content exceeds limits:

Ignore card and log warning

App must not crash due to bad content

10. Future Enhancements (Out of Scope for v1)

Search

Bookmarks

Offline mode

Progress tracking

User accounts

Markdown support

11. LLM Prompt (Ready to Use)

Build a card-based micro-learning web app called 0x3C.
The app must load all card content from JSON files.
Each card represents one technical concept and must be readable in under 60 seconds.
The UI should be dark-mode, minimal, and optimized for swipe navigation.
The content must be open-source and editable via JSON without touching UI code.

12. Success Criteria

Cards can be added without code changes

App renders new content automatically

First-time users understand a concept in < 1 minute

Repo is contributor-friendly

13. Repository Structure (Suggested)
/0x3C
 ├── /content
 │    ├── networking.json
 │    ├── cloud.json
 │    └── system-design.json
 ├── /src
 ├── CONTRIBUTING.md
 ├── README.md
 └── LICENSE