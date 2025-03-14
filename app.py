from flask import Flask, render_template, jsonify, request
import csv
import random
from pathlib import Path
from datetime import datetime
import logging
import os
import requests

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

# Configure logging for Render
if os.environ.get('RENDER'):
    import sys
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)

# Define Bhagavad Gita chapter and verse limits
CHAPTER_VERSE_LIMITS = {
    1: 46, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47,
    7: 30, 8: 28, 9: 34, 10: 42, 11: 55, 12: 20,
    13: 35, 14: 27, 15: 20, 16: 24, 17: 28, 18: 78
}

VERSES = []

def load_verses():
    """Load valid verses from CSV file."""
    csv_path = Path(__file__).parent / 'data' / 'Bhagwad_Gita.csv'
    verses = []
    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            required_fields = {'Chapter', 'Verse', 'Shloka', 'Transliteration', 'EngMeaning'}
            if not required_fields.issubset(set(reader.fieldnames or [])):
                app.logger.error("CSV file missing required columns.")
                return []
            for row in reader:
                try:
                    chapter = int(row['Chapter'])
                    verse = int(row['Verse'])
                    if chapter in CHAPTER_VERSE_LIMITS and 0 < verse <= CHAPTER_VERSE_LIMITS[chapter]:
                        verses.append({
                            'chapter': chapter,
                            'verse': verse,
                            'shloka': row['Shloka'].strip(),
                            'transliteration': row['Transliteration'].strip(),
                            'meaning': row['EngMeaning'].strip()
                        })
                except ValueError:
                    continue
    except Exception as e:
        app.logger.error(f"Error loading verses: {e}")
    app.logger.info(f"Loaded {len(verses)} verses.")
    return verses

VERSES = load_verses()

@app.after_request
def add_security_headers(response):
    """Add security headers."""
    headers = {
        'Content-Security-Policy': "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
    response.headers.update(headers)
    return response

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/verse')
def get_verse():
    if not VERSES:
        return jsonify({'error': 'No verses available.'}), 500
    return jsonify(random.choice(VERSES))

@app.route('/report', methods=['POST'])
def report_issue():
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        if not message or len(message) > 500:
            return jsonify({'error': 'Invalid message.'}), 400
        report = {
            'timestamp': datetime.now().isoformat(),
            'message': message,
            'ip': request.remote_addr
        }
        report_file = Path(__file__).parent / 'data' / 'reports.csv'
        report_file.parent.mkdir(parents=True, exist_ok=True)
        file_exists = report_file.exists()
        with open(report_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=report.keys())
            if not file_exists:
                writer.writeheader()
            writer.writerow(report)
        return jsonify({'success': True})
    except Exception as e:
        app.logger.error(f"Report submission failed: {e}")
        return jsonify({'error': 'Report submission failed.'}), 500

@app.route('/check_url')
def check_url():
    url = request.args.get('url')
    if not url:
        return jsonify({'ok': False, 'error': 'No URL provided.'}), 400
    try:
        resp = requests.head(url, timeout=3)
        return jsonify({'ok': resp.status_code == 200})
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
