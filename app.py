import os
import pickle
import numpy as np
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load models and vectorizers
models = {}
vectorizers = {}

MODEL_CATEGORIES = ['toxicity', 'scam', 'threat']

def load_ml_models():
    for cat in MODEL_CATEGORIES:
        try:
            model_path = os.path.join('models', f'{cat}_model.pkl')
            vect_path = os.path.join('models', f'{cat}_vectorizer.pkl')
            
            if os.path.exists(model_path) and os.path.exists(vect_path):
                with open(model_path, 'rb') as f:
                    models[cat] = pickle.load(f)
                with open(vect_path, 'rb') as f:
                    vectorizers[cat] = pickle.load(f)
                print(f"Loaded {cat} model.")
            else:
                print(f"Warning: {cat} model files not found.")
        except Exception as e:
            print(f"Error loading {cat} model: {e}")

load_ml_models()

def analyze_text(text, category):
    if category not in models or category not in vectorizers:
        return {
            "category": "Unknown",
            "confidence": 0,
            "riskLevel": "Low",
            "alertMessage": "Model not loaded properly."
        }
    
    # Preprocessing
    processed_text = text.lower()
    
    # Transform and predict
    vectorizer = vectorizers[category]
    model = models[category]
    
    vec = vectorizer.transform([processed_text])
    prediction = model.predict(vec)[0]
    probabilities = model.predict_proba(vec)[0]
    confidence = float(np.max(probabilities))
    
    # Map prediction to labels
    if category == 'toxicity':
        label = "Toxic" if prediction == 1 else "Normal"
    elif category == 'scam':
        label = "Scam" if prediction == 1 else "Legitimate"
    else: # threat
        label = "Security Threat" if prediction == 1 else "Safe"
        
    # Risk Level logic
    risk_level = "Low"
    if prediction == 1:
        if confidence > 0.8:
            risk_level = "High"
        else:
            risk_level = "Medium"
            
    # Alert messages
    alerts = {
        'toxicity': {
            'High': "CRITICAL: Highly toxic content detected. This message may violate safety guidelines.",
            'Medium': "WARNING: Potentially offensive language detected.",
            'Low': "CLEAN: No significant toxicity detected."
        },
        'scam': {
            'High': "DANGER: High probability of phishing or fraudulent activity identified.",
            'Medium': "CAUTION: This message matches common scam patterns.",
            'Low': "SAFE: Content appears legitimate."
        },
        'threat': {
            'High': "SEC-ALERT: Malicious code or injection attack patterns detected!",
            'Medium': "SUSPICIOUS: Unusual input patterns that could be malicious.",
            'Low': "SECURE: No security threats identified."
        }
    }
    
    alert_msg = alerts[category].get(risk_level, "No specific alert.")
    
    return {
        "category": label,
        "confidence": confidence,
        "riskLevel": risk_level,
        "alertMessage": alert_msg
    }

@app.route('/analyze/toxicity', methods=['POST'])
def toxicity():
    data = request.json
    text = data.get('text', '')
    return jsonify(analyze_text(text, 'toxicity'))

@app.route('/analyze/scam', methods=['POST'])
def scam():
    data = request.json
    text = data.get('text', '')
    return jsonify(analyze_text(text, 'scam'))

@app.route('/analyze/threat', methods=['POST'])
def threat():
    data = request.json
    text = data.get('text', '')
    return jsonify(analyze_text(text, 'threat'))

from groq_client import groq_client

