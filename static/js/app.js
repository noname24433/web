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
            explainBtn: document.getElementById('explain'),
            chapter: document.getElementById('chapter'),
            verse: document.getElementById('verse'),
            shloka: document.getElementById('shloka'),
            transliteration: document.getElementById('transliteration'),
            meaning: document.getElementById('meaning')
        };
    }

    initEventListeners() {
        this.elements.newVerseBtn.addEventListener('click', () => this.loadVerse());
        this.elements.explainBtn.addEventListener('click', () => this.openExplanation());
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

    openExplanation() {
        if (!this.currentVerse) return;

        const { chapter, verse } = this.currentVerse;
        const urls = [
            `https://vedabase.io/en/library/bg/${chapter}/${verse}/`,
            `https://www.holy-bhagavad-gita.org/chapter/${chapter}/verse/${verse}`
        ];

        // Try to open primary URL, fallback to secondary
        const newWindow = window.open(urls[0], '_blank');
        if (!newWindow || newWindow.closed) {
            window.open(urls[1], '_blank');
        }
    }
}

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', () => new GitaApp());
