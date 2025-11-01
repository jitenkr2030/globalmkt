import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { Card, Button, Badge, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../hooks/useRedux';
import { useWebSocket } from '../hooks/useWebSocket';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PriceTicker } from '../components/PriceTicker';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  exchange: string;
}

interface Market {
  name: string;
  status: 'open' | 'closed' | 'holiday';
  change: number;
  changePercent: number;
  volume: number;
}

const MarketDataScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('stocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { isConnected, subscribeToStocks, unsubscribeFromStocks } = useWebSocket();
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    loadMarketData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = stocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStocks(filtered);
    } else {
      setFilteredStocks(stocks);
    }
  }, [searchQuery, stocks]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [stocksData, marketsData] = await Promise.all([
        fetchStocks(),
        fetchMarkets(),
      ]);
      
      setStocks(stocksData);
      setFilteredStocks(stocksData);
      setMarkets(marketsData);
      
      // Subscribe to stock updates
      const symbols = stocksData.slice(0, 20).map(stock => stock.symbol);
      subscribeToStocks(symbols);
    } catch (error) {
      console.error('Error loading market data:', error);
      Alert.alert('Error', 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStocks = async (): Promise<Stock[]> => {
    // Mock data - in real app, this would fetch from API
    return [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 178.23, change: 2.34, changePercent: 1.33, volume: 45678900, marketCap: 2780000000000, exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: -1.23, changePercent: -0.85, volume: 23456700, marketCap: 1780000000000, exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, change: 5.67, changePercent: 1.52, volume: 34567800, marketCap: 2810000000000, exchange: 'NASDAQ' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.67, change: 3.45, changePercent: 2.42, volume: 56789000, marketCap: 1490000000000, exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 234.56, change: -4.32, changePercent: -1.81, volume: 78901200, marketCap: 745000000000, exchange: 'NASDAQ' },
      { symbol: 'META', name: 'Meta Platforms', price: 324.78, change: 7.89, changePercent: 2.49, volume: 34567800, marketCap: 832000000000, exchange: 'NASDAQ' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 456.78, change: 12.34, changePercent: 2.78, volume: 45678900, marketCap: 1120000000000, exchange: 'NASDAQ' },
      { symbol: 'JPM', name: 'JPMorgan Chase', price: 156.78, change: 1.23, changePercent: 0.79, volume: 23456700, marketCap: 456000000000, exchange: 'NYSE' },
      { symbol: 'V', name: 'Visa Inc.', price: 234.56, change: 2.45, changePercent: 1.06, volume: 12345600, marketCap: 456000000000, exchange: 'NYSE' },
      { symbol: 'WMT', name: 'Walmart Inc.', price: 156.78, change: -0.89, changePercent: -0.56, volume: 34567800, marketCap: 423000000000, exchange: 'NYSE' },
    ];
  };

  const fetchMarkets = async (): Promise<Market[]> => {
    // Mock data - in real app, this would fetch from API
    return [
      { name: 'NYSE', status: 'open', change: 123.45, changePercent: 0.81, volume: 456789000 },
      { name: 'NASDAQ', status: 'open', change: -45.23, changePercent: -0.32, volume: 345678000 },
      { name: 'LSE', status: 'closed', change: 67.89, changePercent: 0.87, volume: 123456000 },
      { name: 'TSE', status: 'closed', change: 234.56, changePercent: 0.73, volume: 234567000 },
      { name: 'HKEX', status: 'open', change: 89.12, changePercent: 0.50, volume: 178900000 },
      { name: 'SSE', status: 'closed', change: 23.67, changePercent: 0.77, volume: 567890000 },
    ];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMarketData();
    setRefreshing(false);
  };

  const handleStockPress = (stock: Stock) => {
    Alert.alert(
      stock.symbol,
      `${stock.name}\nPrice: ${formatCurrency(stock.price)}\nChange: ${formatCurrency(stock.change)} (${formatPercent(stock.changePercent)})`,
      [
        { text: 'Buy', onPress: () => handleBuy(stock) },
        { text: 'Sell', onPress: () => handleSell(stock) },
        { text: 'Chart', onPress: () => handleChart(stock) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleBuy = (stock: Stock) => {
    Alert.alert('Buy Order', `Place buy order for ${stock.symbol}`, [
      { text: 'Market Order', onPress: () => {} },
      { text: 'Limit Order', onPress: () => {} },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSell = (stock: Stock) => {
    Alert.alert('Sell Order', `Place sell order for ${stock.symbol}`, [
      { text: 'Market Order', onPress: () => {} },
      { text: 'Limit Order', onPress: () => {} },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleChart = (stock: Stock) => {
    Alert.alert('Chart View', `Open chart for ${stock.symbol}`, [
      { text: 'OK', onPress: () => {} },
    ]);
  };

  const renderStockItem = ({ item }: { item: Stock }) => (
    <TouchableOpacity style={styles.stockItem} onPress={() => handleStockPress(item)}>
      <View style={styles.stockInfo}>
        <Text style={styles.stockSymbol}>{item.symbol}</Text>
        <Text style={styles.stockName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.stockExchange}>{item.exchange}</Text>
      </View>
      
      <View style={styles.stockPrice}>
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        <Text style={[
          styles.change,
          { color: item.changePercent >= 0 ? '#10b981' : '#ef4444' }
        ]}>
          {item.change >= 0 ? '+' : ''}{formatCurrency(item.change)} ({formatPercent(item.changePercent)})
        </Text>
      </View>
      
      <View style={styles.stockVolume}>
        <Text style={styles.volumeText}>{formatNumber(item.volume)}</Text>
        <Text style={styles.marketCapText}>{formatCurrency(item.marketCap, true)}</Text>
      </View>
      
      <Icon name="chevron-right" size={20} color="#6b7280" />
    </TouchableOpacity>
  );

  const renderMarketOverview = () => (
    <Card style={styles.card}>
      <Card.Title style={styles.cardTitle}>Market Overview</Card.Title>
      <Card.Content>
        <View style={styles.marketGrid}>
          {markets.map((market, index) => (
            <View key={market.name} style={styles.marketItem}>
              <View style={styles.marketHeader}>
                <Text style={styles.marketName}>{market.name}</Text>
                <Badge 
                  style={[
                    styles.statusBadge,
                    { backgroundColor: market.status === 'open' ? '#10b981' : '#6b7280' }
                  ]}
                >
                  {market.status}
                </Badge>
              </View>
              <Text style={[
                styles.marketChange,
                { color: market.changePercent >= 0 ? '#10b981' : '#ef4444' }
              ]}>
                {market.change >= 0 ? '+' : ''}{formatCurrency(market.change)} ({formatPercent(market.changePercent)})
              </Text>
              <Text style={styles.marketVolume}>{formatNumber(market.volume)}</Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderStocksList = () => (
    <Card style={styles.card}>
      <Card.Title style={styles.cardTitle}>Stocks</Card.Title>
      <Card.Content>
        <Searchbar
          placeholder="Search stocks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={filteredStocks}
            renderItem={renderStockItem}
            keyExtractor={item => item.symbol}
            showsVerticalScrollIndicator={false}
            style={styles.stockList}
          />
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Market Data</Text>
        <View style={styles.connectionStatus}>
          <Icon 
            name={isConnected ? 'wifi' : 'wifi-off'} 
            size={16} 
            color={isConnected ? '#10b981' : '#ef4444'} 
          />
          <Text style={[
            styles.statusText,
            { color: isConnected ? '#10b981' : '#ef4444' }
          ]}>
            {isConnected ? 'Live' : 'Offline'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderMarketOverview()}
        {renderStocksList()}
        
        <PriceTicker />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  marketItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  marketName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    fontSize: 10,
  },
  marketChange: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  marketVolume: {
    fontSize: 12,
    color: '#6b7280',
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
  },
  stockList: {
    maxHeight: 400,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  stockName: {
    fontSize: 14,
    color: '#6b7280',
  },
  stockExchange: {
    fontSize: 12,
    color: '#94a3b8',
  },
  stockPrice: {
    alignItems: 'flex-end',
    marginRight: 16,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
  },
  stockVolume: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  volumeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  marketCapText: {
    fontSize: 10,
    color: '#94a3b8',
  },
});

export default MarketDataScreen;