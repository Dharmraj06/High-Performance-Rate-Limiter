# Rate Limiter Presentation Website

This directory contains the presentation website for the C++ Rate Limiter project, consisting of a FastAPI backend and a React (Vite + Tailwind CSS) frontend.

---

## 1. How to Create the Python Virtual Environment

Navigate to the `backend` directory:

```bash
cd website/backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

> **Note**: If your system's `python3-venv` does not include `ensurepip`, create it without pip and bootstrap pip:
> ```bash
> python3 -m venv --without-pip venv
> curl -sSL https://bootstrap.pypa.io/get-pip.py -o get-pip.py
> ./venv/bin/python3 get-pip.py
> rm -f get-pip.py
> ```

Activate the virtual environment:

```bash
# On Linux / macOS:
source venv/bin/activate

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
```

---

## 2. How to Install Backend Dependencies

With the virtual environment activated:

```bash
pip install -r requirements.txt
```

---

## 3. How to Start FastAPI

From `website/backend` (with the virtual environment activated):

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API will be live at:
- **API URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

---

## 4. How to Start the React Frontend

Open a new terminal and navigate to `website/frontend`:

```bash
cd website/frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The React frontend development server will start at:
- **Local URL**: `http://localhost:5173`

---

## 5. Available API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/benchmark/baseline` | Raw Google Benchmark baseline dataset |
| `GET` | `/api/benchmark/final` | Raw standalone chrono final benchmark dataset |
| `GET` | `/api/benchmark/comparison` | Structured comparison data with throughput improvements, latency percentage deltas, and speedup multipliers |
