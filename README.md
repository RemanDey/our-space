# Our Space

A private, shared digital space for long-distance couples.

## Project Structure

```
our_space/
├── app.py                  # Flask application & API routes
├── requirements.txt
├── advancements.md         # Feature ideas & roadmap
├── templates/
│   ├── index.html          # Main dashboard (full UI)
│   └── reman.html          # Lightweight chat page for partner
└── static/
    ├── css/
    │   └── style.css       # All styling
    └── js/
        └── main.js         # Stars, typewriter, API calls, UI logic
```

## Setup & Run

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set your Anthropic API key (needed for AI chat)
export ANTHROPIC_API_KEY="sk-ant-..."   # Windows: set ANTHROPIC_API_KEY=sk-ant-...

# 4. Run the app
python app.py
```

Then open **http://127.0.0.1:5000** in your browser. Your partner can use **http://127.0.0.1:5000/reman** for a lightweight chat interface.

## Features

- 🌟 **Starry landing page** — animated canvas starfield with typewriter effect
- 📊 **Dashboard** — distance, countdown, days together, time, mood tracker, relationship stats
- 💬 **Shared chat** — real-time messaging between partners (poll-based)
- 🤖 **AI companion** — 5 chat modes (romantic, comfort, playful, study, late-night) powered by Claude
- 📸 **Memories** — scrapbook of memory cards with dates and tags
- 💌 **Open When letters** — pre-written letters for specific moods (sad, missing me, anxious, after a fight, lonely, during exams)
- 🔐 **Future letters** — time-locked letters with future unlock dates
- 🌈 **Personalized** — name setup modal replaces traditional auth
- 🕹️ **Easter eggs** — Konami Code, clickable stars

## API Routes

| Method | Route              | Description                          |
|--------|--------------------|--------------------------------------|
| GET    | `/`                | Serve the main page                  |
| GET    | `/reman`           | Lightweight chat page                |
| POST   | `/api/set-names`   | Save your name & partner's name      |
| POST   | `/api/chat`        | AI companion chat (calls Claude API) |
| GET    | `/api/memories`    | Fetch memory cards                   |
| GET    | `/api/open-when`   | Fetch "open when" letters            |
| GET    | `/api/letters`     | Fetch future letters                 |
| POST   | `/api/letters`     | Add a new sealed letter              |
| GET    | `/api/messages`    | Fetch human chat messages            |
| POST   | `/api/send-message`| Send a chat message                  |

## Tech Stack

| Component   | Technology                             |
|-------------|----------------------------------------|
| Backend     | Python 3 + Flask                       |
| Frontend    | Vanilla JS, HTML5, CSS3                |
| AI          | Anthropic Claude API                   |
| Storage     | In-memory Python lists (no database)   |
| Session     | Flask signed cookies                   |

## Future Ideas

See [`advancements.md`](advancements.md) for a full list of planned features and improvements, including SQLite persistence, real-time WebSockets, PWA support, and more.

## Adding a Database (optional)

Replace the in-memory lists in `app.py` (`letters_store`, `memories_store`) with SQLAlchemy models for persistence across restarts:

```bash
pip install flask-sqlalchemy
```
