"""
Kronos Foundation Model for Financial Markets
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Tuple, Dict, Any
import numpy as np
from transformers import PreTrainedModel, PretrainedConfig
import math


class KronosAttention(nn.Module):
    """Multi-head attention mechanism for Kronos model."""
    
    def __init__(self, config):
        super().__init__()
        self.num_attention_heads = config.num_attention_heads
        self.attention_head_size = config.hidden_size // config.num_attention_heads
        self.all_head_size = self.num_attention_heads * self.attention_head_size
        
        self.query = nn.Linear(config.hidden_size, self.all_head_size)
        self.key = nn.Linear(config.hidden_size, self.all_head_size)
        self.value = nn.Linear(config.hidden_size, self.all_head_size)
        
        self.dropout = nn.Dropout(config.attention_probs_dropout_prob)
        
    def transpose_for_scores(self, x):
        new_x_shape = x.size()[:-1] + (self.num_attention_heads, self.attention_head_size)
        x = x.view(*new_x_shape)
        return x.permute(0, 2, 1, 3)
    
    def forward(self, hidden_states, attention_mask=None):
        mixed_query_layer = self.query(hidden_states)
        mixed_key_layer = self.key(hidden_states)
        mixed_value_layer = self.value(hidden_states)
        
        query_layer = self.transpose_for_scores(mixed_query_layer)
        key_layer = self.transpose_for_scores(mixed_key_layer)
        value_layer = self.transpose_for_scores(mixed_value_layer)
        
        attention_scores = torch.matmul(query_layer, key_layer.transpose(-1, -2))
        attention_scores = attention_scores / math.sqrt(self.attention_head_size)
        
        if attention_mask is not None:
            attention_scores = attention_scores + attention_mask
        
        attention_probs = nn.Softmax(dim=-1)(attention_scores)
        attention_probs = self.dropout(attention_probs)
        
        context_layer = torch.matmul(attention_probs, value_layer)
        context_layer = context_layer.permute(0, 2, 1, 3).contiguous()
        new_context_layer_shape = context_layer.size()[:-2] + (self.all_head_size,)
        context_layer = context_layer.view(*new_context_layer_shape)
        
        return context_layer


class KronosLayer(nn.Module):
    """Single transformer layer for Kronos model."""
    
    def __init__(self, config):
        super().__init__()
        self.attention = KronosAttention(config)
        self.intermediate = nn.Linear(config.hidden_size, config.intermediate_size)
        self.output = nn.Linear(config.intermediate_size, config.hidden_size)
        self.dropout = nn.Dropout(config.hidden_dropout_prob)
        self.activation = nn.GELU()
        self.layernorm1 = nn.LayerNorm(config.hidden_size)
        self.layernorm2 = nn.LayerNorm(config.hidden_size)
        
    def forward(self, hidden_states, attention_mask=None):
        attention_output = self.attention(self.layernorm1(hidden_states), attention_mask)
        hidden_states = hidden_states + attention_output
        
        intermediate_output = self.intermediate(self.layernorm2(hidden_states))
        intermediate_output = self.activation(intermediate_output)
        
        layer_output = self.output(intermediate_output)
        layer_output = self.dropout(layer_output)
        hidden_states = hidden_states + layer_output
        
        return hidden_states


class KronosEmbeddings(nn.Module):
    """Embedding layer for Kronos model."""
    
    def __init__(self, config):
        super().__init__()
        self.word_embeddings = nn.Embedding(config.vocab_size, config.hidden_size)
        self.position_embeddings = nn.Embedding(config.max_position_embeddings, config.hidden_size)
        self.dropout = nn.Dropout(config.hidden_dropout_prob)
        
    def forward(self, input_ids):
        seq_length = input_ids.size(1)
        position_ids = torch.arange(seq_length, dtype=torch.long, device=input_ids.device)
        position_ids = position_ids.unsqueeze(0).expand_as(input_ids)
        
        words_embeddings = self.word_embeddings(input_ids)
        position_embeddings = self.position_embeddings(position_ids)
        
        embeddings = words_embeddings + position_embeddings
        embeddings = self.dropout(embeddings)
        
        return embeddings


class KronosPreTrainedModel(PreTrainedModel):
    """Base class for Kronos models."""
    
    config_class = None
    base_model_prefix = "kronos"
    
    def __init__(self, config):
        super().__init__(config)
        
    def _init_weights(self, module):
        """Initialize weights."""
        if isinstance(module, nn.Linear):
            module.weight.data.normal_(mean=0.0, std=self.config.initializer_range)
            if module.bias is not None:
                module.bias.data.zero_()
        elif isinstance(module, nn.Embedding):
            module.weight.data.normal_(mean=0.0, std=self.config.initializer_range)
            if module.padding_idx is not None:
                module.weight.data[module.padding_idx].zero_()
        elif isinstance(module, nn.LayerNorm):
            module.bias.data.zero_()
            module.weight.data.fill_(1.0)


class KronosModel(KronosPreTrainedModel):
    """Main Kronos model for financial time series analysis."""
    
    def __init__(self, config):
        super().__init__(config)
        self.config = config
        
        self.embeddings = KronosEmbeddings(config)
        self.layer = nn.ModuleList([KronosLayer(config) for _ in range(config.num_hidden_layers)])
        self.layernorm = nn.LayerNorm(config.hidden_size)
        
        self.post_init()
        
    def forward(self, input_ids, attention_mask=None, labels=None):
        input_shape = input_ids.size()
        batch_size, seq_length = input_shape
        
        # Create attention mask if not provided
        if attention_mask is None:
            attention_mask = torch.ones(batch_size, seq_length, device=input_ids.device)
        
        # Embeddings
        embedding_output = self.embeddings(input_ids)
        
        # Transformer layers
        hidden_states = embedding_output
        for layer_module in self.layer:
            hidden_states = layer_module(hidden_states, attention_mask)
        
        hidden_states = self.layernorm(hidden_states)
        
        outputs = (hidden_states,)
        
        if labels is not None:
            # Calculate loss if labels are provided
            loss_fct = nn.CrossEntropyLoss()
            prediction_scores = self.lm_head(hidden_states)
            loss = loss_fct(prediction_scores.view(-1, self.config.vocab_size), labels.view(-1))
            outputs = (loss,) + outputs
        
        return outputs
    
    def predict(self, input_ids, attention_mask=None):
        """Generate predictions."""
        with torch.no_grad():
            outputs = self.forward(input_ids, attention_mask)
            hidden_states = outputs[0]
            
            # Use the last hidden state for prediction
            last_hidden_state = hidden_states[:, -1, :]
            
            # Simple linear projection for prediction
            prediction = self.prediction_head(last_hidden_state)
            
            return prediction


class KronosForFinancialPrediction(KronosPreTrainedModel):
    """Kronos model for financial prediction tasks."""
    
    def __init__(self, config):
        super().__init__(config)
        self.kronos = KronosModel(config)
        
        # Prediction heads for different financial tasks
        self.price_prediction_head = nn.Linear(config.hidden_size, 1)
        self.volatility_prediction_head = nn.Linear(config.hidden_size, 1)
        self.trend_prediction_head = nn.Linear(config.hidden_size, 3)  # up, down, neutral
        self.volume_prediction_head = nn.Linear(config.hidden_size, 1)
        
        self.post_init()
        
    def forward(self, input_ids, attention_mask=None, labels=None, task="price"):
        """
        Forward pass for financial prediction.
        
        Args:
            input_ids: Tokenized input sequence
            attention_mask: Attention mask
            labels: Target labels (optional)
            task: Prediction task ("price", "volatility", "trend", "volume")
            
        Returns:
            Model outputs
        """
        # Get base model outputs
        outputs = self.kronos(input_ids, attention_mask)
        hidden_states = outputs[0]
        
        # Use last hidden state for prediction
        last_hidden_state = hidden_states[:, -1, :]
        
        # Select appropriate prediction head
        if task == "price":
            prediction = self.price_prediction_head(last_hidden_state)
        elif task == "volatility":
            prediction = self.volatility_prediction_head(last_hidden_state)
        elif task == "trend":
            prediction = self.trend_prediction_head(last_hidden_state)
        elif task == "volume":
            prediction = self.volume_prediction_head(last_hidden_state)
        else:
            raise ValueError(f"Unknown task: {task}")
        
        outputs = (prediction,) + outputs[1:]
        
        if labels is not None:
            loss_fct = nn.MSELoss() if task in ["price", "volatility", "volume"] else nn.CrossEntropyLoss()
            loss = loss_fct(prediction.squeeze(), labels.squeeze())
            outputs = (loss,) + outputs
        
        return outputs
    
    def predict_price(self, input_ids, attention_mask=None):
        """Predict price movement."""
        return self.forward(input_ids, attention_mask, task="price")
    
    def predict_volatility(self, input_ids, attention_mask=None):
        """Predict volatility."""
        return self.forward(input_ids, attention_mask, task="volatility")
    
    def predict_trend(self, input_ids, attention_mask=None):
        """Predict trend direction."""
        return self.forward(input_ids, attention_mask, task="trend")
    
    def predict_volume(self, input_ids, attention_mask=None):
        """Predict volume."""
        return self.forward(input_ids, attention_mask, task="volume")


class KronosConfig(PretrainedConfig):
    """Configuration class for Kronos model."""
    
    model_type = "kronos"
    
    def __init__(
        self,
        vocab_size=50257,
        max_position_embeddings=2048,
        hidden_size=768,
        num_hidden_layers=12,
        num_attention_heads=12,
        intermediate_size=3072,
        hidden_act="gelu",
        attention_probs_dropout_prob=0.1,
        hidden_dropout_prob=0.1,
        initializer_range=0.02,
        **kwargs
    ):
        super().__init__(**kwargs)
        
        self.vocab_size = vocab_size
        self.max_position_embeddings = max_position_embeddings
        self.hidden_size = hidden_size
        self.num_hidden_layers = num_hidden_layers
        self.num_attention_heads = num_attention_heads
        self.intermediate_size = intermediate_size
        self.hidden_act = hidden_act
        self.attention_probs_dropout_prob = attention_probs_dropout_prob
        self.hidden_dropout_prob = hidden_dropout_prob
        self.initializer_range = initializer_range