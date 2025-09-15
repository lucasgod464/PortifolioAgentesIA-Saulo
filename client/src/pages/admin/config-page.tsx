import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SiteConfig } from '@shared/schema';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import styled from 'styled-components';
import { fadeIn, slideUp, glowPulse, shimmer, neonPulse } from '@/styles/animations';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const PageTitle = styled.h1`
  color: white;
  font-size: 2rem;
  font-weight: 600;
  animation: ${neonPulse} 3s infinite ease-in-out;
`;

const ConfigCard = styled(Card)`
  background: linear-gradient(135deg, rgba(25, 30, 45, 0.8) 0%, rgba(45, 55, 72, 0.7) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 20px rgba(139, 92, 246, 0.15);
  animation: ${slideUp} 0.5s ease-out, ${glowPulse} 4s infinite ease-in-out;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      rgba(139, 92, 246, 0), 
      rgba(139, 92, 246, 0.7), 
      rgba(139, 92, 246, 0)
    );
    animation: ${shimmer} 3s infinite linear;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const ConfigForm = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const SaveButton = styled(Button)`
  background: linear-gradient(45deg, #8b5cf6, #6366f1);
  border: none;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
  }
`;

interface ConfigFormData {
  siteTitle: string;
  logoUrl: string;
  logoLink: string;
  faviconUrl: string;
  webhookUrl: string;
  whatsappNumber: string;
}

export default function ConfigPage() {
  const [formData, setFormData] = useState<ConfigFormData>({
    siteTitle: '',
    logoUrl: '',
    logoLink: '',
    faviconUrl: '',
    webhookUrl: '',
    whatsappNumber: '',
  });
  const { toast } = useToast();

  // Fetching site config
  const { data: config, isLoading } = useQuery<SiteConfig>({
    queryKey: ['/api/site-config'],
    queryFn: async () => {
      const res = await fetch('/api/site-config');
      if (!res.ok) throw new Error('Erro ao buscar configurações');
      return res.json();
    }
  });

  // Update form data when config is loaded
  useEffect(() => {
    if (config) {
      setFormData({
        siteTitle: config.siteTitle,
        logoUrl: config.logoUrl,
        logoLink: config.logoLink,
        faviconUrl: config.faviconUrl,
        webhookUrl: config.webhookUrl,
        whatsappNumber: config.whatsappNumber,
      });
    }
  }, [config]);

  // Updating site config
  const updateConfigMutation = useMutation({
    mutationFn: async (data: ConfigFormData) => {
      const res = await apiRequest('PUT', '/api/site-config', data);
      if (!res.ok) {
        throw new Error('Erro ao atualizar configurações');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
      toast({
        title: 'Configurações atualizadas com sucesso',
        description: 'As alterações foram salvas e já estão ativas.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar configurações',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfigMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <PageHeader>
          <PageTitle>Configurações do Sistema</PageTitle>
        </PageHeader>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader>
        <PageTitle>Configurações do Sistema</PageTitle>
        <SaveButton
          onClick={handleSubmit}
          disabled={updateConfigMutation.isPending}
          data-testid="button-save-config"
        >
          {updateConfigMutation.isPending ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Salvar Configurações
            </>
          )}
        </SaveButton>
      </PageHeader>

      <ConfigCard>
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings size={20} className="mr-2" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigForm onSubmit={handleSubmit}>
            <div>
              <FormGroup>
                <Label htmlFor="siteTitle">Título do Site</Label>
                <Input
                  id="siteTitle"
                  name="siteTitle"
                  value={formData.siteTitle}
                  onChange={handleInputChange}
                  placeholder="Ex: Slapy - Agentes de IA"
                  required
                  data-testid="input-site-title"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="logoUrl">URL da Logo</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  placeholder="Ex: https://exemplo.com/logo.png"
                  required
                  data-testid="input-logo-url"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="logoLink">Link da Logo (Destino)</Label>
                <Input
                  id="logoLink"
                  name="logoLink"
                  value={formData.logoLink}
                  onChange={handleInputChange}
                  placeholder="Ex: https://slapy.com.br/"
                  required
                  data-testid="input-logo-link"
                />
              </FormGroup>
            </div>

            <div>
              <FormGroup>
                <Label htmlFor="faviconUrl">URL do Favicon</Label>
                <Input
                  id="faviconUrl"
                  name="faviconUrl"
                  value={formData.faviconUrl}
                  onChange={handleInputChange}
                  placeholder="Ex: https://exemplo.com/favicon.ico"
                  required
                  data-testid="input-favicon-url"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="webhookUrl">URL do Webhook</Label>
                <Input
                  id="webhookUrl"
                  name="webhookUrl"
                  value={formData.webhookUrl}
                  onChange={handleInputChange}
                  placeholder="Ex: https://n8n.exemplo.pro/webhook/portfolio"
                  required
                  data-testid="input-webhook-url"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
                <Input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  placeholder="Ex: 5544999998888"
                  required
                  data-testid="input-whatsapp-number"
                />
              </FormGroup>
            </div>
          </ConfigForm>
        </CardContent>
      </ConfigCard>
    </AdminLayout>
  );
}