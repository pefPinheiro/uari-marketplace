import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';
import { AppProvider } from './src/context/AppContext';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RoleSelectScreen from './src/screens/RoleSelectScreen';
import ClienteHomeScreen from './src/screens/ClienteHomeScreen';
import LojistaDashboardScreen from './src/screens/LojistaDashboardScreen';
import ProductDetailsScreen from './src/screens/client/ProductDetailsScreen';
import CartScreen from './src/screens/client/CartScreen';
import StoreProfileScreen from './src/screens/client/StoreProfileScreen';
import ClienteCouponsScreen from './src/screens/client/ClienteCouponsScreen';
import OrderStatusScreen from './src/screens/client/OrderStatusScreen';

function AppRouter() {
  const { currentScreen } = useNavigation();

  switch (currentScreen) {
    case 'login':
      return <LoginScreen />;
    case 'role_select':
      return <RoleSelectScreen />;
    case 'user_home':
      return <ClienteHomeScreen />;
    case 'lojista_dashboard':
      return <LojistaDashboardScreen />;
    case 'product_details':
      return <ProductDetailsScreen />;
    case 'cart':
      return <CartScreen />;
    case 'store_profile':
      return <StoreProfileScreen />;
    case 'coupons':
      return <ClienteCouponsScreen />;
    case 'order_status':
      return <OrderStatusScreen />;
    case 'splash':
    default:
      return <SplashScreen />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <NavigationProvider>
          <AppRouter />
        </NavigationProvider>
      </AppProvider>
    </AuthProvider>
  );
}
