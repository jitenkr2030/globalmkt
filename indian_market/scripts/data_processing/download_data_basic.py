#!/usr/bin/env python3
"""
Basic data download script for NSE stocks
Creates synthetic data without external dependencies
"""

import csv
import os
import random
import math
from datetime import datetime, timedelta

# NSE stocks to generate data for
NSE_STOCKS = [
    "RELIANCE.NS",  # Reliance Industries
    "TCS.NS",       # Tata Consultancy Services
    "INFY.NS",      # Infosys
    "HDFCBANK.NS",  # HDFC Bank
    "HINDUNILVR.NS", # Hindustan Unilever
    "ITC.NS",       # ITC Limited
    "BHARTIARTL.NS", # Bharti Airtel
    "LT.NS",        # Larsen & Toubro
    "SBIN.NS",      # State Bank of India
    "WIPRO.NS"      # Wipro
]

# Stock parameters (base price and volatility)
STOCK_PARAMS = {
    "RELIANCE.NS": {"base_price": 2500, "volatility": 0.02},
    "TCS.NS": {"base_price": 3500, "volatility": 0.015},
    "INFY.NS": {"base_price": 1400, "volatility": 0.018},
    "HDFCBANK.NS": {"base_price": 1500, "volatility": 0.025},
    "HINDUNILVR.NS": {"base_price": 2500, "volatility": 0.012},
    "ITC.NS": {"base_price": 400, "volatility": 0.02},
    "BHARTIARTL.NS": {"base_price": 800, "volatility": 0.022},
    "LT.NS": {"base_price": 2000, "volatility": 0.025},
    "SBIN.NS": {"base_price": 500, "volatility": 0.03},
    "WIPRO.NS": {"base_price": 400, "volatility": 0.02}
}

def generate_random_normal(mean, std_dev):
    """Generate random number from normal distribution using Box-Muller transform."""
    u1 = random.random()
    u2 = random.random()
    z0 = math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)
    return z0 * std_dev + mean

def generate_stock_data(symbol, start_date, end_date, params):
    """Generate synthetic stock data."""
    print(f"Generating data for {symbol}...")
    
    # Generate date range
    current_date = start_date
    dates = []
    
    while current_date <= end_date:
        # Only include weekdays (Monday=0, Sunday=6)
        if current_date.weekday() < 5:
            dates.append(current_date)
        current_date += timedelta(days=1)
    
    # Initialize data
    data = []
    base_price = params["base_price"]
    volatility = params["volatility"]
    
    current_price = base_price
    
    for date in dates:
        # Generate random price movement
        price_change = generate_random_normal(0, volatility)
        current_price = current_price * (1 + price_change)
        
        # Generate OHLCV data
        open_price = current_price
        high_price = open_price * (1 + abs(generate_random_normal(0, volatility/2)))
        low_price = open_price * (1 - abs(generate_random_normal(0, volatility/2)))
        close_price = open_price * (1 + generate_random_normal(0, volatility/4))
        
        # Ensure high is highest and low is lowest
        high_price = max(open_price, high_price, close_price)
        low_price = min(open_price, low_price, close_price)
        
        # Generate volume (random with some correlation to price movement)
        volume_base = random.randint(1000000, 5000000)
        volume_multiplier = 1 + abs(price_change) * 10  # Higher volume for larger price moves
        volume = int(volume_base * volume_multiplier)
        
        # Calculate amount
        amount = close_price * volume
        
        data.append({
            'Date': date.strftime('%Y-%m-%d'),
            'Open': round(open_price, 2),
            'High': round(high_price, 2),
            'Low': round(low_price, 2),
            'Close': round(close_price, 2),
            'Volume': volume,
            'Symbol': symbol,
            'Amount': round(amount, 2)
        })
        
        # Update current price for next day
        current_price = close_price
    
    print(f"Generated {len(data)} rows of data for {symbol}")
    return data

def save_to_csv(data, filename):
    """Save data to CSV file."""
    if not data:
        print("No data to save")
        return False
    
    try:
        with open(filename, 'w', newline='') as csvfile:
            fieldnames = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Symbol', 'Amount']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            writer.writerows(data)
        
        print(f"Saved data to {filename}")
        return True
    except Exception as e:
        print(f"Error saving to {filename}: {e}")
        return False

def validate_data(data):
    """Validate the generated data."""
    if not data:
        print("Data is empty")
        return False
    
    required_columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Symbol', 'Amount']
    
    # Check first row for required columns
    first_row = data[0]
    missing_columns = [col for col in required_columns if col not in first_row]
    
    if missing_columns:
        print(f"Missing columns: {missing_columns}")
        return False
    
    # Check for zero or negative prices
    invalid_rows = 0
    for row in data:
        if (row['Open'] <= 0 or row['High'] <= 0 or row['Low'] <= 0 or 
            row['Close'] <= 0 or row['Volume'] <= 0):
            invalid_rows += 1
    
    if invalid_rows > 0:
        print(f"Found {invalid_rows} rows with invalid values")
        return False
    
    print("Data validation completed successfully")
    return True

def main():
    """Main function to generate NSE stock data."""
    # Set up paths
    raw_data_dir = "/home/z/my-project/indian_market/datasets/raw"
    
    # Create output directory if it doesn't exist
    os.makedirs(raw_data_dir, exist_ok=True)
    
    # Set date range (2 years of data for faster processing)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=2*365)
    
    print("Starting NSE stock data generation...")
    print(f"Stocks to generate: {NSE_STOCKS}")
    print(f"Date range: {start_date.date()} to {end_date.date()}")
    
    all_data = []
    
    for symbol in NSE_STOCKS:
        if symbol in STOCK_PARAMS:
            params = STOCK_PARAMS[symbol]
            data = generate_stock_data(symbol, start_date, end_date, params)
            if data:
                all_data.extend(data)
                
                # Save individual stock data
                output_file = os.path.join(raw_data_dir, f"{symbol.replace('.', '_')}.csv")
                save_to_csv(data, output_file)
        else:
            print(f"No parameters found for {symbol}")
    
    if all_data:
        # Sort data by symbol and date
        all_data.sort(key=lambda x: (x['Symbol'], x['Date']))
        
        # Save combined data
        combined_file = os.path.join(raw_data_dir, "combined_nse_data.csv")
        if save_to_csv(all_data, combined_file):
            # Validate data
            if validate_data(all_data):
                print("Data generation and validation completed successfully")
                
                # Print summary statistics
                print(f"\\nData Summary:")
                print(f"Total rows: {len(all_data)}")
                
                # Count unique stocks
                unique_stocks = set(row['Symbol'] for row in all_data)
                print(f"Number of stocks: {len(unique_stocks)}")
                print(f"Stocks: {sorted(unique_stocks)}")
                
                # Calculate basic statistics
                opens = [row['Open'] for row in all_data]
                highs = [row['High'] for row in all_data]
                lows = [row['Low'] for row in all_data]
                closes = [row['Close'] for row in all_data]
                volumes = [row['Volume'] for row in all_data]
                
                print("\\nBasic Statistics:")
                print(f"Open: mean={sum(opens)/len(opens):.2f}")
                print(f"High: mean={sum(highs)/len(highs):.2f}")
                print(f"Low: mean={sum(lows)/len(lows):.2f}")
                print(f"Close: mean={sum(closes)/len(closes):.2f}")
                print(f"Volume: mean={sum(volumes)/len(volumes):.0f}")
            else:
                print("Data validation failed")
        else:
            print("Failed to save combined data")
    else:
        print("Failed to generate data")

if __name__ == "__main__":
    main()