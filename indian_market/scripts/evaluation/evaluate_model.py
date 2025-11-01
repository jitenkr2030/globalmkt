#!/usr/bin/env python3
"""
Evaluation script for Kronos Indian Stock Market Model
"""

import os
import json
import csv
import random
import math
from typing import List, Dict, Any, Tuple
from datetime import datetime
from collections import defaultdict, Counter

# Import our predictor
import sys
sys.path.append('/home/z/my-project/indian_market/scripts/evaluation')
from predict import KronosPredictor

class KronosEvaluator:
    """
    Evaluation class for Kronos model on Indian stock market data.
    """
    
    def __init__(self, model_path: str, tokenizer_path: str):
        self.predictor = KronosPredictor(model_path, tokenizer_path)
        self.evaluation_results = {}
        
    def load_model(self) -> bool:
        """Load the model and tokenizer."""
        return self.predictor.load_model_and_tokenizer()
    
    def calculate_accuracy(self, predictions: List[Dict[str, Any]], 
                          true_labels: List[int]) -> Dict[str, float]:
        """
        Calculate accuracy metrics.
        
        Args:
            predictions: List of prediction results
            true_labels: List of true labels
            
        Returns:
            Dictionary with accuracy metrics
        """
        try:
            if len(predictions) != len(true_labels):
                raise ValueError("Predictions and true labels must have the same length")
            
            correct_predictions = 0
            class_correct = defaultdict(int)
            class_total = defaultdict(int)
            
            for pred, true_label in zip(predictions, true_labels):
                if "error" in pred:
                    continue
                
                predicted_class = pred["predicted_class"]
                
                if predicted_class == true_label:
                    correct_predictions += 1
                    class_correct[true_label] += 1
                
                class_total[true_label] += 1
            
            # Overall accuracy
            overall_accuracy = correct_predictions / len(predictions) if predictions else 0
            
            # Per-class accuracy
            class_accuracy = {}
            for class_idx in range(3):  # 3 classes: down, neutral, up
                if class_total[class_idx] > 0:
                    class_accuracy[f"class_{class_idx}_accuracy"] = class_correct[class_idx] / class_total[class_idx]
                else:
                    class_accuracy[f"class_{class_idx}_accuracy"] = 0.0
            
            return {
                "overall_accuracy": overall_accuracy,
                "correct_predictions": correct_predictions,
                "total_predictions": len(predictions),
                **class_accuracy
            }
            
        except Exception as e:
            print(f"Error calculating accuracy: {e}")
            return {"overall_accuracy": 0.0, "error": str(e)}
    
    def calculate_confusion_matrix(self, predictions: List[Dict[str, Any]], 
                                 true_labels: List[int]) -> Dict[str, Any]:
        """
        Calculate confusion matrix.
        
        Args:
            predictions: List of prediction results
            true_labels: List of true labels
            
        Returns:
            Dictionary with confusion matrix
        """
        try:
            confusion_matrix = [[0 for _ in range(3)] for _ in range(3)]
            
            for pred, true_label in zip(predictions, true_labels):
                if "error" in pred:
                    continue
                
                predicted_class = pred["predicted_class"]
                
                if 0 <= true_label < 3 and 0 <= predicted_class < 3:
                    confusion_matrix[true_label][predicted_class] += 1
            
            return {
                "confusion_matrix": confusion_matrix,
                "class_names": ["down", "neutral", "up"]
            }
            
        except Exception as e:
            print(f"Error calculating confusion matrix: {e}")
            return {"confusion_matrix": [], "error": str(e)}
    
    def calculate_precision_recall_f1(self, predictions: List[Dict[str, Any]], 
                                     true_labels: List[int]) -> Dict[str, Any]:
        """
        Calculate precision, recall, and F1 score.
        
        Args:
            predictions: List of prediction results
            true_labels: List of true labels
            
        Returns:
            Dictionary with precision, recall, and F1 scores
        """
        try:
            confusion_matrix = [[0 for _ in range(3)] for _ in range(3)]
            
            for pred, true_label in zip(predictions, true_labels):
                if "error" in pred:
                    continue
                
                predicted_class = pred["predicted_class"]
                
                if 0 <= true_label < 3 and 0 <= predicted_class < 3:
                    confusion_matrix[true_label][predicted_class] += 1
            
            metrics = {}
            class_names = ["down", "neutral", "up"]
            
            for class_idx in range(3):
                # True positives, false positives, false negatives
                tp = confusion_matrix[class_idx][class_idx]
                fp = sum(confusion_matrix[i][class_idx] for i in range(3) if i != class_idx)
                fn = sum(confusion_matrix[class_idx][i] for i in range(3) if i != class_idx)
                
                # Precision
                precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
                
                # Recall
                recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
                
                # F1 score
                f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
                
                class_name = class_names[class_idx]
                metrics[f"{class_name}_precision"] = precision
                metrics[f"{class_name}_recall"] = recall
                metrics[f"{class_name}_f1"] = f1
            
            # Macro averages
            macro_precision = sum(metrics[f"{name}_precision"] for name in class_names) / 3
            macro_recall = sum(metrics[f"{name}_recall"] for name in class_names) / 3
            macro_f1 = sum(metrics[f"{name}_f1"] for name in class_names) / 3
            
            metrics.update({
                "macro_precision": macro_precision,
                "macro_recall": macro_recall,
                "macro_f1": macro_f1
            })
            
            return metrics
            
        except Exception as e:
            print(f"Error calculating precision/recall/F1: {e}")
            return {"error": str(e)}
    
    def evaluate_model(self, test_sequences: List[List[Dict[str, Any]]], 
                     test_labels: List[int]) -> Dict[str, Any]:
        """
        Evaluate the model on test data.
        
        Args:
            test_sequences: List of test sequences
            test_labels: List of test labels
            
        Returns:
            Dictionary with evaluation results
        """
        try:
            print(f"Evaluating model on {len(test_sequences)} test sequences...")
            
            # Make predictions
            predictions = self.predictor.batch_predict(test_sequences, task="price")
            
            # Calculate metrics
            accuracy_metrics = self.calculate_accuracy(predictions, test_labels)
            confusion_matrix = self.calculate_confusion_matrix(predictions, test_labels)
            precision_recall_f1 = self.calculate_precision_recall_f1(predictions, test_labels)
            
            # Combine results
            evaluation_results = {
                "evaluation_timestamp": datetime.now().isoformat(),
                "test_data_size": len(test_sequences),
                "accuracy_metrics": accuracy_metrics,
                "confusion_matrix": confusion_matrix,
                "precision_recall_f1": precision_recall_f1,
                "model_info": self.predictor.model.get_model_info()["model_info"]
            }
            
            self.evaluation_results = evaluation_results
            return evaluation_results
            
        except Exception as e:
            print(f"Error evaluating model: {e}")
            return {"error": str(e)}
    
    def print_evaluation_results(self, results: Dict[str, Any]):
        """Print evaluation results in a readable format."""
        print("\\n" + "="*60)
        print("MODEL EVALUATION RESULTS")
        print("="*60)
        
        if "error" in results:
            print(f"Error: {results['error']}")
            return
        
        print(f"Evaluation Time: {results['evaluation_timestamp']}")
        print(f"Test Data Size: {results['test_data_size']}")
        print(f"Model: {results['model_info']['name']} v{results['model_info']['version']}")
        
        # Accuracy metrics
        acc_metrics = results["accuracy_metrics"]
        print("\\nAccuracy Metrics:")
        print(f"Overall Accuracy: {acc_metrics['overall_accuracy']:.3f} ({acc_metrics['correct_predictions']}/{acc_metrics['total_predictions']})")
        print(f"Down Class Accuracy: {acc_metrics.get('class_0_accuracy', 0):.3f}")
        print(f"Neutral Class Accuracy: {acc_metrics.get('class_1_accuracy', 0):.3f}")
        print(f"Up Class Accuracy: {acc_metrics.get('class_2_accuracy', 0):.3f}")
        
        # Confusion matrix
        conf_matrix = results["confusion_matrix"]
        if conf_matrix.get("confusion_matrix"):
            print("\\nConfusion Matrix:")
            matrix = conf_matrix["confusion_matrix"]
            class_names = conf_matrix["class_names"]
            
            # Print header
            print("          " + " ".join(f"{name:>8}" for name in class_names))
            print("          " + "-" * 24)
            
            # Print rows
            for i, true_class in enumerate(class_names):
                row = f"{true_class:>8} |"
                for j in range(3):
                    row += f" {matrix[i][j]:>7}"
                print(row)
        
        # Precision, Recall, F1
        prf_metrics = results["precision_recall_f1"]
        if "error" not in prf_metrics:
            print("\\nPrecision, Recall, and F1 Scores:")
            class_names = ["down", "neutral", "up"]
            
            for class_name in class_names:
                precision = prf_metrics.get(f"{class_name}_precision", 0)
                recall = prf_metrics.get(f"{class_name}_recall", 0)
                f1 = prf_metrics.get(f"{class_name}_f1", 0)
                print(f"{class_name.capitalize():>8} - P: {precision:.3f}, R: {recall:.3f}, F1: {f1:.3f}")
            
            print(f"{'Macro Avg':>8} - P: {prf_metrics.get('macro_precision', 0):.3f}, R: {prf_metrics.get('macro_recall', 0):.3f}, F1: {prf_metrics.get('macro_f1', 0):.3f}")
        
        print("="*60)

