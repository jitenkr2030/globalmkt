#!/usr/bin/env python3
"""
Simple API interface for Kronos Indian Stock Market Model
"""

from flask import Flask, request, jsonify
import os
import json
import csv
from typing import List, Dict, Any
from datetime import datetime
import sys

# Add project path
sys.path.append('/home/z/my-project/indian_market/scripts/evaluation')
from predict import KronosPredictor
from evaluate import KronosEvaluator

app = Flask(__name__)

# Global variables
predictor = None
evaluator = None
model_path = "/home/z/my-project/indian_market/models/kronos-small"
tokenizer_path = "/home/z/my-project/indian_market/datasets/tokenized/kronos_tokenizer.json"
results_dir = "/home/z/my-project/indian_market/results"

# Create results directory if it doesn't exist
os.makedirs(results_dir, exist_ok=True)

def initialize_model():
    """Initialize the model and predictor."""
    global predictor, evaluator
    
    try:
        print("Initializing Kronos model...")
        predictor = KronosPredictor(model_path, tokenizer_path)
        
        if not predictor.load_model_and_tokenizer():
            return False
        
        evaluator = KronosEvaluator(model_path, tokenizer_path)
        if not evaluator.load_model():
            return False
        
        print("Model initialized successfully!")
        return True
        
    except Exception as e:
        print(f"Error initializing model: {e}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": predictor is not None
    })

