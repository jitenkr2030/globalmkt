# ExoStack Integration for Kronos Indian Stock Market Model

This project integrates the ExoStack distributed AI orchestration platform with the Kronos Indian Stock Market Model, enabling distributed computing, real-time predictions, and scalable AI model deployment across Indian market regions.

## 🚀 Overview

The integration provides:

- **Distributed Computing**: Leverage multiple nodes across Indian financial centers
- **Real-time Predictions**: Streaming inference for low-latency stock market predictions
- **Scalable Architecture**: Horizontal scaling for increased throughput
- **Federated Learning**: Collaborative model training across regions
- **Comprehensive Monitoring**: Real-time dashboard for system health and performance

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   ExoStack Hub  │    │  ExoStack Agent │
│                 │    │                 │    │                 │
│ • Dashboard     │◄──►│ • Task Routing  │◄──►│ • Model Loading │
│ • API Endpoints │    │ • GPU Scheduler │    │ • Predictions   │
│ • UI Components │    │ • Monitoring    │    │ • Training      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
            ┌───────▼──┐ ┌──────▼──┐ ┌──────▼──┐
            │ Mumbai   │ │ Delhi   │ │ Bangalore│
            │ Node     │ │ Node    │ │ Node     │
            └──────────┘ └─────────┘ └─────────┘
                    │           │           │
            ┌───────▼──┐ ┌──────▼──┐ ┌──────▼──┐
            │ Chennai  │ │ Kolkata │ │ ...      │
            │ Node     │ │ Node    │ │ Node     │
            └──────────┘ └─────────┘ └─────────┘
```

## 📁 Project Structure

```
/home/z/my-project/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── exostack/
│   │   │   │   ├── route.ts              # Main ExoStack API
│   │   │   │   ├── kronos/
│   │   │   │   │   └── route.ts          # Kronos model API
│   │   │   │   └── stream/
│   │   │   │       └── route.ts          # Streaming API
│   │   │   └── ...
│   │   ├── page.tsx                     # Main dashboard
│   │   └── ...
│   ├── components/
│   │   ├── ExoStackDashboard.tsx        # Main dashboard component
│   │   └── ui/                          # shadcn/ui components
│   └── ...
├── exostack-integration/
│   ├── hub/                             # ExoStack hub components
│   ├── agent/                           # ExoStack agent components
│   ├── shared/
│   │   ├── models/
│   │   │   └── kronos_model.py          # Kronos model implementation
│   │   └── training/
│   │       └── distributed_config.py     # Training configuration
│   └── config/
│       └── model_registry.yaml          # Model registry
├── start_exostack.py                    # ExoStack startup script
├── .env.exostack                        # Environment configuration
└── package.json
```

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.8+
- Node.js 18+
- Docker (optional)
- CUDA-compatible GPU (optional but recommended)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd my-project

# Install Node.js dependencies
npm install

# Install Python dependencies for ExoStack
pip install -r exostack/requirements.txt
```

### 2. Configuration

Copy and configure the environment file:

```bash
cp .env.exostack.example .env.exostack
```

Edit `.env.exostack` with your configuration:

```bash
# ExoStack Configuration
EXOSTACK_HUB_URL=http://localhost:8000
EXOSTACK_AGENT_URL=http://localhost:8001
EXOSTACK_ENABLE_GPU=true
EXOSTACK_DATABASE_URL=sqlite:///./exostack.db

# Kronos Model Configuration
KRONOS_MODEL_ID=kronos-indian-stocks
KRONOS_MODEL_VERSION=1.0.0
```

### 3. Start ExoStack

```bash
# Start ExoStack hub and agents
python start_exostack.py

# Or start with specific configuration
python start_exostack.py --config .env.exostack
```

### 4. Start Next.js Application

```bash
# Start development server
npm run dev

# Or start production server
npm run build
npm start
```

## 🎯 Usage

### Dashboard

Access the dashboard at `http://localhost:3000` to:

- Monitor system health and performance
- View agent status across Indian regions
- Manage models and tasks
- Start predictions and training jobs
- Analyze real-time metrics

### API Endpoints

#### ExoStack General API

```bash
# Get hub health status
GET /api/exostack?endpoint=health&type=hub

# Get agent health status
GET /api/exostack?endpoint=health&type=agent

# List registered nodes
GET /api/exostack?endpoint=nodes&type=hub

# Get available models
GET /api/exostack?endpoint=models/available&type=agent
```

