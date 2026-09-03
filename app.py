import json
import os

from flask import Flask, render_template, request, jsonify, session
# import anthropic

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "love")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
LETTERS_FILE = os.path.join(DATA_DIR, "letters.json")
TODOS_FILE = os.path.join(DATA_DIR, "todos.json")

# Default user data (no auth — just names for personalization)
DEFAULT_USER = {"name": "Palvika", "partner": "Reman"}

def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)


def load_json_file(file_path, default):
    ensure_data_dir()
    if not os.path.exists(file_path):
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(default, f, ensure_ascii=False, indent=2)
        return default

    with open(file_path, "r", encoding="utf-8") as f:
        loaded = json.load(f)
    return loaded if loaded is not None else default


def save_json_file(file_path, payload):
    ensure_data_dir()
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def load_letters():
    ensure_data_dir()
    if not os.path.exists(LETTERS_FILE):
        default_letters = [
            {"locked": True,  "cd": "Unlocks on Janmastami Baby",    "from_": "A surprise for you",  "hint": "Written on a rainy Tuesday hehe...", "emoji": "💌", "message": "Every time the rain gets a little louder, I remember that even the hardest days can still end with us smiling at each other. I hope one day, when you open this, you feel my love waiting for you like a warm blanket."},
            {"locked": True,  "cd": "Unlocks on our anniversary",  "from_": "Year two letter",      "hint": "If you're reading this...",     "emoji": "📜", "message": "Happy anniversary, my love. Two years and still every day feels like a new beginning with you. You have made my world softer, brighter, and kinder. I am so lucky to love you."},
            {"locked": False, "cd": "My Apology to U hehe",   "from_": "My Apology to U",      "hint": "I wrote this while I felt i was disturbing you...", "emoji": "🎄", "message": "I am sorry for the times I made you feel unheard or too heavy to carry. You are never a burden to me. Even when my words are clumsy, my love for you is still steady and true."},
        ]
        with open(LETTERS_FILE, "w", encoding="utf-8") as f:
            json.dump(default_letters, f, ensure_ascii=False, indent=2)
        return default_letters

    with open(LETTERS_FILE, "r", encoding="utf-8") as f:
        loaded = json.load(f)

    return loaded if isinstance(loaded, list) else []


def save_letters():
    save_json_file(LETTERS_FILE, letters_store)


def load_todos():
    default_todos = [
        {"id": 1, "text": "Plan our next date night", "done": False},
        {"id": 2, "text": "Pick a new memory to save", "done": True},
    ]
    return load_json_file(TODOS_FILE, default_todos)


def save_todos():
    save_json_file(TODOS_FILE, shared_todos)


# In-memory store for letters & mood (replace with a DB for persistence)
letters_store = load_letters()

memories_store = [
    {"emoji": "🌅", "color": "rgba(244,165,192,0.15)", "date": "August 16, 2025",    "title": "Our first meet",    "text": "Hum first mile they us din.....near that temple. Haa wo random tha...but that was the most memorable moment in my life....mujhe abhi bhi yaad hain that eyes u made when u asked my name....",                       "tags": ["first", "love", "milestone"]},
    {"emoji": "...", "color": "rgba(240,200,122,0.15)", "date": "November 5, 2025",      "title": "Your 1st msg in insta",  "text": "I got your first message in instagram...it was short and brief...but it was one of the most unique moments in my life....and then ur cute apology came-about the day when I asked ur name...idk what i had to say....but...u are a paagliii!!",              "tags": ["first message", "instagram"]},
    {"emoji": "...", "color": "rgba(240,200,122,0.15)", "date": "December 23, 2025",      "title": "Your Bombay msg in insta!!",  "text": "I got your message from Bombay! It made my day. IDK why but main tumhara message ka hi wait kr tha pta nhi kiu",              "tags": ["Bombay message", "instagram"]},
    {"emoji": "...", "color": "rgba(240,200,122,0.15)", "date": "December 31, 2025",      "title": "Ur new year msg!!!",  "text": "I got your message on Christmas! Abhi bhi mujhe yaad hain us din tumne mujhe physics leke tease kiya tha.....but that day....u were the first person in my life whom i texted at exact midnight..<3",              "tags": ["New Year message", "instagram"]},
    {"emoji": "🌧️", "color": "rgba(138,180,248,0.15)", "date": "March, 2026", "title": "The After Lab evenings",       "text": "You called me first time that day...Ur bhondu bandar was a bit nervous hehe....but i still remember ur voice that day...",    "tags": ["movie", "cozy"]},
    {"emoji": "🥭", "color": "rgba(127,216,200,0.15)", "date": "March, 2026",  "title": "OUR MANGO LADAI",          "text": "Yaad hain us evening ka favourite fruit ka ladai....we found out that both of our favourite fruits are mango...:)",                    "tags": ["mango", "together"]},
    {"emoji": "🌸", "color": "rgba(184,169,245,0.15)", "date": "May 10, 2026", "title": "OUR Travel",              "text": "IK u were a bit of angry that day...but it feels totally different when u are with me...ur eyes specially...",                    "tags": ["travel", "together"]},
]

