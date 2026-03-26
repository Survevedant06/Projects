# SentryStream - Getting Started

## 1. Backend Setup

The backend uses FastAPI and SQLModel (SQLite).

1.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
2.  **Run the server**:
    ```bash
    python main.py
    ```
    The API will be available at **`http://localhost:8080`**.

## 2. Frontend Setup

The frontend is a Next.js application.

1.  **Install dependencies**:
    ```bash
    cd frontend
    npm install
    ```
2.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The dashboard will be available at **`http://localhost:3001`**.

## Features
- **Real-time Monitoring**: WebSocket stream for scan events.
- **Persistence**: Targets and results are saved in `sentry_stream.db`.
- **Modern UI**: Dark-mode dashboard built with Tailwind CSS.