@app.route('/analyze', methods=['POST'])
def unified_analyze():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
        
    results = {
        'toxicity': analyze_text(text, 'toxicity'),
        'scam': analyze_text(text, 'scam'),
        'threat': analyze_text(text, 'threat')
    }
    
    # Priority: High > Medium > Low
    priority = {'High': 3, 'Medium': 2, 'Low': 1}
    
    # Select the most critical result
    best_cat = 'toxicity'
    max_score = 0
    
    for cat, res in results.items():
        score = priority.get(res['riskLevel'], 0)
        if score > max_score:
            max_score = score
            best_cat = cat
        elif score == max_score and res['confidence'] > results[best_cat]['confidence']:
            best_cat = cat
            
    final_res = results[best_cat]
    
    # HYBRID LOGIC: If confidence is low, use Groq for a second opinion
    if final_res['confidence'] < 0.7:
        print(f"Low confidence ({final_res['confidence']}). Invoking Groq for hybrid analysis...")
        system_prompt = "You are a cybersecurity expert. Analyze this message for scams, social engineering, security threats, or toxicity. Give a one-sentence category and a clear reason."
        user_content = f"Message: {text}"
        ai_response = groq_client.chat_completion(system_prompt, user_content)
        
        if ai_response:
            # We can use the AI response as the alert message
            final_res['alertMessage'] = f"AI GUARDIAN INSIGHT: {ai_response}"
            # Optionally upgrade risk level if AI is very certain (heuristic)
            if "risk" in ai_response.lower() or "scam" in ai_response.lower() or "threat" in ai_response.lower():
                final_res['riskLevel'] = "High"
    
    return jsonify({
        "category": final_res['category'],
        "confidence": final_res['confidence'],
        "risk_level": final_res['riskLevel'],
        "alert": final_res['alertMessage'],
        "ai_powered": final_res['confidence'] < 0.7
    })


from urllib.parse import urlparse

TRUSTED_DOMAINS = [
    "google.com", "openai.com", "chatgpt.com", "github.com", "microsoft.com",
    "apple.com", "amazon.com", "facebook.com", "instagram.com"
]

def is_trusted_domain(url):
    try:
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path.split('/')[0]
        # Remove www and get base domain
        base_domain = domain.replace('www.', '')
        return any(base_domain == d or base_domain.endswith('.' + d) for d in TRUSTED_DOMAINS)
    except:
        return False

def check_suspicious_patterns(url):
    url_lower = url.lower()
    
    # Keyword patterns
    scam_keywords = ['free', 'win', 'money', 'prize', 'gift-card', 'reward']
    phish_keywords = ['login', 'verify', 'account-update', 'security-check', 'signin', 'confirm']
    
    if any(kw in url_lower for kw in scam_keywords + phish_keywords):
        return True, "URL contains common phishing or scam keywords."
    
    # Structural patterns
    parsed = urlparse(url)
    domain = parsed.netloc or parsed.path.split('/')[0]
    
    # Hyphen density (more than 3 hyphens in domain is suspicious)
    if domain.count('-') > 3:
        return True, "Domain contains an unusual number of hyphens, typical of phishing sites."
        
    # Numeric density
    if sum(c.isdigit() for c in domain) > 5:
        return True, "Domain contains excessive numeric characters."
        
    return False, ""

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    query = data.get('query', '')
    context = data.get('context', {})
    
    # 1. Detect if query is about a URL
    url_match = re.search(r'(https?://[^\s]+)', query)
    if url_match:
        url = url_match.group(1)
        # Use our rule-based analyzer internally
        analysis = perform_url_analysis(url)
        
        system_prompt = "You are a cybersecurity assistant. A user asked about a specific link. Use the provided risk level to explain the risks clearly and briefly. Do not override the risk level."
        user_content = f"User asked: {query}\nSystem Analysis: {json.dumps(analysis)}"
        
        ai_response = groq_client.chat_completion(system_prompt, user_content)
        return jsonify({
            "reply": ai_response or f"System analysis for {url} is {analysis['risk_level']}. {analysis['reason']}",
            "advice": "Always check for HTTPS and verified domains."
        })

    # 2. General Query
    system_prompt = "You are a cybersecurity assistant. Give clear, short, and accurate answers. Do not exaggerate risks."
    user_content = f"Question: {query}"
    ai_response = groq_client.chat_completion(system_prompt, user_content)
    
    if not ai_response:
        return jsonify({
            "reply": "I'm having trouble connecting to my central brain right now. Please be cautious online!",
            "advice": "General rule: If it sounds too good to be true, it is."
        })

    return jsonify({
        "reply": ai_response,
        "advice": "Stay safe and use AI Guardian protection."
    })

