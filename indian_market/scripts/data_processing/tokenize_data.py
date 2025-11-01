#!/usr/bin/env python3
"""
Load KronosTokenizer and encode Indian OHLCV dataset
"""

import csv
import os
import json
import math
from typing import List, Dict, Any, Tuple
from collections import defaultdict

class SimpleKronosTokenizer:
    """
    Simple tokenizer for financial time series data.
    Converts OHLCV data into tokenized format suitable for Kronos model.
    """
    
    def __init__(self, vocab_size: int = 10000, max_length: int = 512):
        self.vocab_size = vocab_size
        self.max_length = max_length
        self.feature_names = ["open", "high", "low", "close", "volume", "amount"]
        self.token_to_id = {}
        self.id_to_token = {}
        self.special_tokens = {
            "<PAD>": 0,
            "<UNK>": 1,
            "<CLS>": 2,
            "<SEP>": 3,
            "<MASK>": 4
        }
        
        # Initialize vocabulary
        self._initialize_vocabulary()
    
    def _initialize_vocabulary(self):
        """Initialize the vocabulary with special tokens and basic tokens."""
        # Add special tokens
        for token, token_id in self.special_tokens.items():
            self.token_to_id[token] = token_id
            self.id_to_token[token_id] = token
        
        # Add basic numeric tokens
        for i in range(self.vocab_size - len(self.special_tokens)):
            token = f"VAL_{i}"
            token_id = len(self.token_to_id)
            self.token_to_id[token] = token_id
            self.id_to_token[token_id] = token
    
    def fit(self, data: List[Dict[str, Any]]) -> "SimpleKronosTokenizer":
        """
        Fit the tokenizer on the data.
        
        Args:
            data: List of dictionaries with OHLCV data
            
        Returns:
            Fitted tokenizer
        """
        try:
            print("Fitting tokenizer on data...")
            
            # Extract all values for each feature
            feature_values = defaultdict(list)
            for row in data:
                for feature in self.feature_names:
                    key = feature.capitalize()
                    if key in row:
                        feature_values[feature].append(row[key])
            
            # Calculate min and max for each feature
            self.feature_ranges = {}
            for feature in self.feature_names:
                values = feature_values[feature]
                if values:
                    self.feature_ranges[feature] = {
                        "min": min(values),
                        "max": max(values),
                        "mean": sum(values) / len(values)
                    }
            
            print(f"Tokenizer fitted on {len(data)} samples")
            return self
            
        except Exception as e:
            print(f"Failed to fit tokenizer: {e}")
            raise
    
    def _value_to_token(self, value: float, feature: str) -> str:
        """Convert a continuous value to a token."""
        if feature not in self.feature_ranges:
            return self.special_tokens["<UNK>"]
        
        min_val = self.feature_ranges[feature]["min"]
        max_val = self.feature_ranges[feature]["max"]
        
        # Normalize value to [0, 1]
        if max_val > min_val:
            normalized = (value - min_val) / (max_val - min_val)
        else:
            normalized = 0.5
        
        # Convert to token
        token_id = int(normalized * (self.vocab_size - len(self.special_tokens) - 1)) + len(self.special_tokens)
        token_id = min(token_id, self.vocab_size - 1)
        token_id = max(token_id, len(self.special_tokens))
        
        return f"VAL_{token_id - len(self.special_tokens)}"
    
    def tokenize_row(self, row: Dict[str, Any]) -> List[int]:
        """
        Tokenize a single row of data.
        
        Args:
            row: Dictionary with OHLCV data
            
        Returns:
            List of token IDs
        """
        tokens = []
        
        # Add CLS token
        tokens.append(self.special_tokens["<CLS>"])
        
        # Tokenize each feature
        for feature in self.feature_names:
            key = feature.capitalize()
            if key in row:
                token = self._value_to_token(row[key], feature)
                token_id = self.token_to_id.get(token, self.special_tokens["<UNK>"])
                tokens.append(token_id)
            else:
                tokens.append(self.special_tokens["<UNK>"])
        
        # Add SEP token
        tokens.append(self.special_tokens["<SEP>"])
        
        return tokens
    
    def tokenize_sequence(self, sequence: List[Dict[str, Any]]) -> List[int]:
        """
        Tokenize a sequence of data rows.
        
        Args:
            sequence: List of dictionaries with OHLCV data
            
        Returns:
            List of token IDs
        """
        all_tokens = []
        
        # Add CLS token at the beginning
        all_tokens.append(self.special_tokens["<CLS>"])
        
        # Tokenize each row in the sequence
        for row in sequence:
            row_tokens = []
            for feature in self.feature_names:
                key = feature.capitalize()
                if key in row:
                    token = self._value_to_token(row[key], feature)
                    token_id = self.token_to_id.get(token, self.special_tokens["<UNK>"])
                    row_tokens.append(token_id)
                else:
                    row_tokens.append(self.special_tokens["<UNK>"])
            
            # Add row tokens to sequence
            all_tokens.extend(row_tokens)
        
        # Add SEP token at the end
        all_tokens.append(self.special_tokens["<SEP>"])
        
        # Truncate or pad to max_length
        if len(all_tokens) > self.max_length:
            all_tokens = all_tokens[:self.max_length-1] + [self.special_tokens["<SEP>"]]
        else:
            # Pad with PAD tokens
            all_tokens.extend([self.special_tokens["<PAD>"]] * (self.max_length - len(all_tokens)))
        
        return all_tokens
    
    def encode_dataset(self, data: List[Dict[str, Any]], sequence_length: int = 30) -> Tuple[List[List[int]], List[int]]:
        """
        Encode the entire dataset into token sequences.
        
        Args:
            data: List of dictionaries with OHLCV data
            sequence_length: Length of each sequence
            
        Returns:
            Tuple of (input_ids, labels)
        """
        print(f"Encoding dataset with {len(data)} samples...")
        
        # Group data by symbol
        symbol_data = defaultdict(list)
        for row in data:
            symbol = row["Symbol"]
            symbol_data[symbol].append(row)
        
        # Sort each symbol's data by date
        for symbol in symbol_data:
            symbol_data[symbol].sort(key=lambda x: x["Date"])
        
        # Create sequences
        input_ids = []
        labels = []
        
        for symbol, rows in symbol_data.items():
            for i in range(len(rows) - sequence_length):
                # Create input sequence
                sequence = rows[i:i + sequence_length]
                tokens = self.tokenize_sequence(sequence)
                input_ids.append(tokens)
                
                # Create label (next day's close price change)
                if i + sequence_length < len(rows):
                    current_close = rows[i + sequence_length - 1]["Close"]
                    next_close = rows[i + sequence_length]["Close"]
                    price_change = (next_close - current_close) / current_close
                    
                    # Convert to classification label (0: down, 1: neutral, 2: up)
                    if price_change < -0.01:
                        label = 0
                    elif price_change > 0.01:
                        label = 2
                    else:
                        label = 1
                    
                    labels.append(label)
                else:
                    labels.append(1)  # Default to neutral
        
        print(f"Created {len(input_ids)} token sequences")
        return input_ids, labels
    
    def decode(self, token_ids: List[int]) -> str:
        """
        Decode token IDs back to text representation.
        
        Args:
            token_ids: List of token IDs
            
        Returns:
            Decoded text string
        """
        tokens = []
        for token_id in token_ids:
            if token_id in self.id_to_token:
                tokens.append(self.id_to_token[token_id])
            else:
                tokens.append("<UNK>")
        
        return " ".join(tokens)
    
    def save(self, filepath: str):
        """
        Save tokenizer to file.
        
        Args:
            filepath: Path to save tokenizer
        """
        try:
            tokenizer_data = {
                "vocab_size": self.vocab_size,
                "max_length": self.max_length,
                "feature_names": self.feature_names,
                "token_to_id": self.token_to_id,
                "id_to_token": self.id_to_token,
                "special_tokens": self.special_tokens,
                "feature_ranges": getattr(self, "feature_ranges", {})
            }
            
            with open(filepath, 'w') as f:
                json.dump(tokenizer_data, f, indent=2)
                
            print(f"Tokenizer saved to {filepath}")
                
        except Exception as e:
            print(f"Failed to save tokenizer: {e}")
    
    @classmethod
    def load(cls, filepath: str) -> "SimpleKronosTokenizer":
        """
        Load tokenizer from file.
        
        Args:
            filepath: Path to saved tokenizer
            
        Returns:
            Loaded tokenizer
        """
        try:
            with open(filepath, 'r') as f:
                tokenizer_data = json.load(f)
            
            # Create tokenizer instance
            tokenizer = cls(
                vocab_size=tokenizer_data["vocab_size"],
                max_length=tokenizer_data["max_length"]
            )
            
            # Load tokenizer data
            tokenizer.feature_names = tokenizer_data["feature_names"]
            tokenizer.token_to_id = tokenizer_data["token_to_id"]
            tokenizer.id_to_token = {int(k): v for k, v in tokenizer_data["id_to_token"].items()}
            tokenizer.special_tokens = tokenizer_data["special_tokens"]
            tokenizer.feature_ranges = tokenizer_data.get("feature_ranges", {})
            
            print(f"Tokenizer loaded from {filepath}")
            return tokenizer
            
        except Exception as e:
            print(f"Failed to load tokenizer: {e}")
            raise

