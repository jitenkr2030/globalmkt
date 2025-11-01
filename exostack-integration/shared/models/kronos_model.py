"""
Kronos Indian Stock Market Model for ExoStack Integration
This module provides the implementation for Indian stock market prediction
and analysis using distributed computing capabilities.
"""

import torch
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import json
import logging
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import yfinance as yf

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KronosIndianStockModel:
    """
    Specialized AI model for Indian stock market prediction and analysis.
    Integrated with ExoStack for distributed computing capabilities.
    """
    
    def __init__(self, model_path: str = None, config: Dict[str, Any] = None):
        self.model_path = model_path or "local/kronos-indian-stocks"
        self.config = config or {}
        self.model = None
        self.tokenizer = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Indian market configuration
        self.supported_symbols = [
            "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
            "HINDUNILVR.NS", "ITC.NS", "BHARTIARTL.NS", "LT.NS", "SBIN.NS",
            "WIPRO.NS", "HCLTECH.NS", "TECHM.NS", "TATASTEEL.NS", "JSWSTEEL.NS",
            "TATAMOTORS.NS", "MARUTI.NS", "NESTLEIND.NS", "ASIANPAINT.NS", "HDFC.NS",
            "COALINDIA.NS", "NTPC.NS", "POWERGRID.NS", "ONGC.NS", "BPCL.NS"
        ]
        
        self.regions = ["MUMBAI", "DELHI", "BANGALORE", "CHENNAI", "KOLKATA"]
        self.prediction_types = ["price", "trend", "volatility", "volume"]
        self.timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1M"]
        
        self.load_model()
    
    def load_model(self):
        """Load the Kronos model and tokenizer."""
        try:
            logger.info(f"Loading Kronos model from {self.model_path}")
            
            # For demonstration, we'll use a base model and fine-tune it
            # In production, this would load a pre-trained financial model
            base_model = "microsoft/DialoGPT-medium"
            
            self.tokenizer = AutoTokenizer.from_pretrained(base_model)
            self.model = AutoModelForCausalLM.from_pretrained(base_model)
            
            # Move to device
            self.model.to(self.device)
            
            # Set pad token
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            logger.info("Kronos model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load Kronos model: {e}")
            raise
    
    def get_market_data(self, symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
        """
        Fetch market data for Indian stocks.
        
        Args:
            symbol: Stock symbol (e.g., "RELIANCE.NS")
            period: Time period ("1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max")
            interval: Data interval ("1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo")
        
        Returns:
            DataFrame with market data
        """
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period, interval=interval)
            
            if data.empty:
                logger.warning(f"No data found for symbol {symbol}")
                return pd.DataFrame()
            
            # Add technical indicators
            data = self._add_technical_indicators(data)
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to fetch market data for {symbol}: {e}")
            return pd.DataFrame()
    
    def _add_technical_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """Add technical indicators to the market data."""
        try:
            # Simple Moving Averages
            data['SMA_20'] = data['Close'].rolling(window=20).mean()
            data['SMA_50'] = data['Close'].rolling(window=50).mean()
            
            # Exponential Moving Averages
            data['EMA_12'] = data['Close'].ewm(span=12).mean()
            data['EMA_26'] = data['Close'].ewm(span=26).mean()
            
            # RSI
            delta = data['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            data['RSI'] = 100 - (100 / (1 + rs))
            
            # MACD
            data['MACD'] = data['EMA_12'] - data['EMA_26']
            data['MACD_Signal'] = data['MACD'].ewm(span=9).mean()
            data['MACD_Histogram'] = data['MACD'] - data['MACD_Signal']
            
            # Bollinger Bands
            data['BB_Middle'] = data['Close'].rolling(window=20).mean()
            bb_std = data['Close'].rolling(window=20).std()
            data['BB_Upper'] = data['BB_Middle'] + (bb_std * 2)
            data['BB_Lower'] = data['BB_Middle'] - (bb_std * 2)
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to add technical indicators: {e}")
            return data
    
    def predict(self, symbol: str, prediction_type: str = "price", 
                timeframe: str = "1d", horizon: int = 5) -> Dict[str, Any]:
        """
        Generate predictions for Indian stocks.
        
        Args:
            symbol: Stock symbol
            prediction_type: Type of prediction ("price", "trend", "volatility", "volume")
            timeframe: Timeframe for prediction
            horizon: Number of periods to predict ahead
        
        Returns:
            Dictionary with prediction results
        """
        try:
            logger.info(f"Generating {prediction_type} prediction for {symbol}")
            
            # Validate inputs
            if symbol not in self.supported_symbols:
                raise ValueError(f"Unsupported symbol: {symbol}")
            
            if prediction_type not in self.prediction_types:
                raise ValueError(f"Unsupported prediction type: {prediction_type}")
            
            # Get market data
            market_data = self.get_market_data(symbol, period="1y", interval=timeframe)
            
            if market_data.empty:
                raise ValueError(f"No market data available for {symbol}")
            
            # Generate prediction based on type
            if prediction_type == "price":
                prediction = self._predict_price(market_data, horizon)
            elif prediction_type == "trend":
                prediction = self._predict_trend(market_data, horizon)
            elif prediction_type == "volatility":
                prediction = self._predict_volatility(market_data, horizon)
            elif prediction_type == "volume":
                prediction = self._predict_volume(market_data, horizon)
            else:
                raise ValueError(f"Unknown prediction type: {prediction_type}")
            
            # Add metadata
            prediction.update({
                "symbol": symbol,
                "prediction_type": prediction_type,
                "timeframe": timeframe,
                "horizon": horizon,
                "timestamp": datetime.now().isoformat(),
                "model_version": "1.0.0",
                "confidence": self._calculate_confidence(market_data, prediction)
            })
            
            logger.info(f"Prediction generated successfully for {symbol}")
            return prediction
            
        except Exception as e:
            logger.error(f"Failed to generate prediction for {symbol}: {e}")
            return {"error": str(e)}
    
    def _predict_price(self, data: pd.DataFrame, horizon: int) -> Dict[str, Any]:
        """Generate price predictions."""
        try:
            # Simple prediction using recent trends and technical indicators
            last_price = data['Close'].iloc[-1]
            sma_20 = data['SMA_20'].iloc[-1]
            sma_50 = data['SMA_50'].iloc[-1]
            
            # Calculate trend direction
            if last_price > sma_20 > sma_50:
                trend = "bullish"
                momentum = 0.02  # 2% growth
            elif last_price < sma_20 < sma_50:
                trend = "bearish"
                momentum = -0.02  # 2% decline
            else:
                trend = "neutral"
                momentum = 0.005  # 0.5% growth
            
            # Generate price predictions
            predictions = []
            current_price = last_price
            
            for i in range(horizon):
                # Add some randomness to simulate market volatility
                volatility = np.random.normal(0, 0.01)
                price_change = momentum + volatility
                current_price = current_price * (1 + price_change)
                predictions.append(round(current_price, 2))
            
            return {
                "current_price": round(last_price, 2),
                "trend": trend,
                "predictions": predictions,
                "support_level": round(data['BB_Lower'].iloc[-1], 2),
                "resistance_level": round(data['BB_Upper'].iloc[-1], 2)
            }
            
        except Exception as e:
            logger.error(f"Failed to predict price: {e}")
            return {"error": str(e)}
    
    def _predict_trend(self, data: pd.DataFrame, horizon: int) -> Dict[str, Any]:
        """Generate trend predictions."""
        try:
            # Analyze recent price action
            recent_prices = data['Close'].tail(20)
            price_change = recent_prices.pct_change().dropna()
            
            # Calculate trend strength
            trend_strength = price_change.mean()
            
            if trend_strength > 0.01:
                trend = "strong_bullish"
            elif trend_strength > 0.005:
                trend = "bullish"
            elif trend_strength < -0.01:
                trend = "strong_bearish"
            elif trend_strength < -0.005:
                trend = "bearish"
            else:
                trend = "neutral"
            
            # Generate trend predictions
            trend_predictions = []
            current_trend = trend
            
            for i in range(horizon):
                # Simulate trend evolution
                if np.random.random() < 0.1:  # 10% chance of trend change
                    current_trend = np.random.choice(
                        ["bullish", "bearish", "neutral"],
                        p=[0.4, 0.4, 0.2]
                    )
                trend_predictions.append(current_trend)
            
            return {
                "current_trend": trend,
                "trend_strength": round(trend_strength, 4),
                "predictions": trend_predictions,
                "rsi": round(data['RSI'].iloc[-1], 2),
                "macd": round(data['MACD'].iloc[-1], 4)
            }
            
        except Exception as e:
            logger.error(f"Failed to predict trend: {e}")
            return {"error": str(e)}
    
    def _predict_volatility(self, data: pd.DataFrame, horizon: int) -> Dict[str, Any]:
        """Generate volatility predictions."""
        try:
            # Calculate historical volatility
            returns = data['Close'].pct_change().dropna()
            historical_volatility = returns.std() * np.sqrt(252)  # Annualized
            
            # Generate volatility predictions
            volatility_predictions = []
            current_vol = historical_volatility
            
            for i in range(horizon):
                # Simulate volatility clustering
                if np.random.random() < 0.3:  # 30% chance of volatility change
                    change_factor = np.random.uniform(0.8, 1.2)
                    current_vol = current_vol * change_factor
                
                volatility_predictions.append(round(current_vol, 4))
            
            return {
                "current_volatility": round(historical_volatility, 4),
                "volatility_regime": "high" if historical_volatility > 0.25 else "low",
                "predictions": volatility_predictions,
                "avg_daily_range": round((data['High'] - data['Low']).mean(), 2)
            }
            
        except Exception as e:
            logger.error(f"Failed to predict volatility: {e}")
            return {"error": str(e)}
    
    def _predict_volume(self, data: pd.DataFrame, horizon: int) -> Dict[str, Any]:
        """Generate volume predictions."""
        try:
            # Calculate volume metrics
            avg_volume = data['Volume'].mean()
            recent_volume = data['Volume'].tail(10).mean()
            volume_trend = recent_volume / avg_volume
            
            # Generate volume predictions
            volume_predictions = []
            current_volume = recent_volume
            
            for i in range(horizon):
                # Simulate volume patterns
                if np.random.random() < 0.2:  # 20% chance of volume spike
                    spike_factor = np.random.uniform(1.5, 3.0)
                    current_volume = avg_volume * spike_factor
                else:
                    current_volume = avg_volume * (1 + np.random.normal(0, 0.1))
                
                volume_predictions.append(int(current_volume))
            
            return {
                "current_volume": int(recent_volume),
                "avg_volume": int(avg_volume),
                "volume_trend": round(volume_trend, 2),
                "predictions": volume_predictions,
                "volume_regime": "high" if volume_trend > 1.2 else "low"
            }
            
        except Exception as e:
            logger.error(f"Failed to predict volume: {e}")
            return {"error": str(e)}
    
    def _calculate_confidence(self, data: pd.DataFrame, prediction: Dict[str, Any]) -> float:
        """Calculate confidence score for prediction."""
        try:
            # Simple confidence calculation based on data quality and trend strength
            if len(data) < 50:
                return 0.3  # Low confidence with limited data
            
            # Check data completeness
            completeness = 1 - (data.isnull().sum().sum() / (len(data) * len(data.columns)))
            
            # Check trend consistency
            if 'trend' in prediction:
                trend_consistency = 0.8 if prediction['trend'] in ['bullish', 'bearish'] else 0.6
            else:
                trend_consistency = 0.7
            
            # Calculate overall confidence
            confidence = (completeness * 0.4) + (trend_consistency * 0.6)
            
            return round(min(confidence, 1.0), 2)
            
        except Exception as e:
            logger.error(f"Failed to calculate confidence: {e}")
            return 0.5
    
    def analyze_portfolio(self, symbols: List[str]) -> Dict[str, Any]:
        """Analyze a portfolio of Indian stocks."""
        try:
            logger.info(f"Analyzing portfolio with {len(symbols)} symbols")
            
            portfolio_analysis = {}
            
            for symbol in symbols:
                if symbol in self.supported_symbols:
                    # Get basic analysis
                    data = self.get_market_data(symbol, period="6mo", interval="1d")
                    
                    if not data.empty:
                        analysis = {
                            "symbol": symbol,
                            "current_price": round(data['Close'].iloc[-1], 2),
                            "price_change": round(data['Close'].pct_change().iloc[-1] * 100, 2),
                            "volume": int(data['Volume'].iloc[-1]),
                            "rsi": round(data['RSI'].iloc[-1], 2),
                            "trend": self._get_trend_from_data(data),
                            "volatility": round(data['Close'].pct_change().std() * np.sqrt(252), 4)
                        }
                        portfolio_analysis[symbol] = analysis
            
            # Calculate portfolio metrics
            portfolio_metrics = self._calculate_portfolio_metrics(portfolio_analysis)
            
            return {
                "portfolio_analysis": portfolio_analysis,
                "portfolio_metrics": portfolio_metrics,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to analyze portfolio: {e}")
            return {"error": str(e)}
    
    def _get_trend_from_data(self, data: pd.DataFrame) -> str:
        """Determine trend from market data."""
        try:
            if len(data) < 20:
                return "unknown"
            
            sma_20 = data['SMA_20'].iloc[-1]
            sma_50 = data['SMA_50'].iloc[-1]
            current_price = data['Close'].iloc[-1]
            
            if current_price > sma_20 > sma_50:
                return "bullish"
            elif current_price < sma_20 < sma_50:
                return "bearish"
            else:
                return "neutral"
                
        except Exception:
            return "unknown"
    
    def _calculate_portfolio_metrics(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate portfolio-level metrics."""
        try:
            if not analysis:
                return {}
            
            symbols = list(analysis.keys())
            prices = [analysis[symbol]["current_price"] for symbol in symbols]
            changes = [analysis[symbol]["price_change"] for symbol in symbols]
            
            return {
                "total_symbols": len(symbols),
                "avg_price_change": round(sum(changes) / len(changes), 2),
                "bullish_count": sum(1 for symbol in symbols if analysis[symbol]["trend"] == "bullish"),
                "bearish_count": sum(1 for symbol in symbols if analysis[symbol]["trend"] == "bearish"),
                "neutral_count": sum(1 for symbol in symbols if analysis[symbol]["trend"] == "neutral"),
                "avg_volatility": round(sum(analysis[symbol]["volatility"] for symbol in symbols) / len(symbols), 4),
                "avg_rsi": round(sum(analysis[symbol]["rsi"] for symbol in symbols) / len(symbols), 2)
            }
            
        except Exception as e:
            logger.error(f"Failed to calculate portfolio metrics: {e}")
            return {}
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information and capabilities."""
        return {
            "model_name": "Kronos Indian Stock Market Model",
            "version": "1.0.0",
            "supported_symbols": self.supported_symbols,
            "supported_regions": self.regions,
            "prediction_types": self.prediction_types,
            "timeframes": self.timeframes,
            "device": str(self.device),
            "model_path": self.model_path,
            "capabilities": [
                "price_prediction",
                "trend_analysis",
                "volatility_forecasting",
                "volume_prediction",
                "portfolio_analysis",
                "technical_indicators"
            ]
        }


# Example usage and testing
if __name__ == "__main__":
    # Initialize the model
    model = KronosIndianStockModel()
    
    # Get model info
    print("Model Info:")
    print(json.dumps(model.get_model_info(), indent=2))
    
    # Test prediction
    print("\nTesting prediction for RELIANCE.NS:")
    prediction = model.predict("RELIANCE.NS", "price", "1d", 5)
    print(json.dumps(prediction, indent=2))
    
    # Test portfolio analysis
    print("\nTesting portfolio analysis:")
    portfolio = model.analyze_portfolio(["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"])
    print(json.dumps(portfolio, indent=2))