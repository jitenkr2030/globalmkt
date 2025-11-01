import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Card, Button, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useAppSelector } from '../hooks/useRedux';
import { useWebSocket } from '../hooks/useWebSocket';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PriceTicker } from '../components/PriceTicker';

interface MarketOverview {
  market: string;
  index: number;
  change: number;
  changePercent: number;
  status: 'open' | 'closed' | 'holiday';
}

interface PortfolioSummary {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
}

const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [marketOverview, setMarketOverview] = useState<MarketOverview[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  
  const { isConnected, marketData, subscribeToMarket, unsubscribeFromMarket } = useWebSocket();
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    loadDashboardData();
    setupSubscriptions();
    
    return () => {
      cleanupSubscriptions();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load market overview
      const marketsData = await fetchMarketOverview();
      setMarketOverview(marketsData);
      
      // Load portfolio summary
      const portfolioData = await fetchPortfolioSummary();
      setPortfolioSummary(portfolioData);
      
      // Load watchlist
      const watchlistData = await fetchWatchlist();
      setWatchlist(watchlistData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const setupSubscriptions = () => {
    // Subscribe to major markets
    const majorMarkets = ['NYSE', 'NASDAQ', 'LSE', 'TSE'];
    majorMarkets.forEach(market => {
      subscribeToMarket(market);
    });
  };

  const cleanupSubscriptions = () => {
    // Clean up subscriptions when component unmounts
    const majorMarkets = ['NYSE', 'NASDAQ', 'LSE', 'TSE'];
    majorMarkets.forEach(market => {
      unsubscribeFromMarket(market);
    });
  };

  const fetchMarketOverview = async (): Promise<MarketOverview[]> => {
    // Mock data - in real app, this would fetch from API
    return [
      { market: 'NYSE', index: 15432.67, change: 123.45, changePercent: 0.81, status: 'open' },
      { market: 'NASDAQ', index: 14256.89, change: -45.23, changePercent: -0.32, status: 'open' },
      { market: 'LSE', index: 7890.12, change: 67.89, changePercent: 0.87, status: 'closed' },
      { market: 'TSE', index: 32456.78, change: 234.56, changePercent: 0.73, status: 'closed' },
    ];
  };

  const fetchPortfolioSummary = async (): Promise<PortfolioSummary> => {
    // Mock data - in real app, this would fetch from API
    return {
      totalValue: 125432.67,
      dailyChange: 1234.56,
      dailyChangePercent: 0.99,
      totalReturn: 15432.67,
      totalReturnPercent: 14.03,
    };
  };

  const fetchWatchlist = async () => {
    // Mock data - in real app, this would fetch from API
    return [
      { symbol: 'AAPL', price: 178.23, change: 2.34, changePercent: 1.33 },
      { symbol: 'GOOGL', price: 142.56, change: -1.23, changePercent: -0.85 },
      { symbol: 'MSFT', price: 378.90, change: 5.67, changePercent: 1.52 },
      { symbol: 'AMZN', price: 145.67, change: 3.45, changePercent: 2.42 },
      { symbol: 'TSLA', price: 234.56, change: -4.32, changePercent: -1.81 },
    ];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out my portfolio performance on Global Markets!',
        title: 'Global Markets Portfolio',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderMarketOverview = () => (
    <Card style={styles.card}>
      <Card.Title style={styles.cardTitle}>Global Markets Overview</Card.Title>
      <Card.Content>
        <View style={styles.marketGrid}>
          {marketOverview.map((market, index) => (
            <View key={market.market} style={styles.marketItem}>
              <View style={styles.marketHeader}>
                <Text style={styles.marketName}>{market.market}</Text>
                <Badge 
                  style={[
                    styles.statusBadge,
                    { backgroundColor: market.status === 'open' ? '#10b981' : '#6b7280' }
                  ]}
                >
                  {market.status}
                </Badge>
              </View>
              <Text style={styles.marketIndex}>{formatCurrency(market.index)}</Text>
              <Text style={[
                styles.marketChange,
                { color: market.changePercent >= 0 ? '#10b981' : '#ef4444' }
              ]}>
                {market.change >= 0 ? '+' : ''}{formatCurrency(market.change)} ({formatPercent(market.changePercent)})
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderPortfolioSummary = () => {
    if (!portfolioSummary) return null;

    return (
      <Card style={styles.card}>
        <Card.Title style={styles.cardTitle}>Portfolio Summary</Card.Title>
        <Card.Content>
          <View style={styles.portfolioHeader}>
            <View>
              <Text style={styles.portfolioValue}>
                {formatCurrency(portfolioSummary.totalValue)}
              </Text>
              <Text style={[
                styles.portfolioChange,
                { color: portfolioSummary.dailyChangePercent >= 0 ? '#10b981' : '#ef4444' }
              ]}>
                {portfolioSummary.dailyChange >= 0 ? '+' : ''}
                {formatCurrency(portfolioSummary.dailyChange)} ({formatPercent(portfolioSummary.dailyChangePercent)})
              </Text>
            </View>
            <View style={styles.portfolioActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Icon name="share-variant" size={20} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="refresh" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.portfolioStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Return</Text>
              <Text style={[
                styles.statValue,
                { color: portfolioSummary.totalReturnPercent >= 0 ? '#10b981' : '#ef4444' }
              ]}>
                {formatCurrency(portfolioSummary.totalReturn)} ({formatPercent(portfolioSummary.totalReturnPercent)})
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Daily Change</Text>
              <Text style={[
                styles.statValue,
                { color: portfolioSummary.dailyChangePercent >= 0 ? '#10b981' : '#ef4444' }
              ]}>
                {formatPercent(portfolioSummary.dailyChangePercent)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderWatchlist = () => (
    <Card style={styles.card}>
      <Card.Title style={styles.cardTitle}>Watchlist</Card.Title>
      <Card.Content>
        <View style={styles.watchlistContainer}>
          {watchlist.map((item, index) => (
            <View key={item.symbol} style={styles.watchlistItem}>
              <View style={styles.watchlistInfo}>
                <Text style={styles.watchlistSymbol}>{item.symbol}</Text>
                <Text style={styles.watchlistPrice}>{formatCurrency(item.price)}</Text>
              </View>
              <Text style={[
                styles.watchlistChange,
                { color: item.changePercent >= 0 ? '#10b981' : '#ef4444' }
              ]}>
                {item.change >= 0 ? '+' : ''}{formatCurrency(item.change)} ({formatPercent(item.changePercent)})
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.card}>
      <Card.Title style={styles.cardTitle}>Quick Actions</Card.Title>
      <Card.Content>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Icon name="plus-circle-outline" size={24} color="#2563eb" />
            <Text style={styles.actionText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Icon name="minus-circle-outline" size={24} color="#ef4444" />
            <Text style={styles.actionText}>Sell</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Icon name="swap-horizontal" size={24} color="#8b5cf6" />
            <Text style={styles.actionText}>Trade</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Icon name="chart-line" size={24} color="#10b981" />
            <Text style={styles.actionText}>Analyze</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back, {user?.name || 'Trader'}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </View>

        {renderPortfolioSummary()}
        {renderQuickActions()}
        {renderMarketOverview()}
        {renderWatchlist()}

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
    padding: 16,
    backgroundColor: '#ffffff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
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
  marketIndex: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  marketChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  portfolioValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  portfolioChange: {
    fontSize: 16,
    fontWeight: '500',
  },
  portfolioActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  watchlistContainer: {
    gap: 8,
  },
  watchlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  watchlistInfo: {
    flex: 1,
  },
  watchlistSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  watchlistPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  watchlistChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginTop: 8,
  },
});

export default DashboardScreen;