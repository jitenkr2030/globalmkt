#!/usr/bin/env python3
"""
CLI interface for Kronos Indian Stock Market Model
"""

import argparse
import os
import json
import sys
import csv
from typing import List, Dict, Any
from datetime import datetime

# Add project path
sys.path.append('/home/z/my-project/indian_market/scripts/evaluation')
from predict import KronosPredictor
sys.path.append('/home/z/my-project/indian_market/scripts/evaluation')
try:
    from evaluate import KronosEvaluator
except ImportError:
    # If evaluate is not in the same directory, try to import it directly
    import importlib.util
    spec = importlib.util.spec_from_file_location("evaluate", "/home/z/my-project/indian_market/scripts/evaluation/evaluate_model.py")
    evaluate_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(evaluate_module)
    KronosEvaluator = evaluate_module.KronosEvaluator

class KronosCLI:
    """
    Command Line Interface for Kronos model operations.
    """
    
    def __init__(self):
        self.model_path = "/home/z/my-project/indian_market/models/kronos-small"
        self.tokenizer_path = "/home/z/my-project/indian_market/datasets/tokenized/kronos_tokenizer.json"
        self.results_dir = "/home/z/my-project/indian_market/results"
        self.predictor = None
        self.evaluator = None
        
        # Create results directory if it doesn't exist
        os.makedirs(self.results_dir, exist_ok=True)
    
    def load_model(self) -> bool:
        """Load the model and predictor."""
        try:
            print("Loading Kronos model...")
            self.predictor = KronosPredictor(self.model_path, self.tokenizer_path)
            
            if not self.predictor.load_model_and_tokenizer():
                print("Failed to load model")
                return False
            
            self.evaluator = KronosEvaluator(self.model_path, self.tokenizer_path)
            if not self.evaluator.load_model():
                print("Failed to load evaluator")
                return False
            
            print("Model loaded successfully!")
            return True
            
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    def predict_command(self, args):
        """Handle predict command."""
        if not self.load_model():
            return
        
        if args.input_file:
            # Load data from file
            sequences = self.load_data_from_file(args.input_file)
        else:
            # Use sample data
            sequences = self.create_sample_data()
        
        if not sequences:
            print("No data to predict on")
            return
        
        print(f"Making predictions on {len(sequences)} sequences...")
        
        # Make predictions
        if args.task == "price":
            predictions = self.predictor.batch_predict(sequences, task="price")
        elif args.task == "volatility":
            predictions = self.predictor.batch_predict(sequences, task="volatility")
        elif args.task == "volume":
            predictions = self.predictor.batch_predict(sequences, task="volume")
        else:
            print(f"Unknown task: {args.task}")
            return
        
        # Save predictions
        if args.output_file:
            self.save_predictions(predictions, args.output_file)
        
        # Print results
        self.print_predictions(predictions, args.task)
        
        # Generate trading signals if price prediction
        if args.task == "price":
            signals = self.predictor.generate_trading_signals(predictions)
            if args.output_file:
                signals_file = args.output_file.replace('.json', '_signals.csv')
                self.save_signals(signals, signals_file)
            self.print_signals(signals)
    
    def evaluate_command(self, args):
        """Handle evaluate command."""
        if not self.load_model():
            return
        
        if args.test_file:
            # Load test data with labels
            sequences, labels = self.load_test_data_with_labels(args.test_file)
        else:
            # Use sample data
            sequences = self.create_sample_data()
            labels = [2]  # Sample label (up movement)
        
        if not sequences:
            print("No test data to evaluate on")
            return
        
        print(f"Evaluating model on {len(sequences)} test sequences...")
        
        # Evaluate model
        results = self.evaluator.evaluate_model(sequences, labels)
        
        # Save results
        if args.output_file:
            self.save_evaluation_results(results, args.output_file)
        
        # Print results
        self.evaluator.print_evaluation_results(results)
    
    def info_command(self, args):
        """Handle info command."""
        if not self.load_model():
            return
        
        # Get model info
        model_info = self.predictor.model.get_model_info()
        
        print("\\n" + "="*60)
        print("KRONOS MODEL INFORMATION")
        print("="*60)
        
        info = model_info["model_info"]
        config = model_info["config"]
        
        print(f"Model Name: {info['name']}")
        print(f"Version: {info['version']}")
        print(f"Description: {info['description']}")
        print(f"Architecture: {info['architecture']}")
        print(f"Parameters: {info['parameters']:,}")
        print(f"Max Sequence Length: {info['max_sequence_length']}")
        print(f"Vocabulary Size: {info['vocab_size']}")
        
        print("\\nConfiguration:")
        print(f"Hidden Size: {config['hidden_size']}")
        print(f"Number of Layers: {config['num_hidden_layers']}")
        print(f"Number of Attention Heads: {config['num_attention_heads']}")
        print(f"Intermediate Size: {config['intermediate_size']}")
        print(f"Hidden Activation: {config['hidden_act']}")
        print(f"Attention Dropout: {config['attention_probs_dropout_prob']}")
        print(f"Hidden Dropout: {config['hidden_dropout_prob']}")
        
        print("="*60)
    
    def status_command(self, args):
        """Handle status command."""
        print("\\n" + "="*60)
        print("KRONOS SYSTEM STATUS")
        print("="*60)
        
        # Check model files
        model_exists = os.path.exists(self.model_path)
        tokenizer_exists = os.path.exists(self.tokenizer_path)
        
        print(f"Model Path: {self.model_path}")
        print(f"Model Status: {'✓ Ready' if model_exists else '✗ Not Found'}")
        
        print(f"\\nTokenizer Path: {self.tokenizer_path}")
        print(f"Tokenizer Status: {'✓ Ready' if tokenizer_exists else '✗ Not Found'}")
        
        # Check results directory
        results_exist = os.path.exists(self.results_dir)
        print(f"\\nResults Directory: {self.results_dir}")
        print(f"Results Status: {'✓ Ready' if results_exist else '✗ Not Found'}")
        
        if results_exist:
            files = os.listdir(self.results_dir)
            print(f"Results Files: {len(files)} files")
            for file in files:
                print(f"  - {file}")
        
        # Check system resources
        print("\\nSystem Resources:")
        print(f"Python Version: {sys.version}")
        print(f"Working Directory: {os.getcwd()}")
        
        print("="*60)
    
    def load_data_from_file(self, filepath: str) -> List[List[Dict[str, Any]]]:
        """Load data from CSV file."""
        try:
            sequences = []
            current_sequence = []
            current_symbol = None
            
            with open(filepath, 'r') as f:
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
            
            return sequences
            
        except Exception as e:
            print(f"Error loading data from file: {e}")
            return []
    
    def load_test_data_with_labels(self, filepath: str) -> tuple:
        """Load test data with labels."""
        try:
            sequences = []
            labels = []
            
            with open(filepath, 'r') as f:
                reader = csv.DictReader(f)
                
                # Group data by sequence_id
                sequence_data = {}
                sequence_labels = {}
                
                for row in reader:
                    seq_id = int(row.get('sequence_id', 0))
                    
                    # Convert numeric fields
                    for key in ['Open', 'High', 'Low', 'Close', 'Volume', 'Amount']:
                        if key in row:
                            row[key] = float(row[key])
                    
                    if seq_id not in sequence_data:
                        sequence_data[seq_id] = []
                    
                    sequence_data[seq_id].append(row)
                    
                    # Get label from the last row in the sequence
                    if 'labels' in row:
                        sequence_labels[seq_id] = int(row['labels'])
                
                # Create sequences and labels
                for seq_id in sorted(sequence_data.keys()):
                    sequences.append(sequence_data[seq_id])
                    labels.append(sequence_labels[seq_id])
            
            return sequences, labels
            
        except Exception as e:
            print(f"Error loading test data: {e}")
            return [], []
    
    def create_sample_data(self) -> List[List[Dict[str, Any]]]:
        """Create sample data for prediction."""
        return [
            [
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
        ]
    
    def save_predictions(self, predictions: List[Dict[str, Any]], filepath: str):
        """Save predictions to file."""
        try:
            with open(filepath, 'w') as f:
                json.dump(predictions, f, indent=2)
            print(f"Predictions saved to {filepath}")
        except Exception as e:
            print(f"Error saving predictions: {e}")
    
    def save_signals(self, signals: List[Dict[str, Any]], filepath: str):
        """Save trading signals to CSV file."""
        try:
            if not signals:
                return
            
            fieldnames = list(signals[0].keys())
            
            with open(filepath, 'w', newline='') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(signals)
            
            print(f"Trading signals saved to {filepath}")
        except Exception as e:
            print(f"Error saving signals: {e}")
    
    def save_evaluation_results(self, results: Dict[str, Any], filepath: str):
        """Save evaluation results to file."""
        try:
            with open(filepath, 'w') as f:
                json.dump(results, f, indent=2)
            print(f"Evaluation results saved to {filepath}")
        except Exception as e:
            print(f"Error saving evaluation results: {e}")
    
    def print_predictions(self, predictions: List[Dict[str, Any]], task: str):
        """Print predictions."""
        print(f"\\n{task.upper()} Predictions:")
        print("-" * 50)
        
        for i, pred in enumerate(predictions):
            if "error" in pred:
                print(f"Sequence {i+1}: Error - {pred['error']}")
            else:
                if task == "price":
                    print(f"Sequence {i+1}: {pred['class_name']} (confidence: {pred['confidence']:.3f})")
                elif task == "volatility":
                    print(f"Sequence {i+1}: {pred['volatility_level']} volatility ({pred['predicted_volatility']:.3f})")
                elif task == "volume":
                    print(f"Sequence {i+1}: {pred['volume_level']} volume ({pred['predicted_volume']:.3f})")
    
    def print_signals(self, signals: List[Dict[str, Any]]):
        """Print trading signals."""
        print("\\nTrading Signals:")
        print("-" * 50)
        
        for signal in signals:
            if signal['signal'] == 'ERROR':
                print(f"Sequence {signal['sequence_id']+1}: Error - {signal['reason']}")
            else:
                confidence = signal.get('confidence', 'N/A')
                if isinstance(confidence, float):
                    confidence = f"{confidence:.3f}"
                print(f"Sequence {signal['sequence_id']+1}: {signal['signal']} (confidence: {confidence})")

def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Kronos Indian Stock Market Model CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Make price predictions
  python kronos_cli.py predict --task price
  
  # Make predictions from file
  python kronos_cli.py predict --task price --input_file data.csv --output_file predictions.json
  
  # Evaluate model
  python kronos_cli.py evaluate --test_file test_data.csv --output_file results.json
  
  # Get model information
  python kronos_cli.py info
  
  # Check system status
  python kronos_cli.py status
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Predict command
    predict_parser = subparsers.add_parser('predict', help='Make predictions')
    predict_parser.add_argument('--task', choices=['price', 'volatility', 'volume'], 
                               default='price', help='Prediction task')
    predict_parser.add_argument('--input-file', help='Input CSV file with OHLCV data')
    predict_parser.add_argument('--output-file', help='Output file for predictions')
    
    # Evaluate command
    evaluate_parser = subparsers.add_parser('evaluate', help='Evaluate model')
    evaluate_parser.add_argument('--test-file', help='Test CSV file with labels')
    evaluate_parser.add_argument('--output-file', help='Output file for evaluation results')
    
    # Info command
    info_parser = subparsers.add_parser('info', help='Show model information')
    
    # Status command
    status_parser = subparsers.add_parser('status', help='Show system status')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Create CLI instance
    cli = KronosCLI()
    
    # Execute command
    if args.command == 'predict':
        cli.predict_command(args)
    elif args.command == 'evaluate':
        cli.evaluate_command(args)
    elif args.command == 'info':
        cli.info_command(args)
    elif args.command == 'status':
        cli.status_command(args)
    else:
        print(f"Unknown command: {args.command}")

if __name__ == "__main__":
    main()