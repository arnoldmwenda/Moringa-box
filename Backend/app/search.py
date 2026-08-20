import json
import os
from urllib.error import URLError
from urllib.request import Request, urlopen


def _local_rank(files, query):
    terms = query.lower().split()
    scored = []
    for file in files:
        text = ' '.join(str(file.get(key, '')) for key in ('name', 'type', 'updated')).lower()
        score = sum(3 if term in str(file.get('name', '')).lower() else 1 for term in terms if term in text)
        if score:
            scored.append((score, file))
    return [file for _, file in sorted(scored, key=lambda item: item[0], reverse=True)]


def _ollama_rank(files, query):
    endpoint = os.getenv('OLLAMA_URL', 'http://127.0.0.1:11434/api/generate')
    model = os.getenv('OLLAMA_MODEL', 'qwen2.5:0.5b')
    prompt = (
        'Return JSON only in the form {"ids":[number]}. '
        f'Rank file ids most relevant to the search query "{query}". '
        f'Files: {json.dumps([{key: file.get(key) for key in ("id", "name", "type", "updated")} for file in files])}'
    )
    body = json.dumps({
        'model': model,
        'prompt': prompt,
        'stream': False,
        'format': 'json',
    }).encode('utf-8')
    request = Request(endpoint, data=body, headers={'Content-Type': 'application/json'}, method='POST')
    with urlopen(request, timeout=8) as response:
        result = json.loads(response.read().decode('utf-8'))
    generated = json.loads(result.get('response', '{}'))
    ids = generated.get('ids', []) if isinstance(generated, dict) else generated
    valid_ids = {file.get('id') for file in files}
    return [file for file in files if file.get('id') in ids and file.get('id') in valid_ids]


def rank_files(files, query):
    if not query:
        return files
    candidates = _local_rank(files, query)
    if not candidates:
        return []
    try:
        ranked = _ollama_rank(candidates, query)
        if ranked:
            ranked_ids = {file.get('id') for file in ranked}
            return ranked + [file for file in candidates if file.get('id') not in ranked_ids]
    except (OSError, ValueError, TypeError, URLError, TimeoutError, json.JSONDecodeError):
        pass
    return candidates