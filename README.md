# Our Space — Flask App

## Project Structure

```
our_space/
├── app.py                  # Flask application & API routes
├── requirements.txt
├── templates/
│   └── index.html          # Jinja2 template (full UI)
└── static/
    ├── css/
    │   └── style.css       # All styling (identical design to original)
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

Then open **http://127.0.0.1:5000** in your browser.

## API Routes

| Method | Route            | Description                          |
|--------|------------------|--------------------------------------|
| GET    | `/`              | Serve the main page                  |
| POST   | `/api/set-names` | Save your name & partner's name      |
| POST   | `/api/chat`      | AI companion chat (calls Claude API) |
| GET    | `/api/memories`  | Fetch memory cards                   |
| GET    | `/api/open-when` | Fetch "open when" letters            |
| GET    | `/api/letters`   | Fetch future letters                 |
| POST   | `/api/letters`   | Add a new sealed letter              |

## Changes from Original

- **No authentication** — clicking "Enter Our Space" shows a simple name-setup modal instead of a login form.
- **API key** lives server-side (environment variable `ANTHROPIC_API_KEY`) — never exposed to the browser.
- **Data served via Flask routes** — memories, open-when cards, and letters are fetched from the backend via `fetch()` calls.
- **Session-based names** — your name/partner name are persisted server-side in Flask's session.
- **Identical design** — all CSS variables, animations, fonts, and layout are exactly as in the original.

## Adding a Database (optional)

Replace the in-memory lists in `app.py` (`letters_store`, `memories_store`) with SQLAlchemy models for persistence across restarts. A SQLite setup requires only:

```bash
pip install flask-sqlalchemy
```
