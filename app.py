from flask import Flask, render_template, jsonify, request
import csv
import random
from pathlib import Path
from datetime import datetime
import logging
import os
import requests  # Ensure this package is installed via pip

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

# Configure logging for deployed environments (e.g., on Render)
if os.environ.get('RENDER'):
    import sys
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)

# Define chapter verse limits (as per the Bhagavad Gita)
CHAPTER_VERSE_LIMITS = {
    1: 46, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47,
    7: 30, 8: 28, 9: 34, 10: 42, 11: 55, 12: 20,
    13: 35, 14: 27, 15: 20, 16: 24, 17: 28, 18: 78
}

# Global cache for verses
VERSES = []

def load_valid_verses():
    """Load and validate verses from the CSV file."""
    csv_path = Path(__file__).parent / 'data' / 'Bhagwad_Gita.csv'
    valid = []
    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            required = {'Chapter', 'Verse', 'Shloka', 'Transliteration', 'EngMeaning'}
            if not required.issubset(set(reader.fieldnames or [])):
                app.logger.error("CSV is missing required columns.")
                return valid
            for row in reader:
                try:
                    ch = int(row['Chapter'])
                    vs = int(row['Verse'])
                    if ch in CHAPTER_VERSE_LIMITS and 0 < vs <= CHAPTER_VERSE_LIMITS[ch]:
                        valid.append({
                            'chapter': ch,
                            'verse': vs,
                            'shloka': row['Shloka'].strip(),
                            'transliteration': row['Transliteration'].strip(),
                            'meaning': row['EngMeaning'].strip()
                        })
                except Exception as e:
                    app.logger.warning(f"Skipping row: {e}")
                    continue
    except Exception as e:
        app.logger.error(f"Error reading CSV: {e}")
    app.logger.info(f"Loaded {len(valid)} valid verses.")
    return valid

# Load verses on startup
VERSES = load_valid_verses()

@app.after_request
def add_security_headers(response):
    """Add security headers to all responses."""
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
    """Render the main page."""
    return render_template('index.html')

@app.route('/api/verse')
def get_verse():
    """Return a random verse in JSON format."""
    global VERSES
    if not VERSES:
        VERSES = load_valid_verses()
    if not VERSES:
        return jsonify({'error': 'No verses available.'}), 500
    return jsonify(random.choice(VERSES))

@app.route('/report', methods=['POST'])
def handle_report():
    """Handle report submissions."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid request.'}), 400
        message = data.get('message', '').strip()
        if not message or len(message) > 500:
            return jsonify({'error': 'Message is required and must be under 500 characters.'}), 400
        report = {
            'timestamp': datetime.now().isoformat(),
            'message': message,
            'ip': request.remote_addr
        }
        reports_dir = Path(__file__).parent / 'data' / 'reports'
        reports_dir.mkdir(exist_ok=True)
        report_file = reports_dir / 'reports.csv'
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
    """Server-side endpoint to check if an external URL is available."""
    url = request.args.get('url')
    if not url:
        return jsonify({'ok': False, 'error': 'No URL provided.'}), 400
    try:
        resp = requests.head(url, timeout=3)
        if resp.status_code == 200:
            return jsonify({'ok': True})
        else:
            return jsonify({'ok': False, 'status': resp.status_code})
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
