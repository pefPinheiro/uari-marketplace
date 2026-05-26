import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ScreenType = 'splash' | 'login' | 'role_select' | 'user_home' | 'lojista_dashboard' | 'product_details' | 'cart' | 'store_profile' | 'coupons' | 'order_status';

interface NavigationContextType {
  currentScreen: ScreenType;
  history: ScreenType[];
  navigate: (screen: ScreenType) => void;
  goBack: () => void;
  reset: (screen: ScreenType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [history, setHistory] = useState<ScreenType[]>(['splash']);

  const navigate = (screen: ScreenType) => {
    setHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove a tela atual
      const previousScreen = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentScreen(previousScreen);
    }
  };

  const reset = (screen: ScreenType) => {
    setHistory([screen]);
    setCurrentScreen(screen);
  };

  return (
    <NavigationContext.Provider value={{ currentScreen, history, navigate, goBack, reset }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation deve ser usado dentro de um NavigationProvider');
  }
  return context;
}
