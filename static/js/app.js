// Define conflict ranges for vedabase URL adjustments
const vedabaseConflicts = {
  1: [
    [16, 18],
    [21, 22],
    [32, 35],
    [37, 38]
  ],
  2: [
    [42, 43]
  ],
  5: [
    [8, 9],
    [27, 28]
  ],
  6: [
    [11, 12],
    [13, 14],
    [20, 23]
  ],
  10: [
    [4, 5],
    [12, 13]
  ],
  11: [
    [10, 11],
    [26, 27],
    [41, 42]
  ],
  12: [
    [3, 4],
    [6, 7],
    [13, 14],
    [18, 19]
  ],
  13: [
    [1, 2],
    [6, 7],
    [8, 12]
  ],
  14: [
    [22, 25]
  ],
  15: [
    [3, 4]
  ],
  16: [
    [1, 3],
    [11, 12],
    [13, 15]
  ],
  17: [
    [5, 6],
    [26, 27]
  ],
  18: [
    [51, 53]
  ]
};

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
      searchGoogle: document.getElementById('search-google'),
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
    this.elements.searchGoogle.addEventListener('click', () => this.openGoogle());
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
    let url = `https://vedabase.io/en/library/bg/${chapter}/${verse}/`;

    // Check for conflict ranges for the current chapter
    if (vedabaseConflicts.hasOwnProperty(chapter)) {
      const ranges = vedabaseConflicts[chapter];
      for (let range of ranges) {
        const [low, high] = range;
        if (verse >= low && verse <= high) {
          // Build URL with the fixed range
          url = `https://vedabase.io/en/library/bg/${chapter}/${low}-${high}/`;
          break;
        }
      }
    }
    window.open(url, '_blank');
  }

  openGoogle() {
    if (!this.currentVerse) return;
    const { chapter, verse } = this.currentVerse;
    const query = `bhagavad gita chapter ${chapter} verse ${verse}`;
    // Use the reference URL pattern provided by the user
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&oq=${encodeURIComponent(query)}&gs_lcrp=EgZjaHJvbWUyDggAEEUYJxg5GIAEGIoFMggIARAAGBYYHjIICAIQABgWGB4yDQgDEAAYhgMYgAQYigUyCggEEAAYgAQYogQyCggFEAAYgAQYogQyCggGEAAYgAQYogQyCggHEAAYgAQYogTSAQgxMTUxajFqOagCCLACAfEFWoY2K7gIhBM&sourceid=chrome&ie=UTF-8`;
    window.open(url, '_blank');
  }

  openYouTube() {
    if (!this.currentVerse) return;
    const { chapter, verse } = this.currentVerse;
    const query = `bhagavad gita chapter ${chapter} verse ${verse}`;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  }
}

document.addEventListener('DOMContentLoaded', () => new GitaApp());
