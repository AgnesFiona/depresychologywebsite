from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import traceback

app = Flask(__name__, static_folder='.')
CORS(app, resources={r"/*": {"origins": "*"}})

# Path ke file model
MODEL_PATH = 'random_forest_model.joblib'
LABEL_ENCODERS_PATH = 'label_encoders.joblib'
TARGET_ENCODER_PATH = 'target_encoder.joblib'

# Load model
model = None
label_encoders = None
target_encoder = None

print("\n" + "="*50)
print("📂 Loading Model Files...")
print("="*50)

try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model Random Forest loaded")
    else:
        print(f"⚠️ Model file not found. Run train_model.py first!")
        
    if os.path.exists(LABEL_ENCODERS_PATH):
        label_encoders = joblib.load(LABEL_ENCODERS_PATH)
        print(f"✅ Label encoders loaded")
        
    if os.path.exists(TARGET_ENCODER_PATH):
        target_encoder = joblib.load(TARGET_ENCODER_PATH)
        print(f"✅ Target encoder loaded")
        
except Exception as e:
    print(f"❌ Error: {e}")

# Mapping kondisi
condition_info = {
    "Cognitive Impairments": {
        "desc": "Difficulty focusing, concentrating, or remembering things, potentially related to anxiety, fatigue, sleep disorders.",
        "suggestion": "Consult a psychologist for further cognitive evaluation. Train cognitive abilities through reading, puzzles, or brain-stimulating activities."
    },
    "Coping and Resilience": {
        "desc": "Lack of effective coping strategies when facing stress or anxiety.",
        "suggestion": "Start building positive coping strategies: regular exercise, journaling, or joining a supportive community."
    },
    "Eating Disorders": {
        "desc": "Significant appetite fluctuations, often tied to mood changes and stress.",
        "suggestion": "Consult a psychologist or nutritionist experienced in eating disorders."
    },
    "General Mental Health": {
        "desc": "Responses do not strongly align with specific conditions but indicate areas for further exploration.",
        "suggestion": "Maintain a healthy lifestyle, manage stress well, engage in enjoyable activities regularly."
    },
    "Generalized Anxiety Disorder": {
        "desc": "Characterized by chronic, excessive worry about multiple areas of life, along with physical symptoms.",
        "suggestion": "Learn relaxation techniques like deep breathing and grounding. Consider Cognitive Behavioral Therapy (CBT)."
    },
    "Mood Disorders": {
        "desc": "Indicators include mood instability, lack of interest in activities, appetite changes, and sleep disturbances.",
        "suggestion": "Consult a psychologist or psychiatrist promptly. Maintain regular daily routines."
    },
    "Post-Traumatic Stress Disorder": {
        "desc": "Anxiety symptoms tied to specific traumatic triggers, with associated avoidance behaviors.",
        "suggestion": "Seek professional mental health help immediately. Trauma-focused therapies like EMDR are effective."
    },
    "Sleep Disorders": {
        "desc": "Sleep disturbances potentially linked to mood disorders or anxiety.",
        "suggestion": "Practice good sleep hygiene: regular schedule, avoid screens before bed, limit caffeine."
    },
    "Stress-Related Conditions": {
        "desc": "Stress due to identifiable triggers, often linked to reduced self-care.",
        "suggestion": "Identify stress sources, learn time management, practice relaxation techniques."
    }
}

# Kolom yang diharapkan
FEATURE_COLS = ['Mood', 'Anxious Social Scale', 'Anxiety Triggers', 'Sleep Quality', 
                'Appetite Change', 'Lack of Interest', 'Enjoyable Activities', 
                'Physical Anxiety Symptoms', 'Concentration Difficulty', 'Coping Strategies']

# Route untuk menyajikan admin.html
@app.route('/')
def serve_admin():
    return send_from_directory('.', 'admin.html')

