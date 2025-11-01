#!/usr/bin/env python3
\"\"\"
Download OHLCV data for NSE stocks using yfinance
\"\"\"

import yfinance as yf
import pandas as pd
import os
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# NSE stocks to download
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

def download_stock_data(symbol, period="5y", interval="1d"):
    \"\"\"
    Download stock data for a given symbol.
    
    Args:
        symbol: Stock symbol (e.g., "RELIANCE.NS")
        period: Time period to download (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
        interval: Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)
    
    Returns:
        DataFrame with OHLCV data
    \"\"\"
    try:
        logger.info(f"Downloading data for {symbol}...")
        
        # Create ticker object
        ticker = yf.Ticker(symbol)
        
        # Download historical data
        data = ticker.history(period=period, interval=interval)
        
        if data.empty:
            logger.warning(f"No data found for {symbol}")
            return None
        
        # Reset index to make Date a column
        data = data.reset_index()
        
        # Rename columns to match Kronos format
        data.columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Dividends', 'Stock Splits']
        
        # Add symbol column
        data['Symbol'] = symbol
        
        # Remove unnecessary columns
        data = data[['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Symbol']]
        
        # Calculate Amount (Close * Volume)
        data['Amount'] = data['Close'] * data['Volume']
        
        logger.info(f"Downloaded {len(data)} rows of data for {symbol}")
        return data
        
    except Exception as e:
        logger.error(f"Failed to download data for {symbol}: {e}")
        return None

def download_all_stocks(symbols, output_dir):
    \"\"\"
    Download data for all specified stocks.
    
    Args:
        symbols: List of stock symbols
        output_dir: Directory to save data
    \"\"\"
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    all_data = []
    
    for symbol in symbols:
        data = download_stock_data(symbol)
        if data is not None:
            all_data.append(data)
            
            # Save individual stock data
            output_file = os.path.join(output_dir, f"{symbol.replace('.', '_')}.csv")
            data.to_csv(output_file, index=False)
            logger.info(f"Saved individual data to {output_file}")
    
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
        logger.error("No data was downloaded")
        return None

def validate_data(data):
    \"\"\"
    Validate the downloaded data.
    
    Args:
        data: DataFrame with stock data
    
    Returns:
        bool: True if data is valid, False otherwise
    \"\"\"
    if data is None or data.empty:
        logger.error("Data is empty")
        return False
    
    required_columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Symbol']
    missing_columns = [col for col in required_columns if col not in data.columns]
    
    if missing_columns:
        logger.error(f"Missing columns: {missing_columns}")
        return False
    
    # Check for missing values
    missing_values = data.isnull().sum()
    if missing_values.any():
        logger.warning(f"Missing values found: {missing_values}")
    
    # Check for zero or negative prices
    zero_prices = data[(data['Open'] <= 0) | (data['High'] <= 0) | (data['Low'] <= 0) | (data['Close'] <= 0)]
    if not zero_prices.empty:
        logger.warning(f"Found {len(zero_prices)} rows with zero or negative prices")
    
    logger.info("Data validation completed")
    return True

def main():
    \"\"\"
    Main function to download NSE stock data.
    \"\"\"
    # Set up paths
    raw_data_dir = "/home/z/my-project/indian_market/datasets/raw"
    
    logger.info("Starting NSE stock data download...")
    logger.info(f"Stocks to download: {NSE_STOCKS}")
    
    # Download data
    combined_data = download_all_stocks(NSE_STOCKS, raw_data_dir)
    
    if combined_data is not None:
        # Validate data
        if validate_data(combined_data):
            logger.info("Data download and validation completed successfully")
            
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
        logger.error("Failed to download data")

if __name__ == "__main__":
    main()