#!/usr/bin/env python3
"""Static file server with parts web search API."""

import os
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from ddgs import DDGS

ROOT = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=str(ROOT), static_url_path="")


@app.route("/")
def index():
    return send_from_directory(ROOT, "index.html")


@app.route("/api/search")
def search_parts():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400

    max_results = min(int(request.args.get("max", 8)), 15)
    category = request.args.get("category", "").strip()

    search_query = query
    if category and category != "all":
        search_query = f"{query} {category.replace('-', ' ')} parts supplier"

    try:
        with DDGS() as ddgs:
            text_results = list(ddgs.text(f"{search_query} buy", max_results=max_results))
            image_results = list(ddgs.images(f"{search_query} product", max_results=6))
    except Exception as exc:
        return jsonify({"error": "Web search temporarily unavailable", "detail": str(exc)}), 503

    return jsonify({
        "query": query,
        "results": [
            {
                "title": item.get("title", ""),
                "url": item.get("href", ""),
                "snippet": item.get("body", ""),
            }
            for item in text_results
        ],
        "images": [
            {
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "image": item.get("image") or item.get("thumbnail", ""),
                "thumbnail": item.get("thumbnail") or item.get("image", ""),
                "source": item.get("source", ""),
            }
            for item in image_results
            if item.get("image") or item.get("thumbnail")
        ],
    })


@app.route("/<path:filename>")
def static_files(filename):
    if ".." in filename:
        return jsonify({"error": "Not found"}), 404
    file_path = ROOT / filename
    if file_path.is_file():
        return send_from_directory(ROOT, filename)
    return jsonify({"error": "Not found"}), 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
