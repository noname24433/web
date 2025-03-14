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
            reportBtn: document.getElementById('reportBtn'),
            modal: document.getElementById('reportModal'),
            reportText: document.getElementById('reportText'),
            submitReport: document.getElementById('submitReport'),
            status: document.getElementById('reportStatus'),
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
        this.elements.reportBtn.addEventListener('click', () => this.toggleModal(true));
        document.getElementById('closeModal').addEventListener('click', () => this.toggleModal(false));
        this.elements.submitReport.addEventListener('click', () => this.handleReport());
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

    toggleModal(show) {
        this.elements.modal.style.display = show ? 'flex' : 'none';
        if (!show) this.elements.reportText.value = '';
    }

    async handleReport() {
        const message = this.elements.reportText.value.trim();
        if (!message) {
            this.showStatus('Please enter a message', 'error');
            return;
        }

        const reportData = {
            message,
            chapter: this.currentVerse?.chapter,
            verse: this.currentVerse?.verse
        };

        try {
            const response = await fetch('/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData)
            });

            if (response.ok) {
                this.showStatus('Report submitted successfully', 'success');
                setTimeout(() => this.toggleModal(false), 1500);
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            this.showStatus('Failed to submit report', 'error');
            console.error('Report error:', error);
        }
    }

    showStatus(message, type) {
        this.elements.status.textContent = message;
        this.elements.status.className = type;
    }
}

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', () => new GitaApp());