open_when_store = [
    {"type": "sad",     "emoji": "💙", "title": "Open when you're sad",    "sub": "A hug made of words, waiting for you.",           "message": "Palvika, sadness visits everyone — lekin it never stays forever. Right now, I want you to know that your pain is real, it's valid, and I see it. But here's what else is real: the way you make me laugh, the warmth you carry, how incredibly strong you are. This won't last. I promise. I'm right here, even when I'm far."},
    {"type": "love",    "emoji": "💕", "title": "Open when missing me",    "sub": "A reminder that distance is not goodbye.",         "message": "I know the distance between us feels heavy right now. Lekin missing someone means they've become part of your soul — and I am so deeply part of  Palvika, only your Bandar. Close your eyes. I'm right there with you. Always have been."},
    {"type": "anxious", "emoji": "🌸", "title": "Open when anxious",       "sub": "Breathe. I've got you.",                           "message": "Palvika. Breathe. In... and out. Tum akdum safe h0. Whatever storm is happening inside you — Ur bandar wants you to know that it will pass. You are not alone in this, ur bandar is always with you. Take it one breath at a time. I'll wait right here."},
    {"type": "fight",   "emoji": "🌅", "title": "Open after a fight",      "sub": "Because love is bigger than any argument.",        "message": "(Although abhi tk utna serious hua nhi-but keeping it) Palvika,I don't want to be right more than I want to be yours. Arguments come and go, but what we have is something rare. I'm sorry for any part I played that hurt you. You matter to me so much more than winning."},
    {"type": "lonely",  "emoji": "🌙", "title": "Open when lonely",        "sub": "You are never truly alone.",                       "message": "My cute princess-Palvika,Loneliness lies to you — it says no one cares, no one sees. But I do. I always do. Even across cities, my heart is turned toward yours. Look up at the sky tonight. We're under the same stars. Always."},
    {"type": "exam",    "emoji": "📚", "title": "Open during exams",       "sub": "You are brilliant. Remember that.",                "message": "Palvika,You have prepared for this. Every late night, every rereading, every moment of doubt you pushed through — it's all in you now. Go in there and show them who you are. And when it's over, I'll be here waiting to celebrate you....alabu"},
]

# Simple in-memory messages store for human-to-human chat
messages_store = []

# Shared relationship helpers
shared_todos = load_todos()

upcoming_events = [
    {"title": "Birthday celebration", "date": "2026-10-12", "description": "Cake, flowers, and a long call."},
    {"title": "Our anniversary", "date": "2026-12-12", "description": "A day to celebrate how far we've come."},
    {"title": "Holiday visit", "date": "2027-01-03", "description": "The next time we finally meet in person."},
]

virtual_gifts = [
    {"id": 1, "emoji": "🌹", "message": "A bouquet of love, ready for your next smile."},
    {"id": 2, "emoji": "💌", "message": "A handwritten note saying: I am proud of you."},
    {"id": 3, "emoji": "🍓", "message": "A sweet surprise for your sweetest heart."},
]


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    user = session.get("user", DEFAULT_USER)
    return render_template("index.html", user=user)


@app.route("/api/set-names", methods=["POST"])
def set_names():
    data = request.get_json()
    user = {
        "name":    data.get("name",    DEFAULT_USER["name"]),
        "partner": data.get("partner", DEFAULT_USER["partner"]),
    }
    session["user"] = user
    return jsonify({"ok": True, "user": user})