def load_processed_data(filepath: str) -> List[Dict[str, Any]]:
    """Load processed data from CSV file."""
    data = []
    try:
        with open(filepath, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Convert numeric fields
                for key in ['Open', 'High', 'Low', 'Close', 'Volume', 'Amount']:
                    if key in row:
                        row[key] = float(row[key])
                data.append(row)
        return data
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return []

def save_tokenized_data(input_ids: List[List[int]], labels: List[int], filepath: str):
    """Save tokenized data to file."""
    try:
        with open(filepath, 'w') as f:
            f.write("input_ids,labels\n")
            for i, (tokens, label) in enumerate(zip(input_ids, labels)):
                tokens_str = " ".join(map(str, tokens))
                f.write(f"{tokens_str},{label}\n")
        
        print(f"Tokenized data saved to {filepath}")
        print(f"Saved {len(input_ids)} sequences")
        return True
    except Exception as e:
        print(f"Error saving tokenized data: {e}")
        return False

def main():
    """Main function to tokenize Indian stock data."""
    # Set up paths
    processed_data_dir = "/home/z/my-project/indian_market/datasets/processed"
    tokenized_data_dir = "/home/z/my-project/indian_market/datasets/tokenized"
    
    # Create output directory if it doesn't exist
    os.makedirs(tokenized_data_dir, exist_ok=True)
    
    print("Starting data tokenization...")
    
    # Load processed data
    processed_file = os.path.join(processed_data_dir, "processed_nse_data.csv")
    print(f"Loading processed data from {processed_file}")
    
    data = load_processed_data(processed_file)
    print(f"Loaded {len(data)} rows of processed data")
    
    if not data:
        print("No data loaded. Exiting.")
        return
    
    # Initialize and fit tokenizer
    print("Initializing tokenizer...")
    tokenizer = SimpleKronosTokenizer(vocab_size=10000, max_length=512)
    tokenizer.fit(data)
    
    # Save tokenizer
    tokenizer_file = os.path.join(tokenized_data_dir, "kronos_tokenizer.json")
    tokenizer.save(tokenizer_file)
    
    # Encode dataset
    print("Encoding dataset...")
    input_ids, labels = tokenizer.encode_dataset(data, sequence_length=30)
    
    # Save tokenized data
    tokenized_file = os.path.join(tokenized_data_dir, "tokenized_dataset.csv")
    save_tokenized_data(input_ids, labels, tokenized_file)
    
    # Print summary statistics
    print("\\nTokenization Summary:")
    print(f"Processed data: {len(data)} rows")
    print(f"Token sequences: {len(input_ids)} sequences")
    print(f"Labels: {len(labels)} labels")
    print(f"Vocabulary size: {tokenizer.vocab_size}")
    print(f"Max sequence length: {tokenizer.max_length}")
    
    # Label distribution
    label_counts = {0: 0, 1: 0, 2: 0}
    for label in labels:
        label_counts[label] += 1
    
    print(f"Label distribution:")
    if len(labels) > 0:
        print(f"  Down (0): {label_counts[0]} ({label_counts[0]/len(labels)*100:.1f}%)")
        print(f"  Neutral (1): {label_counts[1]} ({label_counts[1]/len(labels)*100:.1f}%)")
        print(f"  Up (2): {label_counts[2]} ({label_counts[2]/len(labels)*100:.1f}%)")
    else:
        print("  No labels generated")
    
    # Sample tokenized data
    if input_ids:
        print(f"\\nSample tokenized sequence:")
        sample_tokens = input_ids[0][:20]  # First 20 tokens
        print(f"Tokens: {sample_tokens}")
        print(f"Decoded: {tokenizer.decode(sample_tokens)}")
        print(f"Label: {labels[0]}")
    
    print("\\nData tokenization completed successfully!")

if __name__ == "__main__":
    main()