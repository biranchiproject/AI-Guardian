import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle
import os

# Create models directory if it doesn't exist
models_dir = 'models'
if not os.path.exists(models_dir):
    os.makedirs(models_dir)

def train_and_save(data, model_name):
    print(f"Training {model_name} model...")
    df = pd.DataFrame(data)
    
    vectorizer = TfidfVectorizer(lowercase=True, stop_words='english')
    X = vectorizer.fit_transform(df['text'])
    y = df['label']
    
    model = LogisticRegression()
    model.fit(X, y)
    
    # Save the vectorizer and model
    with open(os.path.join(models_dir, f'{model_name}_vectorizer.pkl'), 'wb') as f:
        pickle.dump(vectorizer, f)
    with open(os.path.join(models_dir, f'{model_name}_model.pkl'), 'wb') as f:
        pickle.dump(model, f)
    print(f"Saved {model_name} model and vectorizer.")

# 1. Toxicity Data
toxicity_data = {
    'text': [
        "I love this product!", "You are a wonderful person.", "Have a great day.",
        "I hate you, you idiot!", "Go away, no one likes you.", "This is stupid and useless.",
        "Shut up, you're so annoying.", "Excellent work on the project.", "Welcome to the team.",
        "You're a loser and a failure.", "Don't ever talk to me again.", "Can you help me with this?"
    ],
    'label': [0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0] # 1 for toxic, 0 for normal
}

# 2. Scam Data
scam_data = {
    'text': [
        "Your account has been locked. Click here to verify.", 
        "You've won $1,000,000! Claim your prize now.",
        "URGENT: Your package is waiting. Pay $2 shipping to receive.",
        "Hello, how are you today?", "Can we schedule a meeting for tomorrow?",
        "Get rich quick with this one simple trick!", "Exclusive crypto opportunity: 1000% returns guaranteed.",
        "The invoice for your recent purchase is attached.", "Please review the attached document.",
        "Your bank account needs immediate attention. Log in at bit.ly/scam-link"
    ],
    'label': [1, 1, 1, 0, 0, 1, 1, 0, 0, 1] # 1 for scam, 0 for normal
}

# 3. Threat Data
threat_data = {
    'text': [
        "SELECT * FROM users WHERE id = 1", "DROP TABLE users;", "<script>alert('XSS')</script>",
        "Normal SQL query for data fetching.", "How to use JavaScript for animations?",
        "'; OR 1=1 --", "../../etc/passwd", "system('rm -rf /')",
        "Standard file path description.", "Using relative paths in CSS.",
        "eval(base64_decode('...'))", "exec('chmod 777 /')"
    ],
    'label': [1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1] # 1 for threat, 0 for normal
}

if __name__ == "__main__":
    train_and_save(toxicity_data, 'toxicity')
    train_and_save(scam_data, 'scam')
    train_and_save(threat_data, 'threat')
    print("All models trained successfully.")
