import json
import os
from urllib.error import URLError
from urllib.request import Request, urlopen


def _local_rank(files, query):
    if not query or not files:
        return files if isinstance(files, list) else []
    terms = [term.lower() for term in str(query).split() if term.strip()]
    if not terms:
        return files
    scored = []
    for file in files:
        if not isinstance(file, dict):
            continue
        name = str(file.get('name') or file.get('title') or '').lower()
        file_type = str(file.get('type') or file.get('category') or file.get('file_type') or '').lower()
        updated_or_desc = str(file.get('updated') or file.get('description') or '').lower()
        combined = f"{name} {file_type} {updated_or_desc}"

        score = 0
        for term in terms:
            if term in name:
                score += 3
            elif term in file_type:
                score += 2
            elif term in combined:
                score += 1

        if score > 0:
            scored.append((score, file))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [file for _, file in scored]


def _ollama_rank(files, query):
    api_key = os.getenv('OLLAMA_API_KEY', '').strip()
    base_url = os.getenv('OLLAMA_BASE_URL', '').strip().rstrip('/')
    endpoint = os.getenv('OLLAMA_URL', '').strip()
    model = os.getenv('OLLAMA_MODEL', 'qwen2.5:0.5b')
    dict_files = [f for f in files if isinstance(f, dict)]
    if not dict_files:
        return []

    use_openai_compat = bool(api_key or base_url.endswith('/v1') or endpoint.endswith('/v1/chat/completions'))
    if use_openai_compat:
        openai_endpoint = endpoint if endpoint.endswith('/v1/chat/completions') else f"{base_url or 'http://127.0.0.1:11434/v1'}/chat/completions"
    else:
        openai_endpoint = endpoint or 'http://127.0.0.1:11434/api/generate'

    prompt = (
        'Return JSON only in the form {"ids":[number]}. '
        f'Rank file ids most relevant to the search query "{query}". '
        f'Files: {json.dumps([{key: file.get(key) for key in ("id", "name", "title", "type", "category", "updated", "description") if key in file} for file in dict_files])}'
    )
    if use_openai_compat:
        payload = {'model': model, 'messages': [{'role': 'system', 'content': 'Return valid JSON only.'}, {'role': 'user', 'content': prompt}], 'stream': False, 'temperature': 0, 'response_format': {'type': 'json_object'}}
        headers = {'Content-Type': 'application/json'}
        if api_key:
            headers['Authorization'] = f'Bearer {api_key}'
    else:
        payload = {'model': model, 'prompt': prompt, 'stream': False, 'format': 'json'}
        headers = {'Content-Type': 'application/json'}
    body = json.dumps(payload).encode('utf-8')
    request = Request(openai_endpoint, data=body, headers=headers, method='POST')
    with urlopen(request, timeout=5) as response:
        result = json.loads(response.read().decode('utf-8'))

    raw_resp = result.get('choices', [{}])[0].get('message', {}).get('content', '{}') if use_openai_compat else result.get('response', '{}')
    generated = json.loads(raw_resp) if isinstance(raw_resp, str) else raw_resp
    ids = generated.get('ids', []) if isinstance(generated, dict) else (generated if isinstance(generated, list) else [])

    file_map = {str(file.get('id')): file for file in dict_files if file.get('id') is not None}
    ranked = []
    seen = set()
    for item_id in ids:
        str_id = str(item_id)
        if str_id in file_map and str_id not in seen:
            seen.add(str_id)
            ranked.append(file_map[str_id])
    return ranked


def rank_files(files, query):
    if not isinstance(files, list):
        return []
    if not query or not str(query).strip():
        return files
    query_clean = str(query).strip()
    candidates = _local_rank(files, query_clean)
    if not files:
        return []
    try:
        ranked = _ollama_rank(files, query_clean)
        if ranked:
            ranked_id_set = {str(file.get('id')) for file in ranked if file.get('id') is not None}
            remaining = [file for file in candidates if str(file.get('id')) not in ranked_id_set]
            return ranked + remaining
    except (OSError, ValueError, TypeError, URLError, TimeoutError, json.JSONDecodeError):
        pass
    return candidates
