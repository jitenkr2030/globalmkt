"""
Configuration for Kronos Foundation Model
"""

from dataclasses import dataclass
from typing import Optional, List, Dict, Any


@dataclass
class KronosConfig:
    """Configuration class for Kronos model."""
    
    # Model architecture
    model_type: str = "kronos-small"
    hidden_size: int = 768
    num_hidden_layers: int = 12
    num_attention_heads: int = 12
    intermediate_size: int = 3072
    hidden_act: str = "gelu"
    attention_probs_dropout_prob: float = 0.1
    hidden_dropout_prob: float = 0.1
    
    # Tokenizer
    vocab_size: int = 50257
    max_position_embeddings: int = 2048
    
    # Training
    learning_rate: float = 2e-5
    batch_size: int = 32
    num_epochs: int = 10
    warmup_steps: int = 1000
    weight_decay: float = 0.01
    
    # Data
    sequence_length: int = 512
    prediction_horizon: int = 5
    features: List[str] = None
    
    # Financial specific
    market: str = "global"
    asset_class: str = "equity"
    frequency: str = "daily"
    
    def __post_init__(self):
        if self.features is None:
            self.features = ["open", "high", "low", "close", "volume", "amount"]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary."""
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
    
    @classmethod
    def from_dict(cls, config_dict: Dict[str, Any]) -> "KronosConfig":
        """Create config from dictionary."""
        return cls(**config_dict)