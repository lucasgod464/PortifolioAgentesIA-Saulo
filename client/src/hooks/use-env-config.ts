import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Hook para gerenciar o sessionID
export const useSessionId = () => {
  const [sessionId, setSessionId] = useState<string>('');
  
  useEffect(() => {
    // Verifica se já existe um sessionId no localStorage
    let id = localStorage.getItem('nexusai_session_id');
    
    // Se não existir, cria um novo e salva no localStorage
    if (!id) {
      id = uuidv4();
      localStorage.setItem('nexusai_session_id', id);
    }
    
    console.log('Session ID:', id);
    setSessionId(id);
  }, []);
  
  return sessionId;
};

// Hook para obter o logotipo da API em tempo real
export const useLogoFromEnv = () => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          console.log('Logo obtida da API:', config.logoUrl);
          setLogoUrl(config.logoUrl);
        } else {
          // Fallback se a API falhar
          const defaultLogo = 'https://static.vecteezy.com/system/resources/previews/009/384/620/original/ai-tech-artificial-intelligence-clipart-design-illustration-free-png.png';
          console.log('Usando logo padrão (API falhou):', defaultLogo);
          setLogoUrl(defaultLogo);
        }
      } catch (error) {
        console.error('Erro ao buscar config da API:', error);
        // Fallback se der erro
        const defaultLogo = 'https://static.vecteezy.com/system/resources/previews/009/384/620/original/ai-tech-artificial-intelligence-clipart-design-illustration-free-png.png';
        setLogoUrl(defaultLogo);
      }
    };

    fetchConfig();
  }, []);
  
  return logoUrl;
};

// Hook para obter a URL do webhook da API em tempo real
export const useWebhookUrl = () => {
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          console.log('Webhook obtido da API:', config.webhookUrl);
          setWebhookUrl(config.webhookUrl);
        } else {
          // Fallback se a API falhar
          const defaultWebhookUrl = 'https://webhook.dev.testandoaulanapratica.shop/webhook/portfolio_virtual';
          setWebhookUrl(defaultWebhookUrl);
        }
      } catch (error) {
        console.error('Erro ao buscar config da API:', error);
        const defaultWebhookUrl = 'https://webhook.dev.testandoaulanapratica.shop/webhook/portfolio_virtual';
        setWebhookUrl(defaultWebhookUrl);
      }
    };

    fetchConfig();
  }, []);
  
  return webhookUrl;
};

// Hook para obter o link do WhatsApp da API em tempo real
export const useWhatsAppLink = () => {
  const [whatsappLink, setWhatsappLink] = useState<string>('');
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          const finalWhatsAppLink = `https://wa.me/${config.whatsappNumber}`;
          console.log('WhatsApp obtido da API:', config.whatsappNumber);
          setWhatsappLink(finalWhatsAppLink);
        } else {
          // Fallback se a API falhar
          const defaultWhatsAppNumber = '5544999998888';
          const finalWhatsAppLink = `https://wa.me/${defaultWhatsAppNumber}`;
          setWhatsappLink(finalWhatsAppLink);
        }
      } catch (error) {
        console.error('Erro ao buscar config da API:', error);
        const defaultWhatsAppNumber = '5544999998888';
        const finalWhatsAppLink = `https://wa.me/${defaultWhatsAppNumber}`;
        setWhatsappLink(finalWhatsAppLink);
      }
    };

    fetchConfig();
  }, []);
  
  return whatsappLink;
};

// Hook para gerenciar o favicon dinamicamente
export const useFaviconFromEnv = () => {
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          console.log('Favicon obtido da API:', config.faviconUrl);
          
          // Remove favicon existente
          const existingFavicon = document.querySelector('link[rel="icon"]') || 
                                 document.querySelector('link[rel="shortcut icon"]');
          if (existingFavicon) {
            existingFavicon.remove();
          }
          
          // Adiciona novo favicon
          const link = document.createElement('link');
          link.rel = 'icon';
          link.type = 'image/x-icon';
          link.href = config.faviconUrl;
          document.head.appendChild(link);
        } else {
          console.log('Erro ao obter favicon da API, mantendo o padrão');
        }
      } catch (error) {
        console.error('Erro ao buscar favicon da API:', error);
      }
    };

    fetchConfig();
  }, []);
};

// Hook para gerenciar o título do site dinamicamente
export const useSiteTitleFromEnv = () => {
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          console.log('Título obtido da API:', config.siteTitle);
          
          // Atualiza o título da página
          document.title = config.siteTitle;
        } else {
          console.log('Erro ao obter título da API, mantendo o padrão');
          document.title = 'NexusAI - Agentes de Inteligência Artificial';
        }
      } catch (error) {
        console.error('Erro ao buscar título da API:', error);
        document.title = 'NexusAI - Agentes de Inteligência Artificial';
      }
    };

    fetchConfig();
  }, []);
};

// Hook para obter o link da logo da API em tempo real
export const useLogoLinkFromEnv = () => {
  const [logoLink, setLogoLink] = useState<string>('/');
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          console.log('Link da logo obtido da API:', config.logoLink);
          setLogoLink(config.logoLink);
        } else {
          // Fallback se a API falhar
          console.log('Erro ao obter link da logo da API, usando padrão');
          setLogoLink('/');
        }
      } catch (error) {
        console.error('Erro ao buscar link da logo da API:', error);
        setLogoLink('/');
      }
    };

    fetchConfig();
  }, []);
  
  return logoLink;
};