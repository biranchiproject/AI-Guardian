# AI Guardian: Intelligent Cyber Safety & Hybrid AI Threat Detection

AI Guardian is a production-grade cybersecurity platform that combines **Rule-Based Deterministic Logic** with **Hybrid AI (Llama 3.3)** to detect toxicity, scams, and cyber threats in real-time.

## 🚀 Key Features

- **Hybrid URL Safety Scanner**: 
    - Whitelist check for trusted domains (Zero false positives).
    - Structural anomaly detection (DGA & Phishing patterns).
    - **Expert AI Insight**: High-speed reasoning powered by Groq (Llama 3.3).
- **AI Guardian Expert (Chatbot)**: A floating security consultant that analyzes suspicious links and messages on demand.
- **Multi-Model Message Analysis**:
    - **Toxicity Filter**: Hate speech and harassment detection.
    - **Scam Detection**: Phishing and social engineering identification.
    - **Threat Intel**: Payload analysis for SQLi, XSS, and command injections.
- **Android Integration**: Real-time notification scanning for mobile safety (Kotlin).
- **Intelligence Dashboard**: Real-time stats and comprehensive risk maps.

## 🛠️ Technology Stack

- **Backend**: Python 3.13+, Flask
- **AI Engine**: Groq API (Speculative Decoding for ultra-fast Llama 3.3 70B inference)
- **Frontend**: React, Next.js, Framer Motion, TailwindCSS, Shadcn/UI
- **Machine Learning**: Scikit-Learn (TF-IDF + Logistic Regression)

## 📁 Project Structure

```text
/frontend           - Next.js Dashboard & Link Scanner
/clients/android    - Kotlin Notification Listener Service
/models             - Trained ML model pickles
app.py              - Unified Flask API (Rules + AI)
groq_client.py      - High-performance Groq API wrapper
requirements.txt    - Python dependencies
.env.example        - Template for API keys
```

## ⚙️ Setup & Installation

### 1. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Create .env from example and add your GROQ_API_KEY
cp .env.example .env

# Run the server
python app.py
```
*Backend runs on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd frontend
pnpm install
pnpm dev
```
*Accessible on `http://localhost:3000`*

## 🛡️ Security & Privacy
AI Guardian uses a **"Rule-First"** architecture. Risk levels are determined by deterministic security logic, with the AI providing human-readable explanations. This prevents "hallucinations" and ensures critical safety decisions are always accurate.

---
Built with ❤️ for a Safer Digital World.
