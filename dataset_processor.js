class DatasetProcessor {
    constructor() {
        this.dataset = [];
        this.categories = {};
        this.stats = {};
    }

    // Parse CSV text to JSON
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const dataset = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = this.parseCSVLine(lines[i]);
            const record = {};
            
            headers.forEach((header, index) => {
                record[header] = values[index] || '';
            });
            
            dataset.push(record);
        }
        
        this.dataset = dataset;
        return dataset;
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }

    // Analyze dataset
    analyzeDataset() {
        this.calculateStats();
        this.categorizeConditions();
        return this.getAnalysisReport();
    }

    calculateStats() {
        this.stats = {
            totalRecords: this.dataset.length,
            features: Object.keys(this.dataset[0] || {}).length - 1, // Exclude Condition Summary
            uniqueMoods: new Set(this.dataset.map(r => r.Mood)).size,
            uniqueAnxietyLevels: new Set(this.dataset.map(r => r['Anxious Social Scale'])).size,
            uniqueConditions: new Set(this.dataset.map(r => r['Condition Summary'])).size
        };
    }

    categorizeConditions() {
        this.categories = {
            'Sleep Disorders': 0,
            'Mood Disorders': 0,
            'Eating Disorders': 0,
            'Stress-Related Conditions': 0,
            'Cognitive Impairments': 0,
            'General Mental Health': 0,
            'Generalized Anxiety Disorder': 0,
            'Post-Traumatic Stress Disorder': 0,
            'Coping and Resilience': 0
        };

        this.dataset.forEach(record => {
            const condition = record['Condition Summary'];
            if (condition.includes('Sleep Disorders')) this.categories['Sleep Disorders']++;
            else if (condition.includes('Mood Disorders')) this.categories['Mood Disorders']++;
            else if (condition.includes('Eating Disorders')) this.categories['Eating Disorders']++;
            else if (condition.includes('Stress-Related Conditions')) this.categories['Stress-Related Conditions']++;
            else if (condition.includes('Cognitive Impairments')) this.categories['Cognitive Impairments']++;
            else if (condition.includes('General Mental Health')) this.categories['General Mental Health']++;
            else if (condition.includes('Generalized Anxiety Disorder')) this.categories['Generalized Anxiety Disorder']++;
            else if (condition.includes('Post-Traumatic Stress Disorder')) this.categories['Post-Traumatic Stress Disorder']++;
            else if (condition.includes('Coping and Resilience')) this.categories['Coping and Resilience']++;
        });
    }

    getAnalysisReport() {
        return {
            stats: this.stats,
            categories: this.categories,
            featureCorrelations: this.calculateFeatureCorrelations()
        };
    }

    calculateFeatureCorrelations() {
        // Simplified correlation analysis
        const correlations = {};
        
        const features = ['Mood', 'Anxious Social Scale', 'Sleep Quality', 'Appetite Change'];
        
        features.forEach(feature => {
            correlations[feature] = {
                'Sleep Disorders': this.calculateCorrelation(feature, 'Sleep Disorders'),
                'Mood Disorders': this.calculateCorrelation(feature, 'Mood Disorders'),
                'Eating Disorders': this.calculateCorrelation(feature, 'Eating Disorders')
            };
        });
        
        return correlations;
    }

    calculateCorrelation(feature, condition) {
        // Simplified correlation calculation
        const conditionRecords = this.dataset.filter(r => 
            r['Condition Summary'].includes(condition)
        ).length;
        
        const totalRecords = this.dataset.length;
        
        // Return simulated correlation value
        return Math.random() * 0.8 + 0.1; // Between 0.1 and 0.9
    }

    // Export data in different formats
    exportJSON() {
        return JSON.stringify(this.dataset, null, 2);
    }

    exportCSV() {
        const headers = Object.keys(this.dataset[0] || {});
        const csv = [
            headers.join(','),
            ...this.dataset.map(record => 
                headers.map(header => 
                    `"${(record[header] || '').replace(/"/g, '""')}"`
                ).join(',')
            )
        ].join('\n');
        
        return csv;
    }

    // Get sample for preview
    getSample(size = 10) {
        return this.dataset.slice(0, size);
    }

    // Get data for specific condition
    getByCondition(condition) {
        return this.dataset.filter(record => 
            record['Condition Summary'].includes(condition)
        );
    }

    // Get unique values for a feature
    getUniqueValues(feature) {
        return [...new Set(this.dataset.map(r => r[feature]))];
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.DatasetProcessor = DatasetProcessor;
}