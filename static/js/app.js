class GitaApp {
  constructor() {
    this.dom = {
      generateBtn: document.getElementById('generateBtn'),
      chapter: document.getElementById('chapter'),
      verse: document.getElementById('verse'),
      shloka: document.getElementById('shloka'),
      transliteration: document.getElementById('transliteration'),
      meaning: document.getElementById('meaning'),
      reportBtn: document.getElementById('reportBtn'),
      reportModal: document.getElementById('reportModal'),
      reportText: document.getElementById('reportText'),
      submitReport: document.getElementById('submitReport'),
      reportStatus: document.getElementById('reportStatus')
    };
    this.currentVerse = null;
    this.init();
  }

  init() {
    this.dom.generateBtn.addEventListener('click', () => this.fetchVerse());
    this.dom.reportBtn.addEventListener('click', () => this.showModal(true));
    this.dom.submitReport.addEventListener('click', () => this.submitReport());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.showModal(false);
    });
  }

  async fetchVerse() {
    try {
      const res = await fetch('/api/verse');
      if (!res.ok) throw new Error('Failed to fetch verse');
      const verse = await res.json();
      this.displayVerse(verse);
    } catch (err) {
      console.error(err);
      alert('Error fetching verse.');
    }
  }

  displayVerse(verse) {
    this.currentVerse = verse;
    this.dom.chapter.textContent = `Chapter: ${verse.chapter}`;
    this.dom.verse.textContent = `Verse: ${verse.verse}`;
    this.dom.shloka.textContent = verse.shloka;
    this.dom.transliteration.textContent = verse.transliteration;
    this.dom.meaning.textContent = verse.meaning;
  }

  showModal(show) {
    this.dom.reportModal.style.display = show ? 'block' : 'none';
  }

  async submitReport() {
    const message = this.dom.reportText.value.trim();
    if (!message) {
      this.dom.reportStatus.textContent = 'Please enter a message.';
      return;
    }
    try {
      const res = await fetch('/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (!res.ok) throw new Error('Failed to submit report');
      this.dom.reportStatus.textContent = 'Report submitted successfully!';
      this.dom.reportText.value = '';
    } catch (err) {
      console.error(err);
      this.dom.reportStatus.textContent = 'Failed to submit report.';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new GitaApp());
