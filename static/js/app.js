class GitaApp {
  constructor() {
    this.dom = {
      generateBtn: document.getElementById('generateBtn'),
      verseCard: document.getElementById('verseCard'),
      chapter: document.getElementById('chapter'),
      verse: document.getElementById('verse'),
      shloka: document.getElementById('shloka'),
      transliteration: document.getElementById('transliteration'),
      meaning: document.getElementById('meaning'),
      explanationBtn: document.getElementById('explanationBtn'),
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
    this.dom.generateBtn.addEventListener('click', () => this.loadVerse());
    this.dom.explanationBtn.addEventListener('click', () => this.redirectExplanation());
    this.dom.reportBtn.addEventListener('click', () => this.toggleModal(true));
    document.querySelector('.modal-close').addEventListener('click', () => this.toggleModal(false));
    document.querySelector('.modal-close-btn').addEventListener('click', () => this.toggleModal(false));
    this.dom.submitReport.addEventListener('click', () => this.submitReport());
    this.dom.reportModal.addEventListener('click', (e) => {
      if (e.target === this.dom.reportModal) this.toggleModal(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.toggleModal(false);
    });
    this.loadInitialVerse();
  }

  async loadInitialVerse() {
    try {
      await this.loadVerse();
    } catch (error) {
      console.error(error);
      this.showError("Couldn't load verse. Please try again later.");
    }
  }

  async loadVerse() {
    try {
      this.dom.generateBtn.disabled = true;
      this.dom.generateBtn.innerHTML = '<span class="loading"></span>';
      const response = await fetch('/api/verse');
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const verse = await response.json();
      this.currentVerse = verse;
      this.dom.chapter.textContent = verse.chapter;
      this.dom.verse.textContent = verse.verse;
      this.dom.shloka.textContent = verse.shloka;
      this.dom.transliteration.textContent = verse.transliteration;
      this.dom.meaning.textContent = verse.meaning;
      this.dom.verseCard.classList.add('active');
      this.dom.generateBtn.disabled = false;
      this.dom.generateBtn.textContent = '🕉️ Generate Verse';
    } catch (error) {
      console.error(error);
      this.dom.generateBtn.disabled = false;
      this.dom.generateBtn.textContent = '🕉️ Try Again';
      this.showError("Couldn't load verse. Please try again.");
    }
  }

  /**
   * Check a URL's availability using the /check_url endpoint.
   * @param {string} url - The URL to verify.
   * @returns {Promise<boolean>}
   */
  async checkUrl(url) {
    try {
      const res = await fetch(`/check_url?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return data.ok;
    } catch (error) {
      console.error("URL check error:", error);
      return false;
    }
  }

  /**
   * Redirect to an external explanation page.
   * Primary: Vedabase.io; Fallback: Bhagavad-Gita.org.
   */
  async redirectExplanation() {
    if (!this.currentVerse) {
      alert("Please generate a verse first.");
      return;
    }
    const { chapter, verse } = this.currentVerse;
    const primaryUrl = `https://vedabase.io/en/library/bg/${chapter}/${verse}/`;
    const fallbackUrl = `https://www.bhagavad-gita.org/gita/verse.php?verse=${chapter}.${verse}`;

    if (await this.checkUrl(primaryUrl)) {
      window.location.href = primaryUrl;
    } else if (await this.checkUrl(fallbackUrl)) {
      window.location.href = fallbackUrl;
    } else {
      alert("Deeper explanation resource is currently unavailable.");
    }
  }

  showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    errorEl.style.backgroundColor = '#ffebee';
    errorEl.style.color = '#c62828';
    errorEl.style.padding = '1rem';
    errorEl.style.borderRadius = '4px';
    errorEl.style.margin = '1rem 0';
    errorEl.style.textAlign = 'center';
    const container = document.querySelector('.container');
    container.insertBefore(errorEl, this.dom.verseCard);
    setTimeout(() => errorEl.remove(), 5000);
  }

  toggleModal(show) {
    if (show) {
      this.dom.reportModal.classList.add('active');
      this.dom.reportText.focus();
    } else {
      this.dom.reportModal.classList.remove('active');
      this.dom.reportStatus.textContent = '';
      this.dom.reportStatus.className = '';
    }
  }

  async submitReport() {
    const message = this.dom.reportText.value.trim();
    if (!message) {
      this.dom.reportStatus.textContent = 'Please enter a message.';
      this.dom.reportStatus.className = 'error';
      return;
    }
    try {
      this.dom.submitReport.disabled = true;
      this.dom.reportStatus.textContent = 'Submitting...';
      this.dom.reportStatus.className = '';
      const response = await fetch('/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          verseInfo: this.currentVerse ? `Chapter ${this.currentVerse.chapter}, Verse ${this.currentVerse.verse}` : 'No verse displayed'
        })
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      this.dom.reportStatus.textContent = 'Report submitted successfully!';
      this.dom.reportStatus.className = 'success';
      this.dom.reportText.value = '';
      setTimeout(() => {
        this.toggleModal(false);
        this.dom.submitReport.disabled = false;
      }, 2000);
    } catch (error) {
      console.error(error);
      this.dom.reportStatus.textContent = 'Failed to submit report. Please try again.';
      this.dom.reportStatus.className = 'error';
      this.dom.submitReport.disabled = false;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new GitaApp());
