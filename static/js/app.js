class GitaApp {
  constructor() {
    this.currentVerse = null;
    this.initElements();
    this.initEventListeners();
    this.loadInitialVerse();
  }

  initElements() {
    this.elements = {
      newVerseBtn: document.getElementById('new-verse'),
      explainVedabase: document.getElementById('explain-vedabase'),
      explainGitaio: document.getElementById('explain-gitaio'),
      searchYouTube: document.getElementById('search-youtube'),
      chapter: document.getElementById('chapter'),
      verse: document.getElementById('verse'),
      shloka: document.getElementById('shloka'),
      transliteration: document.getElementById('transliteration'),
      meaning: document.getElementById('meaning')
    };
  }

  initEventListeners() {
    this.elements.newVerseBtn.addEventListener('click', () => this.loadVerse());
    this.elements.explainVedabase.addEventListener('click', () => this.openVedabase());
    this.elements.explainGitaio.addEventListener('click', () => this.openGitaio());
    this.elements.searchYouTube.addEventListener('click', () => this.openYouTube());
  }

  async loadInitialVerse() {
    await this.loadVerse();
  }

  async loadVerse() {
    try {
      const response = await fetch('/api/verse');
      const verse = await response.json();
      this.currentVerse = verse;
      this.updateDisplay(verse);
    } catch (error) {
      console.error('Error loading verse:', error);
    }
  }

  updateDisplay(verse) {
    this.elements.chapter.textContent = verse.chapter;
    this.elements.verse.textContent = verse.verse;
    this.elements.shloka.textContent = verse.shloka;
    this.elements.transliteration.textContent = verse.transliteration;
    this.elements.meaning.textContent = verse.meaning;
  }

  openVedabase() {
    if (!this.currentVerse) return;
    const { chapter, verse } = this.currentVerse;
    window.open(`https://vedabase.io/en/library/bg/${chapter}/${verse}/`, '_blank');
  }

  openGitaio() {
    if (!this.currentVerse) return;
    const { chapter, verse } = this.currentVerse;
    window.open(`https://bhagavadgita.io/chapter/${chapter}/verse/${verse}/`, '_blank');
  }

  openYouTube() {
    if (!this.currentVerse) return;
    const { chapter, verse } = this.currentVerse;
    // Construct the YouTube search URL using the pattern:
    // "bhagavad gita chapter {chapter} verse {verse}"
    const searchQuery = `bhagavad gita chapter ${chapter} verse ${verse}`;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    window.open(url, '_blank');
  }
}

document.addEventListener('DOMContentLoaded', () => new GitaApp());
