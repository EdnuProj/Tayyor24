import { createContext, useContext, useEffect, useState } from 'react';

interface TelegramContextType {
  telegramId: string | null;
  isReady: boolean;
  webApp: any;
}

const TelegramContext = createContext<TelegramContextType>({
  telegramId: null,
  isReady: false,
  webApp: null,
});

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<any>(null);

  useEffect(() => {
    const initTelegram = async () => {
      // Wait for Telegram WebApp to be available
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        try {
          tg.ready();
          tg.expand();
          
          // Extract user ID from initData
          const initData = tg.initData;
          if (initData) {
            try {
              const params = new URLSearchParams(initData);
              const userStr = params.get('user');
              if (userStr) {
                const user = JSON.parse(userStr);
                const id = user.id?.toString();
                if (id) {
                  setTelegramId(id);
                  localStorage.setItem('customerTelegramId', id);
                  console.log('✅ Telegram user initialized:', id);
                }
              }
            } catch (e) {
              console.log('Could not parse Telegram user data');
            }
          }
          
          // Also check URL params as fallback
          const params = new URLSearchParams(window.location.search);
          const urlTelegramId = params.get('telegramId');
          if (urlTelegramId) {
            setTelegramId(urlTelegramId);
            localStorage.setItem('customerTelegramId', urlTelegramId);
          }
          
          setWebApp(tg);
          setIsReady(true);
        } catch (error) {
          console.error('Telegram WebApp error:', error);
          setIsReady(true);
        }
      } else {
        // Fallback: check localStorage or URL params
        const stored = localStorage.getItem('customerTelegramId');
        const params = new URLSearchParams(window.location.search);
        const urlId = params.get('telegramId');
        
        if (stored || urlId) {
          setTelegramId(stored || urlId);
          setIsReady(true);
        }
      }
    };

    // Give Telegram SDK time to load
    const timer = setTimeout(initTelegram, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <TelegramContext.Provider value={{ telegramId, isReady, webApp }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
}