def load_test_data_with_labels(filepath: str) -> Tuple[List[List[Dict[str, Any]]], List[int]]:
    """Load test data with labels from CSV file."""
    try:
        sequences = []
        labels = []
        
        with open(filepath, 'r') as f:
            reader = csv.DictReader(f)
            
            # Group data by sequence_id
            sequence_data = defaultdict(list)
            sequence_labels = {}
            
            for row in reader:
                seq_id = int(row.get('sequence_id', 0))
                
                # Convert numeric fields
                for key in ['Open', 'High', 'Low', 'Close', 'Volume', 'Amount']:
                    if key in row:
                        row[key] = float(row[key])
                
                sequence_data[seq_id].append(row)
                
                # Get label from the last row in the sequence
                if 'labels' in row:
                    sequence_labels[seq_id] = int(row['labels'])
            
            # Create sequences and labels
            for seq_id in sorted(sequence_data.keys()):
                sequences.append(sequence_data[seq_id])
                labels.append(sequence_labels[seq_id])
        
        print(f"Loaded {len(sequences)} test sequences with labels")
        return sequences, labels
        
    except Exception as e:
        print(f"Error loading test data with labels: {e}")
        return [], []

def save_evaluation_results(results: Dict[str, Any], filepath: str):
    """Save evaluation results to JSON file."""
    try:
        with open(filepath, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"Evaluation results saved to {filepath}")
    except Exception as e:
        print(f"Error saving evaluation results: {e}")

