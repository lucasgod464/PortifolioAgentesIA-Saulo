import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Users, MessageSquare, Activity } from 'lucide-react';
import styled from 'styled-components';
import { fadeIn, slideUp, glowPulse, borderGlow } from '@/styles/animations';

const PageTitle = styled.h1`
  color: #d8b4fe;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.5s ease-out;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  background: rgba(30, 22, 68, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.3);
  animation: ${slideUp} 0.5s ease-out, ${glowPulse} 3s infinite ease-in-out, ${borderGlow} 3s infinite ease-in-out;
  position: relative;
  overflow: hidden;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: 0;
  }
  
  &:hover {
    animation-play-state: paused;
    border-color: rgba(139, 92, 246, 0.8);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.2);
    transform: translateY(-2px);
    transition: all 0.2s ease;
    
    &:after {
      opacity: 1;
      transform: scale(1.1);
    }
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
`;

const StatCardHeader = styled(CardHeader)`
  padding-bottom: 0.5rem;
`;

const StatCardTitle = styled(CardTitle)`
  color: #d8b4fe;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: #a78bfa;
  }
`;

const StatCardDescription = styled(CardDescription)`
  color: #a5b4fc;
`;

const StatCardContent = styled(CardContent)`
  padding-top: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  
  span {
    color: #a5b4fc;
    font-size: 1rem;
    font-weight: 400;
    margin-left: 0.5rem;
  }
`;

const ChartSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const ChartCard = styled(Card)`
  background: rgba(30, 22, 68, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.3);
  height: 400px;
  animation: ${slideUp} 0.5s ease-out, ${glowPulse} 4s infinite ease-in-out, ${borderGlow} 4s infinite ease-in-out;
  animation-delay: 0.1s;
  position: relative;
  overflow: hidden;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: 0;
  }
  
  &:hover {
    animation-play-state: paused;
    border-color: rgba(139, 92, 246, 0.8);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.2);
    
    &:after {
      opacity: 1;
      transform: scale(1.05);
    }
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
`;

export default function DashboardPage() {
  // Buscar os agentes
  const { data: agents } = useQuery({
    queryKey: ['/api/agents'],
    queryFn: async () => {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error('Erro ao buscar agentes');
      }
      return response.json();
    },
  });

  // Dados de exemplo para o dashboard (substituir por dados reais)
  const stats = {
    totalAgents: agents?.length || 0,
    totalUsers: 0,
    totalPrompts: 0,
    totalInteractions: 0,
  };

  return (
    <AdminLayout>
      <PageTitle>Dashboard Administrativo</PageTitle>

      <StatsGrid>
        <StatCard>
          <StatCardHeader>
            <StatCardTitle>
              <Bot size={20} />
              Agentes
            </StatCardTitle>
            <StatCardDescription>Total de agentes cadastrados</StatCardDescription>
          </StatCardHeader>
          <StatCardContent>
            <StatValue>{stats.totalAgents}</StatValue>
          </StatCardContent>
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatCardTitle>
              <Users size={20} />
              Usuários
            </StatCardTitle>
            <StatCardDescription>Total de usuários registrados</StatCardDescription>
          </StatCardHeader>
          <StatCardContent>
            <StatValue>{stats.totalUsers}</StatValue>
          </StatCardContent>
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatCardTitle>
              <MessageSquare size={20} />
              Prompts
            </StatCardTitle>
            <StatCardDescription>Total de prompts configurados</StatCardDescription>
          </StatCardHeader>
          <StatCardContent>
            <StatValue>{stats.totalPrompts}</StatValue>
          </StatCardContent>
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatCardTitle>
              <Activity size={20} />
              Interações
            </StatCardTitle>
            <StatCardDescription>Total de interações com agentes</StatCardDescription>
          </StatCardHeader>
          <StatCardContent>
            <StatValue>
              {stats.totalInteractions}
              <span>este mês</span>
            </StatValue>
          </StatCardContent>
        </StatCard>
      </StatsGrid>

      <ChartSection>
        <ChartCard>
          <CardHeader>
            <CardTitle>Análise de Uso</CardTitle>
            <CardDescription>Interações por período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              Gráfico será implementado aqui
            </div>
          </CardContent>
        </ChartCard>

        <ChartCard>
          <CardHeader>
            <CardTitle>Agentes mais utilizados</CardTitle>
            <CardDescription>Por número de interações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              Gráfico será implementado aqui
            </div>
          </CardContent>
        </ChartCard>
      </ChartSection>
    </AdminLayout>
  );
}