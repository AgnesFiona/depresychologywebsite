import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix, f1_score, precision_recall_fscore_support
import joblib
import json
import warnings
warnings.filterwarnings('ignore')

print("="*60)
print("📊 TRAINING RANDOM FOREST MODEL")
print("="*60)

# 1. Load dataset
df = pd.read_csv('Psychological_Assessment_Dataset.csv')
print(f"✅ Dataset: {len(df)} rows, {len(df.columns)} columns")

# 2. Rename columns to match frontend
rename_map = {
    'Mood: How would you describe your mood over the past two weeks?': 'Mood',
    'Anxious Social Scale: On a scale of 1-10, how often have you felt anxious in social situations recently?': 'Anxious Social Scale',
    'Anxiety Triggers: Have you experienced any of the following anxiety triggers in the past month?': 'Anxiety Triggers',
    'Sleep Quality: How would you rate the quality of your sleep over the past week?': 'Sleep Quality',
    'Appetite Change: Have you noticed any significant changes in your appetite?': 'Appetite Change',
    'Lack of Interest: How often have you felt a lack of interest or pleasure in daily activities?': 'Lack of Interest',
    'Enjoyable Activities: How often do you engage in activities you enjoy or that help you relax?': 'Enjoyable Activities',
    'Physical Anxiety Symptoms: Have you had any physical symptoms of anxiety (e.g., heart palpitations, sweating, shortness of breath)?': 'Physical Anxiety Symptoms',
    'Concentration Difficulty: How often do you find it difficult to concentrate on tasks?': 'Concentration Difficulty',
    'Coping Strategies: What coping strategies have you used when feeling stressed or anxious?': 'Coping Strategies'
}
df = df.rename(columns=rename_map)

# 3. Extract condition name
def extract_condition(text):
    if ': ' in str(text):
        return text.split(':')[0].strip()
    return str(text).strip()

df['Condition'] = df['Condition Summary'].apply(extract_condition)

print("\n📋 Target classes:")
for cond in sorted(df['Condition'].unique()):
    count = len(df[df['Condition'] == cond])
    print(f"   {cond}: {count} samples")

# 4. Features
feature_cols = ['Mood', 'Anxious Social Scale', 'Anxiety Triggers', 'Sleep Quality', 
                'Appetite Change', 'Lack of Interest', 'Enjoyable Activities', 
                'Physical Anxiety Symptoms', 'Concentration Difficulty', 'Coping Strategies']

# 5. Encode ALL features with LabelEncoder
print("\n🔄 Encoding features...")
encoders = {}
X_encoded = pd.DataFrame()

for col in feature_cols:
    le = LabelEncoder()
    X_encoded[col] = le.fit_transform(df[col].astype(str))
    encoders[col] = le
    print(f"   {col}: {len(le.classes_)} unique values")

# 6. Encode target
target_encoder = LabelEncoder()
y_encoded = target_encoder.fit_transform(df['Condition'])
print(f"\n✅ Target: {len(target_encoder.classes_)} classes")

# 7. Split data
X_train, X_test, y_train, y_test = train_test_split(
    X_encoded, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"\n📊 Data split: Train={len(X_train)}, Test={len(X_test)}")

# 8. Train Random Forest
print("\n🤖 Training Random Forest...")
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=30,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

# 9. Evaluate
y_test_pred = model.predict(X_test)
test_acc = accuracy_score(y_test, y_test_pred)
print(f"\n📈 Testing Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")

# 10. Save model and encoders
print("\n💾 Saving model and encoders...")
joblib.dump(model, 'random_forest_model.joblib')
joblib.dump(encoders, 'label_encoders.joblib')
joblib.dump(target_encoder, 'target_encoder.joblib')
print("✅ Model saved!")

# 11. Save results for admin page
print("\n📊 Saving results...")
precision, recall, f1, support = precision_recall_fscore_support(
    y_test, y_test_pred, average=None, labels=range(len(target_encoder.classes_))
)

classification_data = []
for i, class_name in enumerate(target_encoder.classes_):
    classification_data.append({
        'kelas': class_name,
        'precision': round(precision[i] * 100, 2),
        'recall': round(recall[i] * 100, 2),
        'f1': round(f1[i] * 100, 2),
        'support': int(support[i])
    })

feature_importance = model.feature_importances_
fi_list = [{'feature': f, 'importance': round(imp*100, 2)} 
           for f, imp in zip(feature_cols, feature_importance)]
fi_list.sort(key=lambda x: x['importance'], reverse=True)

results = {
    'accuracy': round(test_acc * 100, 2),
    'f1_macro': round(f1_score(y_test, y_test_pred, average='macro') * 100, 2),
    'f1_weighted': round(f1_score(y_test, y_test_pred, average='weighted') * 100, 2),
    'total_samples': len(y_test),
    'classification_report': classification_data,
    'feature_importance': fi_list,
    'class_names': target_encoder.classes_.tolist(),
    'confusion_matrix': confusion_matrix(y_test, y_test_pred).tolist()
}

with open('classification_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print("✅ Results saved to classification_results.json")
print(f"   - Accuracy: {results['accuracy']}%")
print("\n" + "="*60)
print("🎉 TRAINING COMPLETE!")
print("="*60)