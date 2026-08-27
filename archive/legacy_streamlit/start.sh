#!/bin/bash

# Start Flask backend in background on port 8080.
# Gemini/Vertex AI calls can take longer than Gunicorn's default 30s timeout.
gunicorn \
    --bind 127.0.0.1:8080 \
    --timeout 300 \
    --graceful-timeout 30 \
    app:app &

# Start Streamlit frontend on port 8501.
streamlit run gui.py \
    --server.port 8501 \
    --server.address 0.0.0.0 \
    --server.headless true &

# Keep both processes alive.
wait -n