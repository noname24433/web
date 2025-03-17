from flask import Flask, render_template, jsonify, request
import csv
import random
from pathlib import Path
from datetime import datetime

app = Flask(__name__)

CHAPTER_VERSE_LIMITS = {
    1: 46, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47,
    7: 30, 8: 28, 9: 34, 10: 42, 11: 55, 12: 20,
    13: 35, 14: 27, 15: 20, 16: 24, 17: 28, 18: 78
}

VERSES = []

def load_verses():
    csv_path = Path(__file__).parent / 'data' / 'Bhagwad_Gita.csv'
    verses = []
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    chapter = int(row['Chapter'])
                    verse = int(row['Verse'])
                    if chapter in CHAPTER_VERSE_LIMITS and 0 < verse <= CHAPTER_VERSE_LIMITS[chapter]:
                        verses.append({
                            'chapter': chapter,
                            'verse': verse,
                            'shloka': row['Shloka'],
                            'transliteration': row['Transliteration'],
                            # Removed EngMeaning; meaning remains an empty string
                            'meaning': ""
                        })
                except ValueError:
                    continue
    except Exception as e:
        print(f"Error loading verses: {e}")
    return verses

VERSES = load_verses()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/verse')
def get_verse():
    if not VERSES:
        return jsonify({'error': 'No verses available'}), 500
    return jsonify(random.choice(VERSES))

@app.route('/report', methods=['POST'])
def submit_report():
    data = request.get_json()
    report = {
        'timestamp': datetime.now().isoformat(),
        'verse': f"{data.get('chapter', '?')}.{data.get('verse', '?')}",
        'message': data.get('message', '')[:500],
        'ip': request.remote_addr
    }

    try:
        reports_dir = Path(__file__).parent / 'data' / 'reports'
        reports_dir.mkdir(exist_ok=True)
        report_file = reports_dir / 'reports.csv'

        with open(report_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=report.keys())
            if not report_file.exists():
                writer.writeheader()
            writer.writerow(report)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
