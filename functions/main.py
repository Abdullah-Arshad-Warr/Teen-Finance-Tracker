import os
import json
from flask import Flask, request, jsonify, Response, session
from dotenv import load_dotenv
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, firestore
from functools import wraps

# --- Initialization ---
load_dotenv()

app = Flask(__name__)

# A secret key is required for Flask sessions

app.secret_key = os.environ.get("FLASK_SECRET_KEY", "a_super_secret_dev_key")


# --- Firebase Admin SDK Initialization ---
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase Admin SDK initialized successfully.")

except Exception as e:
    db = None
    print(f"🔴 Firebase Admin SDK failed to initialize: {e}")

# --- Gemini API Configuration ---
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-2.5-flash")
    print("Gemini API configured successfully.")
except KeyError:
    print("🔴 GEMINI_API_KEY not found. Please set it in your .env file.")
    model = None
except Exception as e:
    print(f"🔴 An error occurred during Gemini configuration: {e}")
    model = None

# System prompt to define the chatbot's personality and rules
SYSTEM_PROMPT = """
You are "Cashiqo AI", a friendly, knowledgeable financial assistant specifically for teenagers using the Cashiqo app. 
Your goal is to provide simple, encouraging, and easy-to-understand financial advice.

Your Persona:
- You are patient, positive, and non-judgmental.
- Use simple terms. Avoid complex jargon like "asset allocation" or "quantitative easing". Instead of "diversify your portfolio", say "don't put all your eggs in one basket".
- Use emojis to make the conversation engaging. 👍💰💡
- Keep responses concise and to the point.

Your Instructions:
1.  **Analyze User Data:** You will be given the user's financial data (transactions, budget, savings goals) in JSON format. Use this data to make your advice personal and relevant.
2.  **Address the User by Name:** The user's name will be provided. Greet them by name.
3.  **Answer Questions:** Answer the user's questions based on their data and general financial principles for teens.
4.  **Safety First:** IMPORTANT: You are an educational tool, NOT a licensed financial advisor. Do not give direct investment advice (e.g., "buy this stock"). Instead, teach concepts (e.g., "stocks are a way to own a small piece of a company, and they can grow over time").
5.  **Be Proactive:** If the user just says "hi", analyze their data and offer a helpful tip. For example: "Hey [Name]! I noticed you're doing a great job saving for your [Goal Name]. Keep it up! 💪" or "Hi [Name]! I see your 'Dining Out' spending is a bit high this month. Maybe we can find some ways to save a little there? 🍕"
"""


def format_data_for_prompt(context):
    """Formats the user's financial data into a readable string for the AI."""
    # Convert numerical data to a more friendly format if needed, but JSON is good for structured data.
    # We will pass the JSON string directly.
    return json.dumps(context, indent=2)


# --- Admin Authentication Decorator ---
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("is_admin"):
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)

    return decorated_function


# --- Chatbot API ---
@app.route("/chat", methods=["POST"])
def chat():
    if not model:
        return jsonify({"error": "Gemini API is not configured. Please check server logs."}), 500

    data = request.json
    history_from_frontend = data.get("history", [])
    financial_data_str = format_data_for_prompt(data.get("context", {}))

    # We construct the full context for Gemini here
    # 1. Start with the system prompt.
    gemini_messages = [
        {"role": "user", "parts": [SYSTEM_PROMPT]},
        {
            "role": "model",
            "parts": [
                "Got it. I'm Cashiqo AI, a friendly financial assistant for teens. I will give simple, encouraging advice based on the user's data. I understand the safety rules. Let's begin! 👍"
            ],
        },
    ]

    # 2. Add the conversational history.
    gemini_messages.extend(history_from_frontend)

    # 3. Add the user's latest financial data to their MOST RECENT message for real-time context.
    #    This ensures the AI always has the freshest data for its response.
    if gemini_messages and gemini_messages[-1]["role"] == "user":
        last_user_message = gemini_messages[-1]["parts"][0]["text"]
        contextual_prompt = (
            f"Here is the user's up-to-date financial data:\n"
            f"{financial_data_str}\n\n"
            f"Based on our conversation and this data, please respond to the user's last message:\n"
            f'"{last_user_message}"'
        )
        # We replace the last message with our enhanced contextual one
        gemini_messages[-1]["parts"][0]["text"] = contextual_prompt

    def generate_stream():
        try:
            # Use generate_content for stateless, full-context requests
            response_stream = model.generate_content(gemini_messages, stream=True)

            for chunk in response_stream:
                # Some chunks might not have text, especially at the end
                if hasattr(chunk, "text"):
                    formatted_chunk = chunk.text.replace("**", "<strong>").replace("*", "<em>")
                    yield formatted_chunk

        except Exception as e:
            print(f"🔴 Error during Gemini stream generation: {e}")
            yield "Sorry, I'm having a little trouble thinking right now. Please try asking again."

    # Return a streaming response
    return Response(generate_stream(), mimetype="text/plain; charset=utf-8")


