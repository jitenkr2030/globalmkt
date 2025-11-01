#!/usr/bin/env python3
"""
Prediction script for Kronos Indian Stock Market Model
"""

import os
import json
import csv
import random
import math
from typing import List, Dict, Any, Tuple
from datetime import datetime
from collections import defaultdict

# Import our model and tokenizer
import sys
sys.path.append('/home/z/my-project/indian_market/scripts/training')
from load_model import SimpleKronosModel

class KronosPredictor:
    """
    Prediction class for Kronos model on Indian stock market data.
    """
    
    def __init__(self, model_path: str, tokenizer_path: str):
        self.model_path = model_path
        self.tokenizer_path = tokenizer_path
        self.model = None
        self.tokenizer_data = None
        self.is_loaded = False
        
    def load_model_and_tokenizer(self) -> bool:
        """Load the model and tokenizer."""
        try:
            print("Loading Kronos model...")
            self.model = SimpleKronosModel(self.model_path)
            
            if not self.model.load_model():
                print("Failed to load model")
                return False
            
            print("Loading tokenizer...")
            with open(self.tokenizer_path, 'r') as f:
                self.tokenizer_data = json.load(f)
            
            self.is_loaded = True
            print("Model and tokenizer loaded successfully!")
            return True
            
        except Exception as e:
            print(f"Error loading model and tokenizer: {e}")
            return False
    
    def preprocess_input(self, data: List[Dict[str, Any]]) -> List[int]:
        """
        Preprocess input data for prediction.
        
        Args:
            data: List of dictionaries with OHLCV data
            
        Returns:
            List of token IDs
        """
        if not self.tokenizer_data:
            raise RuntimeError("Tokenizer not loaded")
        
        try:
            # Get feature ranges from tokenizer
            feature_ranges = self.tokenizer_data.get("feature_ranges", {})
            feature_names = self.tokenizer_data.get("feature_names", ["open", "high", "low", "close", "volume", "amount"])
            vocab_size = self.tokenizer_data.get("vocab_size", 10000)
            
            # Add CLS token
            tokens = [2]  # CLS token
            
            # Process each row in the sequence
            for row in data:
                for feature in feature_names:
                    key = feature.capitalize()
                    if key in row:
                        value = row[key]
                        
                        # Normalize value using feature ranges
                        if feature in feature_ranges:
                            min_val = feature_ranges[feature]["min"]
                            max_val = feature_ranges[feature]["max"]
                            if max_val > min_val:
                                normalized = (value - min_val) / (max_val - min_val)
                            else:
                                normalized = 0.5
                        else:
                            normalized = 0.5
                        
                        # Convert to token
                        token_id = int(normalized * (vocab_size - 100)) + 5  # Offset for special tokens
                        token_id = min(token_id, vocab_size - 1)
                        token_id = max(token_id, 5)
                        tokens.append(token_id)
                    else:
                        tokens.append(1)  # UNK token
            
            # Add SEP token
            tokens.append(3)  # SEP token
            
            # Pad to max length
            max_length = 512
            if len(tokens) > max_length:
                tokens = tokens[:max_length-1] + [3]  # Truncate and keep SEP
            else:
                tokens.extend([0] * (max_length - len(tokens)))  # PAD token
            
            return tokens
            
        except Exception as e:
            print(f"Error preprocessing input: {e}")
            return []
    
    def predict_price_movement(self, input_sequence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict price movement for a given input sequence.
        
        Args:
            input_sequence: List of dictionaries with OHLCV data
            
        Returns:
            Dictionary with prediction results
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")
        
        try:
            # Preprocess input
            input_tokens = self.preprocess_input(input_sequence)
            
            # Make prediction
            prediction = self.model.predict(input_tokens, task="price")
            
            if "error" in prediction:
                return prediction
            
            # Add additional metadata
            prediction.update({
                "input_length": len(input_sequence),
                "prediction_type": "price_movement",
                "model_info": self.model.get_model_info()["model_info"],
                "timestamp": datetime.now().isoformat()
            })
            
            return prediction
            
        except Exception as e:
            print(f"Error predicting price movement: {e}")
            return {"error": str(e)}
    
    def predict_volatility(self, input_sequence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict volatility for a given input sequence.
        
        Args:
            input_sequence: List of dictionaries with OHLCV data
            
        Returns:
            Dictionary with prediction results
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")
        
        try:
            # Preprocess input
            input_tokens = self.preprocess_input(input_sequence)
            
            # Make prediction
            prediction = self.model.predict(input_tokens, task="volatility")
            
            if "error" in prediction:
                return prediction
            
            # Add additional metadata
            prediction.update({
                "input_length": len(input_sequence),
                "prediction_type": "volatility",
                "model_info": self.model.get_model_info()["model_info"],
                "timestamp": datetime.now().isoformat()
            })
            
            return prediction
            
        except Exception as e:
            print(f"Error predicting volatility: {e}")
            return {"error": str(e)}
    
    def predict_volume(self, input_sequence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict volume for a given input sequence.
        
        Args:
            input_sequence: List of dictionaries with OHLCV data
            
        Returns:
            Dictionary with prediction results
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")
        
        try:
            # Preprocess input
            input_tokens = self.preprocess_input(input_sequence)
            
            # Make prediction
            prediction = self.model.predict(input_tokens, task="volume")
            
            if "error" in prediction:
                return prediction
            
            # Add additional metadata
            prediction.update({
                "input_length": len(input_sequence),
                "prediction_type": "volume",
                "model_info": self.model.get_model_info()["model_info"],
                "timestamp": datetime.now().isoformat()
            })
            
            return prediction
            
        except Exception as e:
            print(f"Error predicting volume: {e}")
            return {"error": str(e)}
    
    def batch_predict(self, input_sequences: List[List[Dict[str, Any]]], 
                     task: str = "price") -> List[Dict[str, Any]]:
        """
        Make batch predictions for multiple input sequences.
        
        Args:
            input_sequences: List of input sequences
            task: Prediction task ("price", "volatility", "volume")
            
        Returns:
            List of prediction results
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")
        
        results = []
        
        for i, sequence in enumerate(input_sequences):
            print(f"Processing sequence {i+1}/{len(input_sequences)}...")
            
            if task == "price":
                result = self.predict_price_movement(sequence)
            elif task == "volatility":
                result = self.predict_volatility(sequence)
            elif task == "volume":
                result = self.predict_volume(sequence)
            else:
                result = {"error": f"Unknown task: {task}"}
            
            results.append(result)
        
        return results
    
    def generate_trading_signals(self, predictions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate trading signals from predictions.
        
        Args:
            predictions: List of prediction results
            
        Returns:
            List of trading signals
        """
        signals = []
        
        for i, pred in enumerate(predictions):
            if "error" in pred:
                signals.append({
                    "sequence_id": i,
                    "signal": "ERROR",
                    "confidence": 0.0,
                    "reason": pred["error"]
                })
                continue
            
            if pred["prediction_type"] == "price_movement":
                predicted_class = pred["predicted_class"]
                confidence = pred["confidence"]
                
                if predicted_class == 2:  # Up
                    signal = "BUY"
                elif predicted_class == 0:  # Down
                    signal = "SELL"
                else:  # Neutral
                    signal = "HOLD"
                
                signals.append({
                    "sequence_id": i,
                    "signal": signal,
                    "confidence": confidence,
                    "predicted_class": predicted_class,
                    "class_name": pred["class_name"],
                    "probabilities": pred["probabilities"]
                })
            
            elif pred["prediction_type"] == "volatility":
                volatility_level = pred["volatility_level"]
                predicted_volatility = pred["predicted_volatility"]
                
                if volatility_level == "high":
                    signal = "HIGH_VOLATILITY"
                else:
                    signal = "LOW_VOLATILITY"
                
                signals.append({
                    "sequence_id": i,
                    "signal": signal,
                    "volatility_level": volatility_level,
                    "predicted_volatility": predicted_volatility
                })
            
            elif pred["prediction_type"] == "volume":
                volume_level = pred["volume_level"]
                predicted_volume = pred["predicted_volume"]
                
                if volume_level == "high":
                    signal = "HIGH_VOLUME"
                else:
                    signal = "LOW_VOLUME"
                
                signals.append({
                    "sequence_id": i,
                    "signal": signal,
                    "volume_level": volume_level,
                    "predicted_volume": predicted_volume
                })
        
        return signals

def load_test_data(filepath: str) -> List[List[Dict[str, Any]]]:
    """Load test data from CSV file."""
    try:
        data = []
        with open(filepath, 'r') as f:
            reader = csv.DictReader(f)
            current_sequence = []
            current_symbol = None
            
            for row in reader:
                # Convert numeric fields
                for key in ['Open', 'High', 'Low', 'Close', 'Volume', 'Amount']:
                    if key in row:
                        row[key] = float(row[key])
                
                # Group by symbol and create sequences
                symbol = row['Symbol']
                if current_symbol is None:
                    current_symbol = symbol
                
                if symbol != current_symbol:
                    if current_sequence:
                        data.append(current_sequence)
                    current_sequence = [row]
                    current_symbol = symbol
                else:
                    current_sequence.append(row)
                
                # Limit sequence length
                if len(current_sequence) >= 30:
                    data.append(current_sequence)
                    current_sequence = []
            
            # Add last sequence
            if current_sequence:
                data.append(current_sequence)
        
        print(f"Loaded {len(data)} test sequences")
        return data
        
    except Exception as e:
        print(f"Error loading test data: {e}")
        return []

def save_predictions(predictions: List[Dict[str, Any]], filepath: str):
    """Save predictions to JSON file."""
    try:
        with open(filepath, 'w') as f:
            json.dump(predictions, f, indent=2)
        print(f"Predictions saved to {filepath}")
    except Exception as e:
        print(f"Error saving predictions: {e}")

def save_signals(signals: List[Dict[str, Any]], filepath: str):
    """Save trading signals to CSV file."""
    try:
        if not signals:
            print("No signals to save")
            return
        
        fieldnames = list(signals[0].keys())
        
        with open(filepath, 'w', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(signals)
        
        print(f"Trading signals saved to {filepath}")
    except Exception as e:
        print(f"Error saving signals: {e}")

def main():
    """Main function to run predictions."""
    print("Starting Kronos model prediction...")
    
    # Set up paths
    model_path = "/home/z/my-project/indian_market/models/kronos-small"
    tokenizer_path = "/home/z/my-project/indian_market/datasets/tokenized/kronos_tokenizer.json"
    test_data_path = "/home/z/my-project/indian_market/datasets/processed/training_sequences.csv"
    results_dir = "/home/z/my-project/indian_market/results"
    
    # Create results directory
    os.makedirs(results_dir, exist_ok=True)
    
    # Initialize predictor
    predictor = KronosPredictor(model_path, tokenizer_path)
    
    # Load model and tokenizer
    if not predictor.load_model_and_tokenizer():
        print("Failed to load model and tokenizer. Exiting.")
        return
    
    # Load test data
    print("Loading test data...")
    test_sequences = load_test_data(test_data_path)
    
    if not test_sequences:
        print("No test data loaded. Using sample data...")
        
        # Create sample test data
        sample_sequence = [
            {
                'Date': '2023-10-19',
                'Open': 2500.0,
                'High': 2520.0,
                'Low': 2490.0,
                'Close': 2510.0,
                'Volume': 1000000,
                'Amount': 2510000000.0,
                'Symbol': 'RELIANCE.NS'
            },
            {
                'Date': '2023-10-20',
                'Open': 2510.0,
                'High': 2530.0,
                'Low': 2500.0,
                'Close': 2520.0,
                'Volume': 1200000,
                'Amount': 3024000000.0,
                'Symbol': 'RELIANCE.NS'
            }
        ]
        test_sequences = [sample_sequence]
    
    print(f"Using {len(test_sequences)} test sequences")
    
    # Make predictions
    print("\\nMaking predictions...")
    
    # Price movement predictions
    print("Predicting price movements...")
    price_predictions = predictor.batch_predict(test_sequences[:5], task="price")  # Limit to 5 for demo
    
    # Save price predictions
    price_predictions_file = os.path.join(results_dir, "price_predictions.json")
    save_predictions(price_predictions, price_predictions_file)
    
    # Generate trading signals
    print("Generating trading signals...")
    trading_signals = predictor.generate_trading_signals(price_predictions)
    
    # Save trading signals
    signals_file = os.path.join(results_dir, "trading_signals.csv")
    save_signals(trading_signals, signals_file)
    
    # Volatility predictions
    print("Predicting volatility...")
    volatility_predictions = predictor.batch_predict(test_sequences[:3], task="volatility")  # Limit to 3 for demo
    
    # Save volatility predictions
    volatility_file = os.path.join(results_dir, "volatility_predictions.json")
    save_predictions(volatility_predictions, volatility_file)
    
    # Volume predictions
    print("Predicting volume...")
    volume_predictions = predictor.batch_predict(test_sequences[:3], task="volume")  # Limit to 3 for demo
    
    # Save volume predictions
    volume_file = os.path.join(results_dir, "volume_predictions.json")
    save_predictions(volume_predictions, volume_file)
    
    # Print summary
    print("\\nPrediction Summary:")
    print(f"Price predictions: {len(price_predictions)}")
    print(f"Trading signals: {len(trading_signals)}")
    print(f"Volatility predictions: {len(volatility_predictions)}")
    print(f"Volume predictions: {len(volume_predictions)}")
    
    # Print sample predictions
    if price_predictions:
        print("\\nSample Price Prediction:")
        sample_pred = price_predictions[0]
        if "error" not in sample_pred:
            print(f"Predicted Class: {sample_pred['class_name']} ({sample_pred['predicted_class']})")
            print(f"Confidence: {sample_pred['confidence']:.3f}")
            print(f"Probabilities: Down={sample_pred['probabilities'][0]:.3f}, Neutral={sample_pred['probabilities'][1]:.3f}, Up={sample_pred['probabilities'][2]:.3f}")
        else:
            print(f"Error: {sample_pred['error']}")
    
    if trading_signals:
        print("\\nSample Trading Signal:")
        sample_signal = trading_signals[0]
        print(f"Signal: {sample_signal['signal']}")
        print(f"Confidence: {sample_signal.get('confidence', 'N/A')}")
    
    if volatility_predictions:
        print("\\nSample Volatility Prediction:")
        sample_vol = volatility_predictions[0]
        if "error" not in sample_vol:
            print(f"Volatility Level: {sample_vol['volatility_level']}")
            print(f"Predicted Volatility: {sample_vol['predicted_volatility']:.3f}")
        else:
            print(f"Error: {sample_vol['error']}")
    
    print("\\nPrediction completed successfully!")

if __name__ == "__main__":
    main()