@app.route('/admin.html')
def serve_admin_html():
    return send_from_directory('.', 'admin.html')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "mode": "online" if model is not None else "offline",
        "model_loaded": model is not None
    })

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    
    try:
        data = request.json
        print(f"\n📝 Received: {data}")
        
        if not data:
            return jsonify({"status": "error", "message": "No data"}), 400
        
        # Gunakan model jika tersedia
        if model is not None and label_encoders is not None and target_encoder is not None:
            # Encode input menggunakan label encoders yang sudah dilatih
            X_input = []
            for col in FEATURE_COLS:
                val = data.get(col, '')
                le = label_encoders.get(col)
                if le is not None:
                    try:
                        # Coba transform
                        encoded = le.transform([val])[0]
                    except ValueError:
                        # Jika value tidak dikenal, cek apakah ada di classes
                        if val in le.classes_:
                            encoded = le.transform([val])[0]
                        else:
                            # Gunakan value yang paling umum (first class)
                            encoded = 0
                    X_input.append(encoded)
                else:
                    X_input.append(0)
            
            # Prediksi
            prediction_idx = model.predict([X_input])[0]
            condition = target_encoder.inverse_transform([prediction_idx])[0]
            
            # Get confidence
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba([X_input])[0]
                confidence = float(max(proba))
            else:
                confidence = 0.85
            
            mode = "online"
            print(f"✅ Predicted: {condition} (confidence: {confidence:.2f})")
        else:
            # Fallback offline scoring
            condition, confidence = offline_scoring(data)
            mode = "offline"
            print(f"⚠️ Offline mode: {condition}")
        
        # Clean condition name
        if ': ' in condition:
            condition = condition.split(':')[0].strip()
        
        info = condition_info.get(condition, condition_info.get("General Mental Health"))
        
        return jsonify({
            "status": "success",
            "condition": condition,
            "description": info["desc"],
            "suggestion": info["suggestion"],
            "confidence": confidence,
            "mode": mode
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500

def offline_scoring(data):
    """Fallback scoring - simple rule-based"""
    score = 0
    mood_scores = {"Happiness": 1, "Stable": 2, "Mild sadness": 4, "Fluctuating": 5, "Irritability": 6, "Anxiety": 7, "Extreme sadness": 9}
    score += mood_scores.get(data.get('Mood', ''), 3)
    
    anxious_scores = {"Not at all": 1, "Rarely anxious": 2, "Slightly anxious": 3, "Mildly anxious": 4, "Somewhat anxious": 5, "Moderately anxious": 6, "Fairly anxious": 7, "Very anxious": 8, "Extremely anxious": 9, "Constantly anxious": 10}
    score += anxious_scores.get(data.get('Anxious Social Scale', ''), 3)
    
    trigger_scores = {"None of the above": 1, "Work-related stress": 5, "Family issues": 6, "Financial concerns": 6, "Social situations": 7, "Health concerns": 5}
    score += trigger_scores.get(data.get('Anxiety Triggers', ''), 3)
    
    sleep_scores = {"Restful": 1, "None of the above": 2, "Trouble falling asleep": 5, "Interrupted": 5, "Difficulty staying asleep": 7, "Early morning waking": 7}
    score += sleep_scores.get(data.get('Sleep Quality', ''), 3)
    
    appetite_scores = {"No change": 1, "Increased cravings": 4, "Fluctuates daily": 6, "Loss of appetite": 7}
    score += appetite_scores.get(data.get('Appetite Change', ''), 3)
    
    interest_scores = {"Never": 1, "Rarely": 3, "Occasionally": 5, "Frequently": 8, "Always": 10}
    score += interest_scores.get(data.get('Lack of Interest', ''), 3)
    
    enjoyable_scores = {"Daily": 1, "A few times a week": 2, "Once a week": 4, "Rarely": 7, "Never": 10}
    score += enjoyable_scores.get(data.get('Enjoyable Activities', ''), 3)
    
    physical_scores = {"No, not at all": 1, "Rarely": 3, "Yes, occasionally": 6, "Yes, frequently": 9}
    score += physical_scores.get(data.get('Physical Anxiety Symptoms', ''), 3)
    
    concentration_scores = {"Never": 1, "Occasionally": 4, "Frequently": 7, "Constantly": 10}
    score += concentration_scores.get(data.get('Concentration Difficulty', ''), 3)
    
    coping_scores = {"Physical activity": 2, "Journaling or writing": 2, "Mindfulness or meditation": 2, "Social engagement": 2, "No coping strategies": 10}
    score += coping_scores.get(data.get('Coping Strategies', ''), 5)
    
    if score >= 70: condition = "Sleep Disorders"
    elif score >= 62: condition = "Stress-Related Conditions"
    elif score >= 55: condition = "Generalized Anxiety Disorder"
    elif score >= 48: condition = "Mood Disorders"
    elif score >= 42: condition = "Post-Traumatic Stress Disorder"
    elif score >= 38: condition = "Eating Disorders"
    elif score >= 34: condition = "Cognitive Impairments"
    elif score >= 28: condition = "Coping and Resilience"
    else: condition = "General Mental Health"
    
    return condition, min(0.95, 0.5 + (score / 100))

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Psychological Assessment API Server")
    print("="*50)
    print(f"📍 Server: http://127.0.0.1:5000")
    print(f"📄 Admin: http://127.0.0.1:5000/admin.html")
    print(f"❤️ Health: GET http://127.0.0.1:5000/health")
    print(f"🔮 Predict: POST http://127.0.0.1:5000/predict")
    print("="*50 + "\n")
    
    print("📊 Model Status:")
    print(f"   Model: {'✅ Loaded' if model else '❌ Not loaded'}")
    print(f"   Label Encoders: {'✅ Loaded' if label_encoders else '❌ Not loaded'}")
    print(f"   Target Encoder: {'✅ Loaded' if target_encoder else '❌ Not loaded'}")
    print("\n" + "="*50 + "\n")
    
    app.run(debug=True, host='127.0.0.1', port=5000)