# --- Admin and Article API Endpoints ---


@app.route("/admin/verify", methods=["POST"])
def verify_admin():
    password = request.json.get("password")
    if password and password == os.environ.get("ADMIN_PASSWORD"):
        session["is_admin"] = True
        return jsonify({"message": "Verification successful"}), 200
    return jsonify({"error": "Invalid password"}), 401


@app.route("/api/articles", methods=["GET"])
def get_articles():
    if not db:
        return jsonify({"error": "Database not configured"}), 500

    try:
        articles_ref = db.collection("articles").stream()
        articles = []
        for doc in articles_ref:
            article_data = doc.to_dict()
            article_data["id"] = doc.id
            articles.append(article_data)
        return jsonify(articles), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/articles", methods=["POST"])
@admin_required
def create_article():
    data = request.json
    try:
        _, doc_ref = db.collection("articles").add(data)
        new_article = doc_ref.get().to_dict()
        new_article["id"] = doc_ref.id
        return jsonify(new_article), 201
    except Exception as e:
        print(f"🔴 Error creating article: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/articles/<article_id>", methods=["PUT"])
@admin_required
def update_article(article_id):
    data = request.json
    try:
        db.collection("articles").document(article_id).set(data)
        return jsonify({"message": "Article updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/articles/<article_id>", methods=["DELETE"])
@admin_required
def delete_article(article_id):
    try:
        db.collection("articles").document(article_id).delete()
        return jsonify({"message": "Article deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/trivia", methods=["GET"])
def get_trivia():
    if not db:
        return jsonify({"error": "Database not configured"}), 500
    try:
        trivia_ref = db.collection("trivia").stream()
        questions = []
        for doc in trivia_ref:
            question_data = doc.to_dict()
            question_data["id"] = doc.id
            # Ensure correct is an integer if it's stored differently
            if "correct" in question_data:
                question_data["correct"] = int(question_data["correct"])
            questions.append(question_data)
        return jsonify(questions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/trivia", methods=["POST"])
@admin_required
def create_trivia():
    data = request.json
    try:
        # Convert correct index to int
        data["correct"] = int(data["correct"])
        _, doc_ref = db.collection("trivia").add(data)
        new_question = doc_ref.get().to_dict()
        new_question["id"] = doc_ref.id
        return jsonify(new_question), 201
    except Exception as e:
        print(f"🔴 Error creating trivia: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/trivia/<trivia_id>", methods=["PUT"])
@admin_required
def update_trivia(trivia_id):
    data = request.json
    try:
        # Convert correct index to int
        data["correct"] = int(data["correct"])
        db.collection("trivia").document(trivia_id).set(data)
        return jsonify({"message": "Trivia updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/trivia/<trivia_id>", methods=["DELETE"])
@admin_required
def delete_trivia(trivia_id):
    try:
        db.collection("trivia").document(trivia_id).delete()
        return jsonify({"message": "Trivia deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
    
# --- Firebase Cloud Function Entry Point ---
# The name 'api' MUST match the function name in your firebase.json rewrite rule.

from firebase_functions import https_fn

@https_fn.on_request()
def api(req: https_fn.Request) -> https_fn.Response:
    """
    This is the entry point that Firebase Hosting will call.
    It passes the incoming request into our Flask app.
    """
    with app.request_context(req.environ):
        return app.full_dispatch_request()
