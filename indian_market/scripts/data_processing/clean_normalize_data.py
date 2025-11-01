#!/usr/bin/env python3
"""
Clean and normalize Indian stock data into Kronos format
"""

import csv
import os
import math
from datetime import datetime
from typing import List, Dict, Any

def load_csv_data(filepath: str) -> List[Dict[str, Any]]:
    """Load data from CSV file."""
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

def clean_data(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Clean the data by removing invalid entries."""
    cleaned_data = []
    removed_count = 0
    
    for row in data:
        # Check for invalid values
        if (row['Open'] <= 0 or row['High'] <= 0 or row['Low'] <= 0 or 
            row['Close'] <= 0 or row['Volume'] <= 0):
            removed_count += 1
            continue
        
        # Check for price anomalies (e.g., high > low, etc.)
        if not (row['Low'] <= row['Open'] <= row['High'] and 
                row['Low'] <= row['Close'] <= row['High']):
            removed_count += 1
            continue
        
        # Check for extreme price movements (more than 20% daily change)
        price_change = abs(row['Close'] - row['Open']) / row['Open']
        if price_change > 0.20:
            removed_count += 1
            continue
        
        cleaned_data.append(row)
    
    print(f"Removed {removed_count} invalid rows")
    return cleaned_data

def normalize_data(data: List[Dict[str, Any]]) -> tuple:
    """Normalize data using min-max scaling."""
    if not data:
        return data, {}
    
    # Find min and max values for each feature
    features = ['Open', 'High', 'Low', 'Close', 'Volume', 'Amount']
    normalization_params = {}
    
    for feature in features:
        values = [row[feature] for row in data]
        min_val = min(values)
        max_val = max(values)
        normalization_params[feature] = {'min': min_val, 'max': max_val}
    
    # Normalize the data
    normalized_data = []
    for row in data:
        normalized_row = row.copy()
        for feature in features:
            min_val = normalization_params[feature]['min']
            max_val = normalization_params[feature]['max']
            if max_val > min_val:
                normalized_row[feature] = (row[feature] - min_val) / (max_val - min_val)
            else:
                normalized_row[feature] = 0.0
        normalized_data.append(normalized_row)
    
    return normalized_data, normalization_params

def add_technical_indicators(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Add technical indicators to the data."""
    if len(data) < 20:
        return data
    
    # Sort data by date
    data.sort(key=lambda x: x['Date'])
    
    # Calculate technical indicators
    for i in range(len(data)):
        row = data[i]
        
        # Simple Moving Averages
        if i >= 19:  # 20-day SMA
            last_20_close = [data[j]['Close'] for j in range(i-19, i+1)]
            row['SMA_20'] = sum(last_20_close) / 20
        
        if i >= 49:  # 50-day SMA
            last_50_close = [data[j]['Close'] for j in range(i-49, i+1)]
            row['SMA_50'] = sum(last_50_close) / 50
        
        # RSI (Relative Strength Index)
        if i >= 14:
            gains = []
            losses = []
            for j in range(i-13, i+1):
                change = data[j]['Close'] - data[j-1]['Close']
                if change > 0:
                    gains.append(change)
                else:
                    losses.append(abs(change))
            
            if gains and losses:
                avg_gain = sum(gains) / len(gains)
                avg_loss = sum(losses) / len(losses)
                if avg_loss > 0:
                    rs = avg_gain / avg_loss
                    row['RSI'] = 100 - (100 / (1 + rs))
                else:
                    row['RSI'] = 100
            else:
                row['RSI'] = 50
        
        # MACD (Moving Average Convergence Divergence)
        if i >= 26:
            # 12-day EMA
            ema_12 = 0
            for j in range(i-11, i+1):
                weight = 2 / (12 + 1)
                if j == i-11:
                    ema_12 = data[j]['Close']
                else:
                    ema_12 = data[j]['Close'] * weight + ema_12 * (1 - weight)
            
            # 26-day EMA
            ema_26 = 0
            for j in range(i-25, i+1):
                weight = 2 / (26 + 1)
                if j == i-25:
                    ema_26 = data[j]['Close']
                else:
                    ema_26 = data[j]['Close'] * weight + ema_26 * (1 - weight)
            
            row['MACD'] = ema_12 - ema_26
    
    return data

def create_sequences(data: List[Dict[str, Any]], sequence_length: int = 30) -> List[List[Dict[str, Any]]]:
    """Create sequences for time series prediction."""
    sequences = []
    
    # Group data by symbol
    symbol_data = {}
    for row in data:
        symbol = row['Symbol']
        if symbol not in symbol_data:
            symbol_data[symbol] = []
        symbol_data[symbol].append(row)
    
    # Sort each symbol's data by date
    for symbol in symbol_data:
        symbol_data[symbol].sort(key=lambda x: x['Date'])
    
    # Create sequences for each symbol
    for symbol, rows in symbol_data.items():
        for i in range(len(rows) - sequence_length + 1):
            sequence = rows[i:i + sequence_length]
            sequences.append(sequence)
    
    return sequences

def save_processed_data(data: List[Dict[str, Any]], filepath: str):
    """Save processed data to CSV file."""
    if not data:
        print("No data to save")
        return False
    
    try:
        # Get all fieldnames from the data
        fieldnames = set()
        for row in data:
            fieldnames.update(row.keys())
        fieldnames = sorted(fieldnames)
        
        with open(filepath, 'w', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        
        print(f"Saved processed data to {filepath}")
        return True
    except Exception as e:
        print(f"Error saving to {filepath}: {e}")
        return False

def save_sequences(sequences: List[List[Dict[str, Any]]], filepath: str):
    """Save sequences to CSV file."""
    if not sequences:
        print("No sequences to save")
        return False
    
    try:
        # Get all fieldnames from the data
        fieldnames = set()
        fieldnames.update(['sequence_id', 'position_in_sequence'])
        
        for sequence in sequences:
            for row in sequence:
                fieldnames.update(row.keys())
        
        fieldnames = sorted(fieldnames)
        
        with open(filepath, 'w', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for seq_id, sequence in enumerate(sequences):
                for pos, row in enumerate(sequence):
                    row_copy = row.copy()
                    row_copy['sequence_id'] = seq_id
                    row_copy['position_in_sequence'] = pos
                    writer.writerow(row_copy)
        
        print(f"Saved {len(sequences)} sequences to {filepath}")
        return True
    except Exception as e:
        print(f"Error saving sequences to {filepath}: {e}")
        return False

def main():
    """Main function to clean and normalize Indian stock data."""
    # Set up paths
    raw_data_dir = "/home/z/my-project/indian_market/datasets/raw"
    processed_data_dir = "/home/z/my-project/indian_market/datasets/processed"
    
    # Create output directory if it doesn't exist
    os.makedirs(processed_data_dir, exist_ok=True)
    
    print("Starting data cleaning and normalization...")
    
    # Load combined data
    combined_file = os.path.join(raw_data_dir, "combined_nse_data.csv")
    print(f"Loading data from {combined_file}")
    
    data = load_csv_data(combined_file)
    print(f"Loaded {len(data)} rows of data")
    
    if not data:
        print("No data loaded. Exiting.")
        return
    
    # Clean data
    print("Cleaning data...")
    cleaned_data = clean_data(data)
    print(f"Cleaned data: {len(cleaned_data)} rows")
    
    # Add technical indicators
    print("Adding technical indicators...")
    data_with_indicators = add_technical_indicators(cleaned_data)
    print(f"Added technical indicators to {len(data_with_indicators)} rows")
    
    # Normalize data
    print("Normalizing data...")
    normalized_data, normalization_params = normalize_data(data_with_indicators)
    print(f"Normalized {len(normalized_data)} rows")
    
    # Save processed data
    processed_file = os.path.join(processed_data_dir, "processed_nse_data.csv")
    save_processed_data(normalized_data, processed_file)
    
    # Save normalization parameters
    params_file = os.path.join(processed_data_dir, "normalization_params.json")
    import json
    with open(params_file, 'w') as f:
        json.dump(normalization_params, f, indent=2)
    print(f"Saved normalization parameters to {params_file}")
    
    # Create sequences for training
    print("Creating sequences for training...")
    sequences = create_sequences(normalized_data, sequence_length=30)
    print(f"Created {len(sequences)} sequences")
    
    # Save sequences
    sequences_file = os.path.join(processed_data_dir, "training_sequences.csv")
    save_sequences(sequences, sequences_file)
    
    # Print summary statistics
    print("\\nProcessing Summary:")
    print(f"Original data: {len(data)} rows")
    print(f"Cleaned data: {len(cleaned_data)} rows")
    print(f"Normalized data: {len(normalized_data)} rows")
    print(f"Training sequences: {len(sequences)} sequences")
    
    # Sample some data
    if normalized_data:
        sample = normalized_data[0]
        print(f"\\nSample processed data:")
        for key, value in sample.items():
            if isinstance(value, float):
                print(f"{key}: {value:.4f}")
            else:
                print(f"{key}: {value}")
    
    print("\\nData cleaning and normalization completed successfully!")

if __name__ == "__main__":
    main()