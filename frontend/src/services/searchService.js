const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export function rankFiles(files, query) {
  if (!query.trim()) return files;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return files
    .map((file) => ({ file, score: terms.reduce((score, term) => score + (file.searchText.includes(term) ? (file.name.toLowerCase().includes(term) ? 3 : 1) : 0), 0) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ file }) => file);
}

export async function transcribeWithAzure() {
  if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) throw new Error('Voice search is unavailable in this browser.');
  return new Promise((resolve, reject) => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.trim();
      resolve({ text, provider: 'browser', json: { text, provider: 'browser' } });
    };
    recognition.onerror = (event) => reject(new Error(event.error === 'not-allowed' ? 'Microphone permission was denied.' : 'Voice search could not hear you.'));
    recognition.start();
  });
}

export async function searchWithBackend(files, query) {
  if (!query.trim()) return files;
  try {
    const response = await fetch(`${apiBaseUrl}/api/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, files }) });
    if (!response.ok) return files;
    const data = await response.json();
    return Array.isArray(data.results) ? data.results : files;
  } catch {
    return files;
  }
}