def main():
    """Main function to run evaluation."""
    print("Starting Kronos model evaluation...")
    
    # Set up paths
    model_path = "/home/z/my-project/indian_market/models/kronos-small"
    tokenizer_path = "/home/z/my-project/indian_market/datasets/tokenized/kronos_tokenizer.json"
    test_data_path = "/home/z/my-project/indian_market/datasets/processed/training_sequences.csv"
    results_dir = "/home/z/my-project/indian_market/results"
    
    # Create results directory
    os.makedirs(results_dir, exist_ok=True)
    
    # Initialize evaluator
    evaluator = KronosEvaluator(model_path, tokenizer_path)
    
    # Load model
    if not evaluator.load_model():
        print("Failed to load model. Exiting.")
        return
    
    # Load test data
    print("Loading test data...")
    test_sequences, test_labels = load_test_data_with_labels(test_data_path)
    
    if not test_sequences:
        print("No test data loaded. Creating sample data...")
        
        # Create sample test data
        sample_sequences = [
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
        sample_labels = [2]  # Up movement
        test_sequences = sample_sequences
        test_labels = sample_labels
    
    print(f"Using {len(test_sequences)} test sequences")
    
    # Evaluate model
    print("\\nEvaluating model...")
    evaluation_results = evaluator.evaluate_model(test_sequences, test_labels)
    
    # Print results
    evaluator.print_evaluation_results(evaluation_results)
    
    # Save results
    results_file = os.path.join(results_dir, "evaluation_results.json")
    save_evaluation_results(evaluation_results, results_file)
    
    print("\\nEvaluation completed successfully!")

if __name__ == "__main__":
    main()