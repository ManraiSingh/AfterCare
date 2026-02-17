import os
import requests
from dotenv import load_dotenv
from flask import request, Flask, Response, jsonify
from flask_cors import CORS
import care

app = Flask(__name__)
CORS(app)

# LOAD ENV
load_dotenv()

OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_KEY:
    print("❌ OPENROUTER_API_KEY not found")


# ================= VIDEO =================
@app.route("/video")
def video():
    return Response(
        care.generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


# ================= STATS =================
@app.route("/stats")
def stats():
    return jsonify({
        "sit": care.sit_reps,
        "arm": care.arm_reps,
        "march": care.march_steps
    })


# ================= CHATBOT =================
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json or {}

        print("📩 Incoming:", data)

        user_msg = data.get("message", "")
        disease = data.get("disease", "general recovery")
        score = data.get("score", 0)

        if not user_msg:
            return jsonify({"reply": "Ask something about recovery 😊"})

        prompt = f"""
You are a healthcare recovery assistant.

Patient disease: {disease}
Recovery score: {score}/100

Rules:
- Only GENERAL wellness advice
- No diagnosis
- No medicines or dosages
- Suggest doctor if serious
- Keep replies short (3–4 lines)

User question:
{user_msg}
"""

        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-3.5-turbo",  # free & reliable
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            },
            timeout=30
        )

        result = response.json()

        reply = result["choices"][0]["message"]["content"]

        print("🤖 AI:", reply)

        return jsonify({"reply": reply})

    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({
            "reply": "I'm having trouble right now. Please try again."
        })


# ================= RUN =================
if __name__ == "__main__":
    app.run(port=5000, debug=True)