@app.route('/info', methods=['GET'])
def get_model_info():
    """Get model information."""
    if not predictor:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        model_info = predictor.model.get_model_info()
        return jsonify(model_info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Make predictions."""
    if not predictor:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.get_json()
        
        if not data or 'sequences' not in data:
            return jsonify({"error": "No sequences provided"}), 400
        
        sequences = data['sequences']
        task = data.get('task', 'price')
        
        if task not in ['price', 'volatility', 'volume']:
            return jsonify({"error": f"Invalid task: {task}"}), 400
        
        # Make predictions
        predictions = predictor.batch_predict(sequences, task=task)
        
        # Generate trading signals if price prediction
        signals = None
        if task == 'price':
            signals = predictor.generate_trading_signals(predictions)
        
        response = {
            "predictions": predictions,
            "task": task,
            "timestamp": datetime.now().isoformat(),
            "num_sequences": len(sequences)
        }
        
        if signals:
            response["signals"] = signals
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict/price', methods=['POST'])
def predict_price():
    """Make price movement predictions."""
    if not predictor:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.get_json()
        
        if not data or 'sequences' not in data:
            return jsonify({"error": "No sequences provided"}), 400
        
        sequences = data['sequences']
        
        # Make predictions
        predictions = predictor.batch_predict(sequences, task="price")
        
        # Generate trading signals
        signals = predictor.generate_trading_signals(predictions)
        
        response = {
            "predictions": predictions,
            "signals": signals,
            "task": "price",
            "timestamp": datetime.now().isoformat(),
            "num_sequences": len(sequences)
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict/volatility', methods=['POST'])
def predict_volatility():
    """Make volatility predictions."""
    if not predictor:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.get_json()
        
        if not data or 'sequences' not in data:
            return jsonify({"error": "No sequences provided"}), 400
        
        sequences = data['sequences']
        
        # Make predictions
        predictions = predictor.batch_predict(sequences, task="volatility")
        
        response = {
            "predictions": predictions,
            "task": "volatility",
            "timestamp": datetime.now().isoformat(),
            "num_sequences": len(sequences)
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict/volume', methods=['POST'])
def predict_volume():
    """Make volume predictions."""
    if not predictor:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.get_json()
        
        if not data or 'sequences' not in data:
            return jsonify({"error": "No sequences provided"}), 400
        
        sequences = data['sequences']
        
        # Make predictions
        predictions = predictor.batch_predict(sequences, task="volume")
        
        response = {
            "predictions": predictions,
            "task": "volume",
            "timestamp": datetime.now().isoformat(),
            "num_sequences": len(sequences)
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/evaluate', methods=['POST'])
def evaluate():
    """Evaluate model."""
    if not evaluator:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.get_json()
        
        if not data or 'sequences' not in data or 'labels' not in data:
            return jsonify({"error": "Sequences and labels required"}), 400
        
        sequences = data['sequences']
        labels = data['labels']
        
        if len(sequences) != len(labels):
            return jsonify({"error": "Sequences and labels must have same length"}), 400
        
        # Evaluate model
        results = evaluator.evaluate_model(sequences, labels)
        
        response = {
            "results": results,
            "timestamp": datetime.now().isoformat(),
            "num_sequences": len(sequences)
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """Make batch predictions with multiple tasks."""
    if not predictor:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.get_json()
        
        if not data or 'sequences' not in data:
            return jsonify({"error": "No sequences provided"}), 400
        
        sequences = data['sequences']
        tasks = data.get('tasks', ['price', 'volatility', 'volume'])
        
        results = {}
        
        for task in tasks:
            if task in ['price', 'volatility', 'volume']:
                predictions = predictor.batch_predict(sequences, task=task)
                results[task] = predictions
                
                # Generate trading signals for price predictions
                if task == 'price':
                    signals = predictor.generate_trading_signals(predictions)
                    results[task + '_signals'] = signals
        
        response = {
            "results": results,
            "tasks": tasks,
            "timestamp": datetime.now().isoformat(),
            "num_sequences": len(sequences)
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload_data', methods=['POST'])
def upload_data():
    """Upload data file and make predictions."""
    if not predictor:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({"error": "File must be CSV format"}), 400
        
        # Read CSV file
        sequences = []
        current_sequence = []
        current_symbol = None
        
        # Save uploaded file temporarily
        temp_path = os.path.join(results_dir, 'temp_upload.csv')
        file.save(temp_path)
        
        # Process CSV file
        with open(temp_path, 'r') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                # Convert numeric fields
                for key in ['Open', 'High', 'Low', 'Close', 'Volume', 'Amount']:
                    if key in row:
                        row[key] = float(row[key])
                
                # Group by symbol and create sequences
                symbol = row.get('Symbol', 'UNKNOWN')
                if current_symbol is None:
                    current_symbol = symbol
                
                if symbol != current_symbol:
                    if current_sequence:
                        sequences.append(current_sequence)
                    current_sequence = [row]
                    current_symbol = symbol
                else:
                    current_sequence.append(row)
                
                # Limit sequence length
                if len(current_sequence) >= 30:
                    sequences.append(current_sequence)
                    current_sequence = []
            
            # Add last sequence
            if current_sequence:
                sequences.append(current_sequence)
        
        # Clean up temp file
        os.remove(temp_path)
        
        if not sequences:
            return jsonify({"error": "No valid sequences found in file"}), 400
        
        # Get task from request
        task = request.form.get('task', 'price')
        
        if task not in ['price', 'volatility', 'volume']:
            return jsonify({"error": f"Invalid task: {task}"}), 400
        
        # Make predictions
        predictions = predictor.batch_predict(sequences, task=task)
        
        # Generate trading signals if price prediction
        signals = None
        if task == 'price':
            signals = predictor.generate_trading_signals(predictions)
        
        response = {
            "predictions": predictions,
            "task": task,
            "timestamp": datetime.now().isoformat(),
            "num_sequences": len(sequences),
            "filename": file.filename
        }
        
        if signals:
            response["signals"] = signals
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status', methods=['GET'])
def get_status():
    """Get system status."""
    model_exists = os.path.exists(model_path)
    tokenizer_exists = os.path.exists(tokenizer_path)
    results_exist = os.path.exists(results_dir)
    
    status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": predictor is not None,
        "evaluator_loaded": evaluator is not None,
        "model_file_exists": model_exists,
        "tokenizer_file_exists": tokenizer_exists,
        "results_dir_exists": results_exist,
        "model_path": model_path,
        "tokenizer_path": tokenizer_path,
        "results_dir": results_dir
    }
    
    if results_exist:
        files = os.listdir(results_dir)
        status["results_files"] = files
    
    return jsonify(status)

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Initialize model
    if initialize_model():
        print("Starting Kronos API server...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("Failed to initialize model. Exiting.")