def perform_url_analysis(url):
    if not url:
        return {"risk_level": "Low", "is_safe": True, "reason": "No URL provided."}
        
    # Step 1: Trusted Check
    if is_trusted_domain(url):
        return {
            "risk_level": "Low",
            "is_safe": True,
            "reason": "This is a trusted official domain."
        }
        
    # Step 2: Suspicious check
    is_suspicious, reason = check_suspicious_patterns(url)
    if is_suspicious:
        return {
            "risk_level": "High",
            "is_safe": False,
            "reason": reason
        }
        
    # Step 3: Default/Medium
    return {
        "risk_level": "Medium",
        "is_safe": False,
        "reason": "Unknown domain with no strong reputation signals."
    }

@app.route('/analyze/url', methods=['POST'])
def analyze_url():
    data = request.json
    url_to_check = data.get('url', '')
    
    if not url_to_check:
        return jsonify({"error": "No URL provided"}), 400

    # Decision logic (Rule-based)
    result = perform_url_analysis(url_to_check)
    
    # Groq Explanation (Controlled)
    system_prompt = f"You are a cybersecurity assistant. Explain why this URL is decided as {result['risk_level']} risk level. Be clear and concise (max 2 sentences)."
    user_content = f"URL: {url_to_check}\nSystem Reason: {result['reason']}"
    ai_explanation = groq_client.chat_completion(system_prompt, user_content)
    
    return jsonify({
        "is_safe": result['is_safe'],
        "risk_level": result['risk_level'],
        "reason": result['reason'],
        "ai_explanation": ai_explanation,
        "url": url_to_check
    })



@app.route('/dashboard/stats', methods=['GET'])
def get_stats():
    # Return dummy stats for the dashboard
    return jsonify({
        "totalAnalyzed": 1250,
        "safeCount": 1100,
        "scamCount": 85,
        "threatCount": 65,
        "recentActivity": [
            {"hour": "2026-04-20T00:00:00", "count": 10},
            {"hour": "2026-04-20T04:00:00", "count": 25},
            {"hour": "2026-04-20T08:00:00", "count": 45}
        ],
        "categoryBreakdown": [
            {"category": "Safe", "count": 1100},
            {"category": "Scam", "count": 85},
            {"category": "Threat", "count": 65}
        ]
    })

@app.route('/analysis/history', methods=['GET'])
def get_history():
    return jsonify([
        {
            "id": 1,
            "analyzedText": "Click here to win a million dollars!",
            "analyzerType": "scam",
            "category": "Scam",
            "riskLevel": "High",
            "confidence": 0.98,
            "createdAt": "2026-04-20T09:00:00Z"
        },
        {
            "id": 2,
            "analyzedText": "SELECT * FROM users WHERE password IS NOT NULL",
            "analyzerType": "threat",
            "category": "SQL Injection",
            "riskLevel": "High",
            "confidence": 0.95,
            "createdAt": "2026-04-20T09:15:00Z"
        },
        {
            "id": 3,
            "analyzedText": "Hey, how are you doing today?",
            "analyzerType": "toxicity",
            "category": "Normal",
            "riskLevel": "Low",
            "confidence": 0.99,
            "createdAt": "2026-04-20T09:30:00Z"
        }
    ])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "models_loaded": list(models.keys())})

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "name": "AI-Guardian API",
        "status": "Running",
        "endpoints": ["/analyze/toxicity", "/analyze/scam", "/analyze/threat", "/analyze", "/analyze/url", "/chatbot"]
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
