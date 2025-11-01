#!/usr/bin/env python3
"""
Demo notebook for Kronos Indian Stock Market Model
This script demonstrates the complete workflow of the Kronos model.
"""

import os
import json
import csv
import random
import math
from typing import List, Dict, Any
from datetime import datetime
from collections import defaultdict

# Import our modules
import sys
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

class KronosDemo:
    """
    Demo class for Kronos model showcasing complete workflow.
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
        """Load the model and evaluator."""
        try:
            print("🔄 Loading Kronos model...")
            self.predictor = KronosPredictor(self.model_path, self.tokenizer_path)
            
            if not self.predictor.load_model_and_tokenizer():
                print("❌ Failed to load model")
                return False
            
            self.evaluator = KronosEvaluator(self.model_path, self.tokenizer_path)
            if not self.evaluator.load_model():
                print("❌ Failed to load evaluator")
                return False
            
            print("✅ Model loaded successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False
    
    def create_demo_data(self) -> List[List[Dict[str, Any]]]:
        """Create demonstration data for different scenarios."""
        print("🔄 Creating demonstration data...")
        
        demo_scenarios = [
            # Scenario 1: Bullish trend
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
            ],
            # Scenario 2: Bearish trend
            [
                {
                    'Date': '2023-10-19',
                    'Open': 1500.0,
                    'High': 1510.0,
                    'Low': 1480.0,
                    'Close': 1490.0,
                    'Volume': 800000,
                    'Amount': 1192000000.0,
                    'Symbol': 'HDFCBANK.NS'
                },
                {
                    'Date': '2023-10-20',
                    'Open': 1490.0,
                    'High': 1495.0,
                    'Low': 1470.0,
                    'Close': 1480.0,
                    'Volume': 900000,
                    'Amount': 1332000000.0,
                    'Symbol': 'HDFCBANK.NS'
                }
            ],
            # Scenario 3: High volatility
            [
                {
                    'Date': '2023-10-19',
                    'Open': 1000.0,
                    'High': 1050.0,
                    'Low': 950.0,
                    'Close': 1020.0,
                    'Volume': 2000000,
                    'Amount': 2040000000.0,
                    'Symbol': 'INFY.NS'
                },
                {
                    'Date': '2023-10-20',
                    'Open': 1020.0,
                    'High': 1080.0,
                    'Low': 980.0,
                    'Close': 1000.0,
                    'Volume': 2500000,
                    'Amount': 2500000000.0,
                    'Symbol': 'INFY.NS'
                }
            ]
        ]
        
        print(f"✅ Created {len(demo_scenarios)} demonstration scenarios")
        return demo_scenarios
    
    def demonstrate_predictions(self):
        """Demonstrate prediction capabilities."""
        print("\\n" + "="*60)
        print("🔮 PREDICTION DEMONSTRATION")
        print("="*60)
        
        # Create demo data
        demo_data = self.create_demo_data()
        scenario_names = ["Bullish Trend", "Bearish Trend", "High Volatility"]
        
        for i, (scenario, name) in enumerate(zip(demo_data, scenario_names)):
            print(f"\\n📊 Scenario {i+1}: {name}")
            print("-" * 40)
            
            # Display input data
            print("Input Data:")
            for j, row in enumerate(scenario):
                print(f"  Day {j+1}: Open={row['Open']:.0f}, High={row['High']:.0f}, Low={row['Low']:.0f}, Close={row['Close']:.0f}")
            
            # Make predictions
            print("\\nPredictions:")
            
            # Price prediction
            price_pred = self.predictor.predict_price_movement(scenario)
            if "error" not in price_pred:
                print(f"  📈 Price Movement: {price_pred['class_name'].upper()}")
                print(f"  🎯 Confidence: {price_pred['confidence']:.3f}")
                print(f"  📊 Probabilities: Down={price_pred['probabilities'][0]:.3f}, Neutral={price_pred['probabilities'][1]:.3f}, Up={price_pred['probabilities'][2]:.3f}")
            else:
                print(f"  ❌ Price prediction error: {price_pred['error']}")
            
            # Volatility prediction
            vol_pred = self.predictor.predict_volatility(scenario)
            if "error" not in vol_pred:
                print(f"  🌊 Volatility: {vol_pred['volatility_level'].upper()} ({vol_pred['predicted_volatility']:.3f})")
            else:
                print(f"  ❌ Volatility prediction error: {vol_pred['error']}")
            
            # Volume prediction
            vol_pred = self.predictor.predict_volume(scenario)
            if "error" not in vol_pred:
                print(f"  📦 Volume: {vol_pred['volume_level'].upper()} ({vol_pred['predicted_volume']:.3f})")
            else:
                print(f"  ❌ Volume prediction error: {vol_pred['error']}")
            
            # Generate trading signal
            signals = self.predictor.generate_trading_signals([price_pred])
            if signals:
                signal = signals[0]
                if signal['signal'] != 'ERROR':
                    print(f"  💡 Trading Signal: {signal['signal']}")
                else:
                    print(f"  ❌ Signal error: {signal['reason']}")
    
    def demonstrate_evaluation(self):
        """Demonstrate evaluation capabilities."""
        print("\\n" + "="*60)
        print("📊 EVALUATION DEMONSTRATION")
        print("="*60)
        
        # Create test data
        test_sequences = self.create_demo_data()
        test_labels = [2, 0, 1]  # Up, Down, Neutral
        
        print(f"🔄 Evaluating model on {len(test_sequences)} test sequences...")
        
        # Evaluate model
        results = self.evaluator.evaluate_model(test_sequences, test_labels)
        
        # Display results
        if "error" not in results:
            print("\\n📈 Evaluation Results:")
            
            # Accuracy metrics
            acc_metrics = results["accuracy_metrics"]
            print(f"  🎯 Overall Accuracy: {acc_metrics['overall_accuracy']:.1%} ({acc_metrics['correct_predictions']}/{acc_metrics['total_predictions']})")
            print(f"  📊 Down Class Accuracy: {acc_metrics.get('class_0_accuracy', 0):.1%}")
            print(f"  📊 Neutral Class Accuracy: {acc_metrics.get('class_1_accuracy', 0):.1%}")
            print(f"  📊 Up Class Accuracy: {acc_metrics.get('class_2_accuracy', 0):.1%}")
            
            # Precision, Recall, F1
            prf_metrics = results["precision_recall_f1"]
            if "error" not in prf_metrics:
                print("\\n🎯 Precision, Recall, F1 Scores:")
                class_names = ["down", "neutral", "up"]
                for class_name in class_names:
                    precision = prf_metrics.get(f"{class_name}_precision", 0)
                    recall = prf_metrics.get(f"{class_name}_recall", 0)
                    f1 = prf_metrics.get(f"{class_name}_f1", 0)
                    print(f"  {class_name.capitalize()}: P={precision:.3f}, R={recall:.3f}, F1={f1:.3f}")
                
                print(f"  Macro Avg: P={prf_metrics.get('macro_precision', 0):.3f}, R={prf_metrics.get('macro_recall', 0):.3f}, F1={prf_metrics.get('macro_f1', 0):.3f}")
            
            # Confusion matrix
            conf_matrix = results["confusion_matrix"]
            if conf_matrix.get("confusion_matrix"):
                print("\\n📋 Confusion Matrix:")
                matrix = conf_matrix["confusion_matrix"]
                class_names = conf_matrix["class_names"]
                
                print("          " + " ".join(f"{name:>8}" for name in class_names))
                print("          " + "-" * 24)
                
                for i, true_class in enumerate(class_names):
                    row = f"{true_class:>8} |"
                    for j in range(3):
                        row += f" {matrix[i][j]:>7}"
                    print(row)
        else:
            print(f"❌ Evaluation error: {results['error']}")
    
    def demonstrate_model_info(self):
        """Demonstrate model information."""
        print("\\n" + "="*60)
        print("ℹ️  MODEL INFORMATION")
        print("="*60)
        
        model_info = self.predictor.model.get_model_info()
        info = model_info["model_info"]
        config = model_info["config"]
        
        print(f"🏷️  Model Name: {info['name']}")
        print(f"📋 Version: {info['version']}")
        print(f"📝 Description: {info['description']}")
        print(f"🏗️  Architecture: {info['architecture']}")
        print(f"🔢 Parameters: {info['parameters']:,}")
        print(f"📏 Max Sequence Length: {info['max_sequence_length']}")
        print(f"📚 Vocabulary Size: {info['vocab_size']}")
        
        print("\\n⚙️  Configuration:")
        print(f"  Hidden Size: {config['hidden_size']}")
        print(f"  Number of Layers: {config['num_hidden_layers']}")
        print(f"  Number of Attention Heads: {config['num_attention_heads']}")
        print(f"  Intermediate Size: {config['intermediate_size']}")
        print(f"  Hidden Activation: {config['hidden_act']}")
        print(f"  Attention Dropout: {config['attention_probs_dropout_prob']}")
        print(f"  Hidden Dropout: {config['hidden_dropout_prob']}")
    
    def generate_metrics_report(self):
        """Generate comprehensive metrics report."""
        print("\\n" + "="*60)
        print("📈 GENERATING METRICS REPORT")
        print("="*60)
        
        # Create comprehensive test data
        test_sequences = []
        test_labels = []
        
        # Generate more test scenarios
        for i in range(10):
            # Create random test sequence
            sequence = []
            base_price = random.uniform(100, 5000)
            
            for j in range(5):
                price_change = random.uniform(-0.05, 0.05)
                open_price = base_price * (1 + price_change)
                high_price = open_price * random.uniform(1.0, 1.02)
                low_price = open_price * random.uniform(0.98, 1.0)
                close_price = open_price * random.uniform(0.98, 1.02)
                volume = random.randint(500000, 5000000)
                
                sequence.append({
                    'Date': f'2023-10-{19+j:02d}',
                    'Open': open_price,
                    'High': high_price,
                    'Low': low_price,
                    'Close': close_price,
                    'Volume': volume,
                    'Amount': close_price * volume,
                    'Symbol': f'STOCK_{i+1}.NS'
                })
                
                base_price = close_price
            
            test_sequences.append(sequence)
            # Generate random label
            test_labels.append(random.randint(0, 2))
        
        print(f"🔄 Generated {len(test_sequences)} test sequences")
        
        # Evaluate model
        results = self.evaluator.evaluate_model(test_sequences, test_labels)
        
        # Generate comprehensive report
        report = {
            "report_timestamp": datetime.now().isoformat(),
            "model_info": self.predictor.model.get_model_info()["model_info"],
            "test_data_info": {
                "num_sequences": len(test_sequences),
                "num_labels": len(test_labels),
                "label_distribution": {
                    "down": test_labels.count(0),
                    "neutral": test_labels.count(1),
                    "up": test_labels.count(2)
                }
            },
            "evaluation_results": results,
            "performance_summary": self.generate_performance_summary(results),
            "recommendations": self.generate_recommendations(results)
        }
        
        # Save report
        report_file = os.path.join(self.results_dir, "comprehensive_metrics_report.json")
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"✅ Comprehensive metrics report saved to {report_file}")
        
        # Display summary
        self.display_metrics_summary(report)
        
        return report
    
    def generate_performance_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate performance summary from evaluation results."""
        if "error" in results:
            return {"error": results["error"]}
        
        acc_metrics = results["accuracy_metrics"]
        prf_metrics = results["precision_recall_f1"]
        
        return {
            "overall_accuracy": acc_metrics["overall_accuracy"],
            "macro_f1_score": prf_metrics.get("macro_f1", 0),
            "performance_rating": self.get_performance_rating(acc_metrics["overall_accuracy"]),
            "strengths": self.identify_strengths(results),
            "weaknesses": self.identify_weaknesses(results)
        }
    
    def generate_recommendations(self, results: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on evaluation results."""
        if "error" in results:
            return ["Unable to generate recommendations due to evaluation error"]
        
        recommendations = []
        acc_metrics = results["accuracy_metrics"]
        prf_metrics = results["precision_recall_f1"]
        
        accuracy = acc_metrics["overall_accuracy"]
        macro_f1 = prf_metrics.get("macro_f1", 0)
        
        if accuracy < 0.6:
            recommendations.append("Model performance is below acceptable threshold. Consider retraining with more data.")
            recommendations.append("Review feature engineering and data preprocessing steps.")
        elif accuracy < 0.8:
            recommendations.append("Model performance is moderate. Consider hyperparameter tuning.")
            recommendations.append("Increase training data size and diversity.")
        else:
            recommendations.append("Model performance is good. Consider fine-tuning for specific use cases.")
        
        if macro_f1 < 0.7:
            recommendations.append("Class imbalance detected. Consider balanced sampling or class weights.")
        
        # Check per-class performance
        for class_name in ["down", "neutral", "up"]:
            precision = prf_metrics.get(f"{class_name}_precision", 0)
            recall = prf_metrics.get(f"{class_name}_recall", 0)
            
            if precision < 0.7:
                recommendations.append(f"Low precision for {class_name} class. Review false positives.")
            if recall < 0.7:
                recommendations.append(f"Low recall for {class_name} class. Review false negatives.")
        
        return recommendations
    
    def get_performance_rating(self, accuracy: float) -> str:
        """Get performance rating based on accuracy."""
        if accuracy >= 0.9:
            return "Excellent"
        elif accuracy >= 0.8:
            return "Good"
        elif accuracy >= 0.7:
            return "Fair"
        elif accuracy >= 0.6:
            return "Poor"
        else:
            return "Very Poor"
    
    def identify_strengths(self, results: Dict[str, Any]) -> List[str]:
        """Identify model strengths."""
        strengths = []
        acc_metrics = results["accuracy_metrics"]
        prf_metrics = results["precision_recall_f1"]
        
        accuracy = acc_metrics["overall_accuracy"]
        
        if accuracy >= 0.8:
            strengths.append("High overall accuracy")
        
        # Check per-class performance
        for class_name in ["down", "neutral", "up"]:
            precision = prf_metrics.get(f"{class_name}_precision", 0)
            recall = prf_metrics.get(f"{class_name}_recall", 0)
            f1 = prf_metrics.get(f"{class_name}_f1", 0)
            
            if precision >= 0.8 and recall >= 0.8:
                strengths.append(f"Strong performance on {class_name} class")
            elif f1 >= 0.8:
                strengths.append(f"Good F1 score for {class_name} class")
        
        return strengths if strengths else ["No significant strengths identified"]
    
    def identify_weaknesses(self, results: Dict[str, Any]) -> List[str]:
        """Identify model weaknesses."""
        weaknesses = []
        acc_metrics = results["accuracy_metrics"]
        prf_metrics = results["precision_recall_f1"]
        
        accuracy = acc_metrics["overall_accuracy"]
        
        if accuracy < 0.7:
            weaknesses.append("Low overall accuracy")
        
        # Check per-class performance
        for class_name in ["down", "neutral", "up"]:
            precision = prf_metrics.get(f"{class_name}_precision", 0)
            recall = prf_metrics.get(f"{class_name}_recall", 0)
            f1 = prf_metrics.get(f"{class_name}_f1", 0)
            
            if precision < 0.6:
                weaknesses.append(f"Low precision for {class_name} class")
            if recall < 0.6:
                weaknesses.append(f"Low recall for {class_name} class")
            if f1 < 0.6:
                weaknesses.append(f"Low F1 score for {class_name} class")
        
        return weaknesses if weaknesses else ["No significant weaknesses identified"]
    
    def display_metrics_summary(self, report: Dict[str, Any]):
        """Display metrics summary."""
        print("\\n📊 METRICS SUMMARY")
        print("-" * 40)
        
        perf_summary = report["performance_summary"]
        
        print(f"🎯 Overall Accuracy: {perf_summary['overall_accuracy']:.1%}")
        print(f"🏆 Macro F1 Score: {perf_summary['macro_f1_score']:.3f}")
        print(f"⭐ Performance Rating: {perf_summary['performance_rating']}")
        
        print("\\n💪 Strengths:")
        for strength in perf_summary["strengths"]:
            print(f"  ✓ {strength}")
        
        print("\\n⚠️  Weaknesses:")
        for weakness in perf_summary["weaknesses"]:
            print(f"  • {weakness}")
        
        print("\\n💡 Recommendations:")
        for rec in report["recommendations"]:
            print(f"  → {rec}")
    
    def run_complete_demo(self):
        """Run complete demonstration."""
        print("🚀 STARTING KRONOS MODEL COMPLETE DEMONSTRATION")
        print("="*60)
        
        # Load model
        if not self.load_model():
            print("❌ Demo failed - could not load model")
            return
        
        # Demonstrate model information
        self.demonstrate_model_info()
        
        # Demonstrate predictions
        self.demonstrate_predictions()
        
        # Demonstrate evaluation
        self.demonstrate_evaluation()
        
        # Generate metrics report
        self.generate_metrics_report()
        
        print("\\n" + "="*60)
        print("🎉 DEMONSTRATION COMPLETED SUCCESSFULLY!")
        print("="*60)
        print("\\n📁 Results saved to:", self.results_dir)
        print("🔧 Try the CLI: python3 indian_market/scripts/deployment/kronos_cli.py --help")
        print("🌐 Try the API: python3 indian_market/scripts/deployment/kronos_api.py")

def main():
    """Main function to run the demo."""
    demo = KronosDemo()
    demo.run_complete_demo()

if __name__ == "__main__":
    main()