const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export function rankFiles(files, query) {
  if (!Array.isArray(files) || !query || !String(query).trim()) {
    return Array.isArray(files) ? files : [];
  }
  const terms = String(query).toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return files;

  return files
    .map((file) => {
      if (!file || typeof file !== 'object') return { file, score: 0 };
      const name = String(file.name || file.title || '').toLowerCase();
      const type = String(file.type || file.category || '').toLowerCase();
      const updated = String(file.updated || file.description || '').toLowerCase();
      const searchText = file.searchText
        ? String(file.searchText).toLowerCase()
        : `${name} ${type} ${updated}`;

      let score = 0;
      for (const term of terms) {
        if (name.includes(term)) {
          score += 3;
        } else if (type.includes(term)) {
          score += 2;
        } else if (searchText.includes(term)) {
          score += 1;
        }
      }
      return { file, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ file }) => file);
}

export function searchItems(items, query) {
  if (!Array.isArray(items)) return [];
  const terms = String(query || '')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 1);
  if (!terms.length) return items;

  return items
    .map((item) => {
      const title = String(item.title || item.name || '').toLowerCase();
      const category = String(item.category || item.type || '').toLowerCase();
      const description = String(item.description || item.updated || '').toLowerCase();
      const text = `${title} ${category} ${description}`;
      const score = terms.reduce((total, term) => {
        if (title === term) return total + 10;
        if (title.includes(term)) return total + 6;
        if (category.includes(term)) return total + 3;
        if (description.includes(term)) return total + 1;
        if (text.split(/\s+/).some((word) => word.startsWith(term))) return total + 2;
        return total;
      }, 0);
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ item }) => item);
}

export async function transcribeWithBrowserSpeech() {
  if (typeof window === 'undefined') {
    throw new Error('Voice search is unavailable in this environment.');
  }
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    throw new Error('Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.');
  }

  return new Promise((resolve, reject) => {
    let handled = false;
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      handled = true;
      const text = event.results?.[0]?.[0]?.transcript?.trim() || '';
      resolve({ text, provider: 'browser', json: { text, provider: 'browser' } });
    };

    recognition.onerror = (event) => {
      handled = true;
      if (event.error === 'not-allowed') {
        reject(new Error('Microphone permission was denied.'));
      } else if (event.error === 'no-speech') {
        reject(new Error('No speech was detected. Please try again.'));
      } else {
        reject(new Error('Voice search could not hear you.'));
      }
    };

    recognition.onend = () => {
      if (!handled) {
        resolve({ text: '', provider: 'browser', json: { text: '', provider: 'browser' } });
      }
    };

    try {
      recognition.start();
    } catch {
      reject(new Error('Could not start voice recognition.'));
    }
  });
}

export async function searchWithBackend(files, query) {
  if (!Array.isArray(files) || !query || !String(query).trim()) {
    return Array.isArray(files) ? files : [];
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${apiBaseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: String(query).trim(), files }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      return rankFiles(files, query);
    }
    const data = await response.json();
    return Array.isArray(data.results) ? data.results : rankFiles(files, query);
  } catch {
    return rankFiles(files, query);
  }
}