@app.route("/api/chat", methods=["POST"])
def chat():
    data      = request.get_json()
    message   = data.get("message", "")
    mode      = data.get("mode", "romantic")
    user_name = data.get("user_name",    DEFAULT_USER["name"])
    partner   = data.get("partner_name", DEFAULT_USER["partner"])

    mode_instructions = {
        "romantic": f"You are {partner}, a loving partner of {user_name} in a long-distance relationship. Be affectionate, warm, romantic, and deeply caring. Use terms of endearment. You can use Hindi words occasionally for authenticity.",
        "comfort":  f"You are {partner}, offering emotional comfort. Be gentle, soothing, empathetic. Help {user_name} feel safe and loved.",
        "playful":  f"You are {partner}, being playfully teasing and fun. Use gentle banter and humor. Keep it lighthearted and affectionate.",
        "study":    f"You are {partner}, acting as a study motivation partner. Encourage {user_name}, help them focus, mix motivation with affection.",
        "night":    f"You are {partner}, in a cozy late-night conversation. Be soft, dreamy, intimate. Talk about the stars, dreams, and being together soon.",
    }
    system_prompt = mode_instructions.get(mode, mode_instructions["romantic"])

    try:
        client = anthropic.Anthropic()
        response = client.messages.create(
            model      = "claude-sonnet-4-20250514",
            max_tokens = 1000,
            system     = system_prompt,
            messages   = [{"role": "user", "content": message}],
        )
        ai_text = response.content[0].text
        return jsonify({"reply": ai_text})
    except Exception as e:
        return jsonify({"reply": "I'm here with you,My Misti Princess, always. Even when words fail, my heart doesn't. 💕", "error": str(e)}), 200


@app.route("/api/memories")
def get_memories():
    return jsonify(memories_store)


@app.route("/api/open-when")
def get_open_when():
    user = session.get("user", DEFAULT_USER)
    cards = []
    for ow in open_when_store:
        c = dict(ow)
        c["message"] = c["message"].replace("{name}", user["name"])
        cards.append(c)
    return jsonify(cards)


@app.route("/api/letters")
def get_letters():
    return jsonify(letters_store)


@app.route("/api/letters", methods=["POST"])
def add_letter():
    data = request.get_json()
    text = data.get("text", "").strip()
    date = data.get("date", "")
    if not text:
        return jsonify({"ok": False, "error": "No text provided"}), 400
    from datetime import datetime
    try:
        d = datetime.strptime(date, "%Y-%m-%d").strftime("%B %d, %Y") if date else "Soon"
    except ValueError:
        d = "Soon"
    letter = {
        "locked": True,
        "cd":     f"Unlocks on {d}",
        "from_":  "A letter for you",
        "hint":   text[:40] + "...",
        "emoji":  "💌",
        "message": text,
    }
    letters_store.insert(0, letter)
    save_letters()
    return jsonify({"ok": True, "letter": letter})


# ── Simple chat storage endpoints (human chat) ──────────────────────────────
@app.route("/api/todos")
def get_todos():
    return jsonify(shared_todos)


@app.route("/api/todos", methods=["POST"])
def add_todo():
    data = request.get_json() or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"ok": False, "error": "No todo text provided"}), 400
    todo_id = max((todo.get("id", 0) for todo in shared_todos), default=0) + 1
    todo = {"id": todo_id, "text": text, "done": False}
    shared_todos.insert(0, todo)
    save_todos()
    return jsonify({"ok": True, "todo": todo})


@app.route("/api/todos/<int:todo_id>", methods=["PATCH"])
def toggle_todo(todo_id):
    for todo in shared_todos:
        if todo["id"] == todo_id:
            todo["done"] = not todo["done"]
            save_todos()
            return jsonify({"ok": True, "todo": todo})
    return jsonify({"ok": False, "error": "Todo not found"}), 404


@app.route("/api/events")
def get_events():
    return jsonify(upcoming_events)


@app.route("/api/gifts")
def get_gifts():
    return jsonify(virtual_gifts)


@app.route("/api/gifts", methods=["POST"])
def add_gift():
    data = request.get_json() or {}
    emoji = (data.get("gift") or "💌").strip()
    message = (data.get("message") or "A little love for your day.").strip()
    gift = {"id": len(virtual_gifts) + 1, "emoji": emoji, "message": message}
    virtual_gifts.insert(0, gift)
    return jsonify({"ok": True, "gift": gift})


@app.route("/api/messages")
def get_messages():
    return jsonify(messages_store)


@app.route("/api/send-message", methods=["POST"])
def send_message():
    data = request.get_json() or {}
    sender = data.get("sender", DEFAULT_USER["name"]).strip()
    text = data.get("message", "").strip()
    if not text:
        return jsonify({"ok": False, "error": "No message"}), 400
    from datetime import datetime
    msg = {"sender": sender, "text": text, "ts": datetime.utcnow().isoformat()}
    messages_store.append(msg)
    return jsonify({"ok": True, "message": msg})


@app.route('/reman')
def reman():
    # Minimal page the other person (Reman) can use to send messages
    user = session.get("user", DEFAULT_USER)
    return render_template('reman.html', user=user)


if __name__ == "__main__":
    app.run(debug=True)
