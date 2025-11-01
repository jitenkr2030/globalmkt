#!/usr/bin/env python3
"""
Simplified data download script for NSE stocks
Creates synthetic data for demonstration purposes
"""

import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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

def generate_stock_data(symbol, start_date, end_date, params):
    """
    Generate synthetic stock data.
    
    Args:
        symbol: Stock symbol
        start_date: Start date for data generation
        end_date: End date for data generation
        params: Dictionary with base_price and volatility
    
    Returns:
        DataFrame with OHLCV data
    """
    try:
        logger.info(f"Generating data for {symbol}...")
        
        # Generate date range
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        dates = dates[dates.dayofweek < 5]  # Only weekdays
        
        # Initialize data
        data = []
        base_price = params["base_price"]
        volatility = params["volatility"]
        
        current_price = base_price
        
        for date in dates:
            # Generate random price movement
            price_change = np.random.normal(0, volatility)
            current_price = current_price * (1 + price_change)
            
            # Generate OHLCV data
            open_price = current_price
            high_price = open_price * (1 + abs(np.random.normal(0, volatility/2)))
            low_price = open_price * (1 - abs(np.random.normal(0, volatility/2)))
            close_price = open_price * (1 + np.random.normal(0, volatility/4))
            
            # Ensure high is highest and low is lowest
            high_price = max(open_price, high_price, close_price)
            low_price = min(open_price, low_price, close_price)
            
            # Generate volume (random with some correlation to price movement)
            volume_base = np.random.randint(1000000, 5000000)
            volume_multiplier = 1 + abs(price_change) * 10  # Higher volume for larger price moves
            volume = int(volume_base * volume_multiplier)
            
            # Calculate amount
            amount = close_price * volume
            
            data.append({
                'Date': date,
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
        
        # Create DataFrame
        df = pd.DataFrame(data)
        
        logger.info(f"Generated {len(df)} rows of data for {symbol}")
        return df
        
    except Exception as e:
        logger.error(f"Failed to generate data for {symbol}: {e}")
        return None

def generate_all_stocks(symbols, output_dir, start_date, end_date):
    """
    Generate data for all specified stocks.
    
    Args:
        symbols: List of stock symbols
        output_dir: Directory to save data
        start_date: Start date for data generation
        end_date: End date for data generation
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    all_data = []
    
    for symbol in symbols:
        if symbol in STOCK_PARAMS:
            params = STOCK_PARAMS[symbol]
            data = generate_stock_data(symbol, start_date, end_date, params)
            if data is not None:
                all_data.append(data)
                
                # Save individual stock data
                output_file = os.path.join(output_dir, f"{symbol.replace('.', '_')}.csv")
                data.to_csv(output_file, index=False)
                logger.info(f"Saved individual data to {output_file}")
        else:
            logger.warning(f"No parameters found for {symbol}")
    
    if all_data:
        # Combine all data
        combined_data = pd.concat(all_data, ignore_index=True)
        
        # Sort by date and symbol
        combined_data = combined_data.sort_values(['Symbol', 'Date'])
        
        # Save combined data
        combined_file = os.path.join(output_dir, "combined_nse_data.csv")
        combined_data.to_csv(combined_file, index=False)
        logger.info(f"Saved combined data to {combined_file}")
        
        return combined_data
    else:
        logger.error("No data was generated")
        return None

def validate_data(data):
    """
    Validate the generated data.
    
    Args:
        data: DataFrame with stock data
    
    Returns:
        bool: True if data is valid, False otherwise
    """
    if data is None or data.empty:
        logger.error("Data is empty")
        return False
    
    required_columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Symbol', 'Amount']
    missing_columns = [col for col in required_columns if col not in data.columns]
    
    if missing_columns:
        logger.error(f"Missing columns: {missing_columns}")
        return False
    
    # Check for missing values
    missing_values = data.isnull().sum()
    if missing_values.any():
        logger.error(f"Missing values found: {missing_values}")
        return False
    
    # Check for zero or negative prices
    zero_prices = data[(data['Open'] <= 0) | (data['High'] <= 0) | (data['Low'] <= 0) | (data['Close'] <= 0)]
    if not zero_prices.empty:
        logger.error(f"Found {len(zero_prices)} rows with zero or negative prices")
        return False
    
    # Check for zero or negative volume
    zero_volume = data[data['Volume'] <= 0]
    if not zero_volume.empty:
        logger.error(f"Found {len(zero_volume)} rows with zero or negative volume")
        return False
    
    logger.info("Data validation completed successfully")
    return True

def main():
    """
    Main function to generate NSE stock data.
    """
    # Set up paths
    raw_data_dir = "/home/z/my-project/indian_market/datasets/raw"
    
    # Set date range (5 years of data)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5*365)
    
    logger.info("Starting NSE stock data generation...")
    logger.info(f"Stocks to generate: {NSE_STOCKS}")
    logger.info(f"Date range: {start_date.date()} to {end_date.date()}")
    
    # Generate data
    combined_data = generate_all_stocks(NSE_STOCKS, raw_data_dir, start_date, end_date)
    
    if combined_data is not None:
        # Validate data
        if validate_data(combined_data):
            logger.info("Data generation and validation completed successfully")
            
            # Print summary statistics
            logger.info("\\nData Summary:")
            logger.info(f"Total rows: {len(combined_data)}")
            logger.info(f"Date range: {combined_data['Date'].min()} to {combined_data['Date'].max()}")
            logger.info(f"Number of stocks: {combined_data['Symbol'].nunique()}")
            logger.info(f"Stocks: {combined_data['Symbol'].unique().tolist()}")
            
            # Print basic statistics
            logger.info("\\nBasic Statistics:")
            for col in ['Open', 'High', 'Low', 'Close', 'Volume']:
                logger.info(f"{col}: mean={combined_data[col].mean():.2f}, std={combined_data[col].std():.2f}")
        else:
            logger.error("Data validation failed")
    else:
        logger.error("Failed to generate data")

if __name__ == "__main__":
    main()