from flask import Flask, render_template, jsonify, request
import random
import json
import os
import requests

app = Flask(__name__)

# Constants for the free AI API
HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
# If you want to use an API key for higher rate limits (still free), uncomment below
# HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY', '')
# HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
HEADERS = {}  # No API key needed for basic usage


# Load Bhagavad Gita verses
def load_verses():
    try:
        with open('data/verses.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        # Fallback path for PythonAnywhere
        with open(os.path.join(os.path.dirname(__file__), 'data/verses.json'), 'r', encoding='utf-8') as f:
            return json.load(f)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_verse')
def get_verse():
    verses = load_verses()
    verse = random.choice(verses)
    return jsonify(verse)


@app.route('/explain', methods=['POST'])
def explain_verse():
    verse_text = request.json.get('text')

    try:
        # Prepare the prompt for Hugging Face model
        prompt = f"""<s>[INST] You are a Hindu spiritual guide explaining Bhagavad Gita verses. 
        Provide deep philosophical meaning in simple English. Keep it under 150 words. 
        Focus on practical life applications.

        Explain the deep meaning of this Bhagavad Gita verse:

        {verse_text} [/INST]"""

        # Make request to Hugging Face API
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 200,
                "temperature": 0.7,
                "top_p": 0.95,
                "return_full_text": False
            }
        }
        response = requests.post(HUGGINGFACE_API_URL, headers=HEADERS, json=payload)

        # Process the response
        if response.status_code == 200:
            # Extract the generated text
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                explanation = result[0].get("generated_text", "").strip()
            else:
                explanation = result.get("generated_text", "").strip()
        else:
            # Fallback option using a simpler free API if available
            explanation = get_fallback_explanation(verse_text)
    except Exception as e:
        print(f"AI Error: {e}")
        explanation = "Divine wisdom is temporarily unavailable. Please contemplate the verse directly."

    return jsonify({'explanation': explanation})


def get_fallback_explanation(verse_text):
    """
    A simple function that provides basic insights for common Bhagavad Gita themes
    when the API fails or is unavailable
    """
    # Dictionary of common themes and their explanations
    themes = {
        "धर्म": "This verse speaks to the nature of dharma (duty). It reminds us that adhering to our natural duties with sincerity brings inner peace. Each person has unique responsibilities based on their nature and position in life.",
        "कर्म": "The verse highlights karma (action) and its importance. All actions create consequences, but by performing our duties selflessly, we can achieve freedom from karmic bondage.",
        "योग": "This teaching emphasizes yoga - the path of union with the divine. Through disciplined practice and meditation, one can transcend the limitations of the material world.",
        "शांति": "Peace comes from accepting life's dualities. This verse reminds us that by maintaining equanimity in pleasure and pain, we find true spiritual strength.",
        "भक्ति": "The verse illuminates the path of devotion. By surrendering to the divine with love and trust, we find protection and guidance through life's challenges."
    }

    # Check if any key themes are in the verse
    for theme, explanation in themes.items():
        if theme in verse_text:
            return explanation

    # Default explanation if no themes match
    return "This verse contains profound wisdom about the nature of reality and our spiritual journey. It encourages us to look beyond material attachments, practice self-discipline, and recognize our eternal spiritual nature beyond the temporary physical body."


if __name__ == '__main__':
    app.run(debug=True)