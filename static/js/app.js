// Fetch a random verse from the server
async function fetchRandomVerse() {
    try {
        const response = await fetch('/get_verse');
        const verse = await response.json();

        document.getElementById('verseChapter').textContent = verse.chapter;
        document.getElementById('verseNumber').textContent = verse.verse;
        document.getElementById('verseText').textContent = verse.text;
        document.getElementById('verseTransliteration').textContent = verse.transliteration;
        document.getElementById('verseMeanings').textContent = verse.word_meanings;

        document.getElementById('verseContainer').style.display = 'block';
        document.getElementById('explainBtn').style.display = 'block';
        document.getElementById('deepMeaning').style.display = 'none';
    } catch (error) {
        alert('Error fetching verse. Please try again.');
        console.error('Error:', error);
    }
}

// Fetch AI interpretation of the current verse
async function fetchDeepMeaning() {
    const verseText = document.getElementById('verseText').textContent;
    const loading = document.getElementById('loading');
    const explanationElement = document.getElementById('aiExplanation');

    loading.style.display = 'block';
    document.getElementById('deepMeaning').style.display = 'block';
    explanationElement.textContent = '';

    try {
        const response = await fetch('/explain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: verseText })
        });

        const data = await response.json();
        explanationElement.textContent = data.explanation;
    } catch (error) {
        explanationElement.textContent = "Failed to fetch deep meaning. Please try again.";
        console.error('Error:', error);
    } finally {
        loading.style.display = 'none';
    }
}

// Add event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    // You can automatically fetch a verse when the page loads if desired
    // fetchRandomVerse();
});