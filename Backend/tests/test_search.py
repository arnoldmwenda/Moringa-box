import json
import pytest
from app.search import _local_rank, rank_files


def test_health_check_endpoint(client):
    """Happy Path: Health check endpoint returns 200 OK with status healthy."""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data == {"status": "healthy"}


def test_search_endpoint_happy_path(client):
    """Happy Path: /api/search returns 200 with ranked results."""
    files = [
        {"id": 1, "title": "Daily Dose Box", "category": "Everyday", "description": "Simple ritual"},
        {"id": 2, "title": "Starter Kit", "category": "Beginner", "description": "Moringa routine"},
    ]
    response = client.post(
        '/api/search',
        data=json.dumps({"query": "daily", "files": files}),
        content_type='application/json'
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["query"] == "daily"
    assert len(data["results"]) >= 1
    assert data["results"][0]["title"] == "Daily Dose Box"


def test_search_endpoint_invalid_files(client):
    """Edge Case: /api/search rejects non-list files parameter with 400 Bad Request."""
    response = client.post(
        '/api/search',
        data=json.dumps({"query": "test", "files": "not-a-list"}),
        content_type='application/json'
    )
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data


def test_search_endpoint_empty_query(client):
    """Happy Path: /api/search with empty query returns all input files."""
    files = [{"id": 1, "name": "File A"}, {"id": 2, "name": "File B"}]
    response = client.post(
        '/api/search',
        data=json.dumps({"query": "", "files": files}),
        content_type='application/json'
    )
    assert response.status_code == 200
    data = response.get_json()
    assert len(data["results"]) == 2


def test_local_rank_scoring_and_ordering():
    """Unit Test: _local_rank ranks title/name matches higher than description matches."""
    files = [
        {"id": 1, "name": "Other Product", "category": "General", "description": "Contains green moringa leaves"},
        {"id": 2, "name": "Moringa Special Box", "category": "Everyday", "description": "Fresh herbs"},
    ]
    ranked = _local_rank(files, "moringa")
    assert len(ranked) == 2
    assert ranked[0]["id"] == 2
    assert ranked[1]["id"] == 1


def test_rank_files_fallback_when_no_ollama():
    """Resilience: rank_files falls back safely to local ranking when Ollama is offline."""
    files = [
        {"id": 1, "name": "Doc Alpha", "category": "PDF", "description": "Report"},
        {"id": 2, "name": "Photo Beta", "category": "Image", "description": "Picture"},
    ]
    results = rank_files(files, "Alpha")
    assert len(results) == 1
    assert results[0]["id"] == 1