#### Kronos Model API

```bash
# Start prediction for a symbol
POST /api/exostack/kronos
{
  "action": "predict",
  "symbol": "RELIANCE.NS",
  "region": "MUMBAI",
  "data": {
    "timeframe": "1d",
    "horizon": 5
  }
}

# Start distributed training
POST /api/exostack/kronos
{
  "action": "distributed_train",
  "region": "MUMBAI",
  "data": {
    "epochs": 10,
    "batch_size": 32
  }
}

# Get model status
POST /api/exostack/kronos
{
  "action": "model_status"
}

# Register new model
POST /api/exostack/kronos
{
  "action": "register_model",
  "data": {
    "model_path": "/path/to/model",
    "version": "1.0.0"
  }
}
```

#### Streaming API

```bash
# Start streaming prediction
POST /api/exostack/stream
{
  "action": "predict_stream",
  "symbol": "TCS.NS",
  "stream_type": "sse"
}

# Get training progress
POST /api/exostack/stream
{
  "action": "training_progress",
  "data": {
    "task_id": "task-123"
  }
}
```

### Code Examples

#### Using the API in JavaScript

```javascript
// Start prediction
const response = await fetch('/api/exostack/kronos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'predict',
    symbol: 'RELIANCE.NS',
    region: 'MUMBAI',
    data: { timeframe: '1d', horizon: 5 }
  })
});

const result = await response.json();
console.log('Prediction task:', result);
```

#### Using Streaming Predictions

```javascript
// Start streaming prediction
const response = await fetch('/api/exostack/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'predict_stream',
    symbol: 'TCS.NS',
    stream_type: 'sse'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      console.log('Stream data:', data);
    }
  }
}
```

## 🌍 Indian Market Regions

The system is optimized for Indian stock market analysis with distributed nodes across major financial centers:

### Mumbai (Financial Capital)
- **Symbols**: RELIANCE.NS, TCS.NS, HDFCBANK.NS, INFY.NS, ICICIBANK.NS
- **Focus**: Large-cap stocks, banking sector, IT services
- **Data Sources**: NSE, BSE, real-time feeds

### Delhi (Political/Economic Center)
- **Symbols**: HINDUNILVR.NS, ITC.NS, BHARTIARTL.NS, LT.NS, SBIN.NS
- **Focus**: FMCG, telecom, infrastructure, public sector
- **Data Sources**: NSE, BSE, economic indicators

### Bangalore (Technology Hub)
- **Symbols**: WIPRO.NS, HCLTECH.NS, TECHM.NS, TATASTEEL.NS, JSWSTEEL.NS
- **Focus**: IT services, technology, manufacturing
- **Data Sources**: NSE, BSE, tech sector metrics

### Chennai (Manufacturing/Automotive)
- **Symbols**: TATAMOTORS.NS, MARUTI.NS, NESTLEIND.NS, ASIANPAINT.NS, HDFC.NS
- **Focus**: Automotive, manufacturing, consumer goods
- **Data Sources**: NSE, BSE, production data

### Kolkata (Eastern Markets)
- **Symbols**: COALINDIA.NS, NTPC.NS, POWERGRID.NS, ONGC.NS, BPCL.NS
- **Focus**: Energy, power, natural resources
- **Data Sources**: NSE, BSE, commodity markets

## 🚀 Distributed Training

### Configuration

Create a training configuration file:

```python
from exostack_integration.shared.training.distributed_config import DistributedTrainingManager

# Create configuration
manager = DistributedTrainingManager()
manager.save_config("training_config.yaml")

# Generate training script
script = manager.generate_training_script()
with open("distributed_training.py", "w") as f:
    f.write(script)
```

### Start Training

```bash
# Start distributed training across all regions
python -m torch.distributed.launch \
    --nproc_per_node=1 \
    --nnodes=5 \
    --node_rank=0 \
    --master_addr=localhost \
    --master_port=12355 \
    distributed_training.py \
    --config=training_config.yaml
```

### Federated Learning

The system supports federated learning for collaborative model training:

```python
# Configure federated learning
config = {
    "federated_learning": True,
    "federated_rounds": 10,
    "local_epochs": 2,
    "aggregation_strategy": "fedavg",
    "regions": ["MUMBAI", "DELHI", "BANGALORE", "CHENNAI", "KOLKATA"]
}
```

