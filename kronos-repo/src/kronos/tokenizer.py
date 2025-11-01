"""
Kronos Tokenizer for Financial Time Series Data
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import json
import pickle


class KronosTokenizer:
    """
    Tokenizer for financial time series data.
    Converts OHLCV data into tokenized format suitable for Kronos model.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.scalers = {}
        self.feature_names = ["open", "high", "low", "close", "volume", "amount"]
        self.vocab_size = self.config.get("vocab_size", 50257)
        self.max_length = self.config.get("max_length", 512)
        
        # Initialize scalers for each feature
        for feature in self.feature_names:
            self.scalers[feature] = StandardScaler()
    
    def fit(self, data: pd.DataFrame) -> "KronosTokenizer":
        """
        Fit the tokenizer on the data.
        
        Args:
            data: DataFrame with OHLCV columns
            
        Returns:
            Fitted tokenizer
        """
        try:
            # Ensure required columns exist
            required_columns = ["Open", "High", "Low", "Close", "Volume"]
            for col in required_columns:
                if col not in data.columns:
                    raise ValueError(f"Missing required column: {col}")
            
            # Add Amount column if not present
            if "Amount" not in data.columns:
                data["Amount"] = data["Close"] * data["Volume"]
            
            # Fit scalers on each feature
            feature_data = {
                "open": data["Open"].values.reshape(-1, 1),
                "high": data["High"].values.reshape(-1, 1),
                "low": data["Low"].values.reshape(-1, 1),
                "close": data["Close"].values.reshape(-1, 1),
                "volume": data["Volume"].values.reshape(-1, 1),
                "amount": data["Amount"].values.reshape(-1, 1)
            }
            
            for feature, values in feature_data.items():
                self.scalers[feature].fit(values)
            
            return self
            
        except Exception as e:
            raise ValueError(f"Failed to fit tokenizer: {e}")
    
    def transform(self, data: pd.DataFrame) -> np.ndarray:
        """
        Transform data into tokenized format.
        
        Args:
            data: DataFrame with OHLCV columns
            
        Returns:
            Tokenized data as numpy array
        """
        try:
            # Ensure required columns exist
            required_columns = ["Open", "High", "Low", "Close", "Volume"]
            for col in required_columns:
                if col not in data.columns:
                    raise ValueError(f"Missing required column: {col}")
            
            # Add Amount column if not present
            if "Amount" not in data.columns:
                data["Amount"] = data["Close"] * data["Volume"]
            
            # Transform each feature
            feature_data = {
                "open": data["Open"].values.reshape(-1, 1),
                "high": data["High"].values.reshape(-1, 1),
                "low": data["Low"].values.reshape(-1, 1),
                "close": data["Close"].values.reshape(-1, 1),
                "volume": data["Volume"].values.reshape(-1, 1),
                "amount": data["Amount"].values.reshape(-1, 1)
            }
            
            # Apply transformations
            transformed_features = []
            for feature, values in feature_data.items():
                scaled_values = self.scalers[feature].transform(values)
                transformed_features.append(scaled_values.flatten())
            
            # Combine features into sequences
            combined_data = np.column_stack(transformed_features)
            
            # Convert to token format (discretize continuous values)
            tokenized_data = self._discretize(combined_data)
            
            return tokenized_data
            
        except Exception as e:
            raise ValueError(f"Failed to transform data: {e}")
    
    def fit_transform(self, data: pd.DataFrame) -> np.ndarray:
        """
        Fit tokenizer and transform data.
        
        Args:
            data: DataFrame with OHLCV columns
            
        Returns:
            Tokenized data as numpy array
        """
        return self.fit(data).transform(data)
    
    def _discretize(self, continuous_data: np.ndarray) -> np.ndarray:
        """
        Discretize continuous values into token IDs.
        
        Args:
            continuous_data: Continuous feature data
            
        Returns:
            Discretized token IDs
        """
        try:
            # Flatten the data
            flat_data = continuous_data.flatten()
            
            # Create bins for discretization
            n_bins = min(self.vocab_size, 10000)  # Use reasonable number of bins
            bins = np.linspace(flat_data.min(), flat_data.max(), n_bins)
            
            # Discretize
            discretized = np.digitize(flat_data, bins) - 1
            
            # Reshape back to original structure
            tokenized = discretized.reshape(continuous_data.shape)
            
            return tokenized
            
        except Exception as e:
            raise ValueError(f"Failed to discretize data: {e}")
    
    def inverse_transform(self, tokenized_data: np.ndarray) -> pd.DataFrame:
        """
        Convert tokenized data back to original format.
        
        Args:
            tokenized_data: Tokenized data array
            
        Returns:
            DataFrame with original OHLCV columns
        """
        try:
            # Convert tokens back to continuous values
            continuous_data = self._undiscretize(tokenized_data)
            
            # Split features
            n_features = len(self.feature_names)
            feature_data = np.split(continuous_data, n_features, axis=1)
            
            # Inverse transform each feature
            original_data = {}
            for i, feature in enumerate(self.feature_names):
                original_values = self.scalers[feature].inverse_transform(feature_data[i])
                original_data[feature.capitalize()] = original_values.flatten()
            
            return pd.DataFrame(original_data)
            
        except Exception as e:
            raise ValueError(f"Failed to inverse transform: {e}")
    
    def _undiscretize(self, tokenized_data: np.ndarray) -> np.ndarray:
        """
        Convert discretized tokens back to continuous values.
        
        Args:
            tokenized_data: Tokenized data array
            
        Returns:
            Continuous feature data
        """
        try:
            # Simple linear interpolation for undiscretization
            # In a real implementation, this would use the actual bin boundaries
            flat_tokens = tokenized_data.flatten()
            continuous_values = flat_tokens / 10000.0  # Simple scaling
            
            return continuous_values.reshape(tokenized_data.shape)
            
        except Exception as e:
            raise ValueError(f"Failed to undiscretize: {e}")
    
    def save(self, filepath: str):
        """
        Save tokenizer to file.
        
        Args:
            filepath: Path to save tokenizer
        """
        try:
            tokenizer_data = {
                "config": self.config,
                "feature_names": self.feature_names,
                "vocab_size": self.vocab_size,
                "max_length": self.max_length,
                "scalers": {}
            }
            
            # Save scalers
            for feature, scaler in self.scalers.items():
                tokenizer_data["scalers"][feature] = pickle.dumps(scaler)
            
            with open(filepath, 'w') as f:
                json.dump(tokenizer_data, f, indent=2)
                
        except Exception as e:
            raise ValueError(f"Failed to save tokenizer: {e}")
    
    @classmethod
    def load(cls, filepath: str) -> "KronosTokenizer":
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
            tokenizer = cls(config=tokenizer_data["config"])
            tokenizer.feature_names = tokenizer_data["feature_names"]
            tokenizer.vocab_size = tokenizer_data["vocab_size"]
            tokenizer.max_length = tokenizer_data["max_length"]
            
            # Load scalers
            for feature, scaler_data in tokenizer_data["scalers"].items():
                tokenizer.scalers[feature] = pickle.loads(scaler_data.encode('latin1'))
            
            return tokenizer
            
        except Exception as e:
            raise ValueError(f"Failed to load tokenizer: {e}")
    
    def create_sequences(self, data: np.ndarray, sequence_length: int = None) -> np.ndarray:
        """
        Create sequences from tokenized data.
        
        Args:
            data: Tokenized data
            sequence_length: Length of each sequence
            
        Returns:
            Array of sequences
        """
        try:
            sequence_length = sequence_length or self.max_length
            sequences = []
            
            for i in range(len(data) - sequence_length + 1):
                sequence = data[i:i + sequence_length]
                sequences.append(sequence)
            
            return np.array(sequences)
            
        except Exception as e:
            raise ValueError(f"Failed to create sequences: {e}")
    
    def get_vocab_size(self) -> int:
        """Get vocabulary size."""
        return self.vocab_size
    
    def get_feature_names(self) -> List[str]:
        """Get feature names."""
        return self.feature_names