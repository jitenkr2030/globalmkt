import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  StatusBar,
  Appearance,
  useColorScheme,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { PaperProvider, DefaultTheme, DarkTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { useAppDispatch } from './hooks/useRedux';
import { initializeApp } from './store/slices/appSlice';
import { checkBiometrics } from './utils/security';
import { connectWebSocket } from './utils/websocket';
import { requestNotificationPermission } from './utils/notifications';

// Import Screens
import DashboardScreen from './screens/DashboardScreen';
import MarketDataScreen from './screens/MarketDataScreen';
import ChartingScreen from './screens/ChartingScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import NewsScreen from './screens/NewsScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';

// Import Components
import { Header } from './components/Header';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ErrorBoundary } from './components/ErrorBoundary';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navigation Theme
const LightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: '#2563eb',
    background: '#ffffff',
    card: '#f8fafc',
    text: '#1e293b',
    border: '#e2e8f0',
    notification: '#2563eb',
  },
};

const DarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: '#3b82f6',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    border: '#334155',
    notification: '#3b82f6',
  },
};

// Tab Navigator
const TabNavigator = () => {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Markets':
              iconName = focused ? 'chart-line' : 'chart-line';
              break;
            case 'Charting':
              iconName = focused ? 'candlestick-chart' : 'candlestick-chart';
              break;
            case 'Portfolio':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'News':
              iconName = focused ? 'newspaper' : 'newspaper-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: paperTheme.colors.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: paperTheme.colors.background,
          borderTopColor: paperTheme.colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        header: ({ navigation, route, options }) => (
          <Header navigation={navigation} route={route} options={options} />
        ),
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Markets"
        component={MarketDataScreen}
        options={{ title: 'Markets' }}
      />
      <Tab.Screen
        name="Charting"
        component={ChartingScreen}
        options={{ title: 'Charting' }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{ title: 'Portfolio' }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{ title: 'News' }}
      />
    </Tab.Navigator>
  );
};

// Main App Component
const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const dispatch = useAppDispatch();

  useEffect(() => {
    initializeAppServices();
  }, []);

  const initializeAppServices = async () => {
    try {
      // Initialize app state
      await dispatch(initializeApp());
      
      // Check if first time user
      const isFirstTime = await checkFirstTimeUser();
      if (isFirstTime) {
        setShowOnboarding(true);
        setIsLoading(false);
        return;
      }

      // Check authentication
      const authStatus = await checkAuthentication();
      setIsAuthenticated(authStatus);

      // Initialize services
      await Promise.all([
        initializeSecurity(),
        initializeNotifications(),
        initializeWebSocket(),
        initializeDeepLinking(),
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsLoading(false);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize app services. Please restart the app.',
        [{ text: 'OK' }]
      );
    }
  };

  const checkFirstTimeUser = async (): Promise<boolean> => {
    // In a real app, this would check AsyncStorage or secure storage
    return false; // For demo purposes
  };

  const checkAuthentication = async (): Promise<boolean> => {
    // In a real app, this would check stored tokens and validate them
    return true; // For demo purposes
  };

  const initializeSecurity = async () => {
    try {
      const biometricsAvailable = await checkBiometrics();
      console.log('Biometrics available:', biometricsAvailable);
    } catch (error) {
      console.error('Error initializing security:', error);
    }
  };

  const initializeNotifications = async () => {
    try {
      const permissionGranted = await requestNotificationPermission();
      console.log('Notification permission:', permissionGranted);
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const initializeWebSocket = async () => {
    try {
      await connectWebSocket();
      console.log('WebSocket connected');
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  };

  const initializeDeepLinking = () => {
    Linking.addEventListener('url', handleDeepLink);
    
    // Handle initial URL
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });
  };

  const handleDeepLink = (event: { url: string }) => {
    const route = event.url.replace(/.*?:\/\//g, '');
    console.log('Deep link received:', route);
    // Handle navigation based on deep link
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Mark onboarding as completed
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<SplashScreen />} persistor={persistor}>
          <PaperProvider theme={paperTheme}>
            <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : LightTheme}>
              <SafeAreaView style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
                <StatusBar
                  barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                  backgroundColor={paperTheme.colors.background}
                />
                
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  {showOnboarding ? (
                    <Stack.Screen name="Onboarding">
                      {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
                    </Stack.Screen>
                  ) : !isAuthenticated ? (
                    <Stack.Screen name="Login">
                      {() => <LoginScreen onLogin={handleLogin} />}
                    </Stack.Screen>
                  ) : (
                    <Stack.Screen name="Main">
                      {() => <TabNavigator />}
                    </Stack.Screen>
                  )}
                  
                  {/* Settings Stack */}
                  <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{ 
                      headerShown: true,
                      title: 'Settings',
                      presentation: 'modal'
                    }}
                  />
                </Stack.Navigator>
                
                <LoadingOverlay />
              </SafeAreaView>
            </NavigationContainer>
          </PaperProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;