## 📊 Monitoring & Metrics

### System Metrics

- **CPU Usage**: Real-time CPU utilization across nodes
- **Memory Usage**: Memory consumption and allocation
- **GPU Usage**: GPU utilization and memory usage
- **Network Throughput**: Data transfer rates between nodes

### Model Metrics

- **Prediction Accuracy**: Model performance across regions
- **Training Progress**: Real-time training metrics
- **Inference Latency**: Prediction response times
- **Model Versions**: Version tracking and management

### Business Metrics

- **Predictions per Second**: System throughput
- **Error Rates**: Prediction and training error rates
- **Resource Utilization**: Efficient resource usage
- **Cost Analysis**: Operational cost optimization

## 🔧 Advanced Configuration

### Model Registry

Add custom models to the registry:

```yaml
# exostack-integration/config/model_registry.yaml
models:
  custom_indian_model:
    hf_repo: "local/custom-model"
    type: "financial_prediction"
    size_gb: 5.0
    min_ram_gb: 8
    supports_gpu: true
    supports_cpu: false
    description: "Custom Indian stock market model"
    tags: ["indian-stocks", "custom"]
    specialized_config:
      market: "indian"
      supported_symbols: ["RELIANCE.NS", "TCS.NS"]
      prediction_types: ["price", "trend"]
```

### Node Configuration

Configure individual nodes:

```python
# Generate node configuration
config = manager.generate_node_config("MUMBAI")

# Save configuration
import json
with open("mumbai_node_config.json", "w") as f:
    json.dump(config, f, indent=2)
```

### Scaling

Scale the system horizontally:

```bash
# Add more agents for a region
export AGENT_REGION=MUMBAI
export AGENT_ID=mumbai-agent-2
python -m exostack_integration.agent.main
```

## 🚨 Troubleshooting

### Common Issues

#### ExoStack Hub Won't Start
```bash
# Check port availability
netstat -tulpn | grep :8000

# Check configuration
python start_exostack.py --status
```

#### GPU Not Detected
```bash
# Check GPU availability
nvidia-smi

# Verify CUDA installation
python -c "import torch; print(torch.cuda.is_available())"
```

#### Model Loading Issues
```bash
# Check model registry
curl http://localhost:8000/api/models

# Verify model files
ls -la /path/to/models/
```

### Logging

Check logs for debugging:

```bash
# ExoStack logs
tail -f logs/exostack.log

# Next.js logs
npm run dev 2>&1 | tee dev.log

# System logs
journalctl -u exostack -f
```

## 📈 Performance Optimization

### GPU Optimization

```bash
# Enable GPU memory optimization
export EXOSTACK_GPU_MEMORY_THRESHOLD=0.8
export EXOSTACK_GPU_COMPUTE_THRESHOLD=0.7
```

### Caching

```bash
# Configure model caching
export EXOSTACK_MODEL_CACHE_DIR=/cache/models
export EXOSTACK_MODEL_CACHE_SIZE_GB=50
```

### Network Optimization

```bash
# Optimize network settings
export EXOSTACK_STREAM_TIMEOUT=600
export EXOSTACK_MAX_STREAM_CONNECTIONS=100
```

## 🔒 Security

### Authentication

Enable API authentication:

```bash
export EXOSTACK_ENABLE_AUTH=true
export EXOSTACK_JWT_SECRET=your-secret-key
```

### Network Security

Configure firewall rules:

```bash
# Allow only necessary ports
ufw allow 8000  # ExoStack Hub
ufw allow 8001  # ExoStack Agents
ufw allow 3000  # Next.js Dashboard
```

### Data Encryption

Enable encrypted communication:

```bash
# Use HTTPS
export EXOSTACK_HUB_URL=https://localhost:8000
export EXOSTACK_AGENT_URL=https://localhost:8001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Setup

```bash
# Install development dependencies
pip install -r exostack/requirements-dev.txt

# Run tests
pytest tests/

# Run linting
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **ExoStack**: For the distributed AI orchestration platform
- **Kronos**: For the Indian Stock Market Model
- **Next.js**: For the modern web framework
- **shadcn/ui**: For the beautiful UI components
- The open-source community for inspiration and contributions

## 📞 Support

For support and questions:

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and tutorials
- **Community**: Join our Discord community
- **Email**: Contact the development team

---

**Built with ❤️ for the Indian AI community**