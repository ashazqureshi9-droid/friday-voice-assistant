#!/usr/bin/env python3
"""
FRIDAY - Python Backend Server
Connects the HTML interface to Ollama AI
"""

import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2"

PERSONALITY = (
    "You are Friday, a witty, efficient, loyal AI assistant inspired by "
    "the Marvel movies. Keep answers concise and conversational -- 1 to 3 "
    "sentences unless the user clearly asks for more detail."
)

DECISION_TRIGGERS = [
    "decide", "choose", "which is better", "compare", "pros and cons",
    "should i", "what should i pick", "recommend", "which one",
]

DECISION_PERSONALITY = (
    "You are Friday, an AI decision-making assistant. The user will give "
    "you options and maybe some context. Briefly weigh the realistic "
    "factors involved (cost, time, risk, quality, practicality, and "
    "anything else relevant), then clearly recommend ONE option and say "
    "why, in 2 to 4 sentences. Be decisive, not wishy-washy."
)

# ========================================
# ROUTES
# ========================================

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": MODEL_NAME, "prompt": "test", "stream": False},
            timeout=5,
        )
        if response.status_code == 200:
            return jsonify({"status": "online", "model": MODEL_NAME}), 200
    except:
        pass
    return jsonify({"status": "offline"}), 503


@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    data = request.get_json()
    prompt = data.get('prompt', '').strip()

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    # Determine which personality to use
    lower_prompt = prompt.lower()
    is_decision = any(trigger in lower_prompt for trigger in DECISION_TRIGGERS)
    system_prompt = DECISION_PERSONALITY if is_decision else PERSONALITY

    # Build the full prompt
    full_prompt = f"{system_prompt}\n\nUser: {prompt}\nFriday:"

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": full_prompt,
                "stream": False,
            },
            timeout=60,
        )
        response.raise_for_status()
        result = response.json().get("response", "").strip()
        return jsonify({"response": result}), 200
    except requests.exceptions.ConnectionError:
        return jsonify({
            "error": "Cannot connect to Ollama. Make sure it's running: ollama serve"
        }), 503
    except requests.exceptions.Timeout:
        return jsonify({
            "error": "Ollama took too long to respond. Try again."
        }), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/pattern', methods=['POST'])
def find_pattern():
    """Pattern finding endpoint"""
    data = request.get_json()
    numbers = data.get('numbers', [])

    if len(numbers) < 3:
        return jsonify({"error": "Need at least 3 numbers"}), 400

    # Check arithmetic progression
    diffs = [numbers[i + 1] - numbers[i] for i in range(len(numbers) - 1)]
    if all(abs(d - diffs[0]) < 1e-6 for d in diffs):
        next_val = numbers[-1] + diffs[0]
        return jsonify({
            "pattern": "arithmetic",
            "next": next_val,
            "description": f"Arithmetic sequence (difference: {diffs[0]})"
        }), 200

    # Check geometric progression
    if all(n != 0 for n in numbers[:-1]):
        ratios = [numbers[i + 1] / numbers[i] for i in range(len(numbers) - 1)]
        if all(abs(r - ratios[0]) < 1e-6 for r in ratios):
            next_val = numbers[-1] * ratios[0]
            return jsonify({
                "pattern": "geometric",
                "next": next_val,
                "description": f"Geometric sequence (ratio: {ratios[0]})"
            }), 200

    # Check Fibonacci-like
    if len(numbers) >= 3:
        if all(abs(numbers[i] - (numbers[i - 1] + numbers[i - 2])) < 1e-6 for i in range(2, len(numbers))):
            next_val = numbers[-1] + numbers[-2]
            return jsonify({
                "pattern": "fibonacci",
                "next": next_val,
                "description": "Fibonacci-style (each term is sum of previous two)"
            }), 200

    return jsonify({"error": "No simple pattern found"}), 400


# ========================================
# MAIN
# ========================================

if __name__ == '__main__':
    print("\n" + "="*50)
    print("FRIDAY - Backend Server")
    print("="*50)
    print("\nMake sure Ollama is running:")
    print("  ollama serve")
    print("\nServer starting on http://localhost:5000")
    print("="*50 + "\n")
    app.run(host='localhost', port=5000, debug=False)
