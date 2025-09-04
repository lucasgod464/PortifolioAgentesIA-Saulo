import React from 'react';
import styled from 'styled-components';
import AgentCard from './AgentCard';
import { agents } from '../data/agents';
import { useAgentsFromEnv, AgentConfig } from '../hooks/use-env-config';

const AgentSection = styled.section`
  position: relative;
  z-index: 10;
  padding: 4rem 1rem;
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
  
  @media (min-width: 1024px) {
    padding: 4rem 4rem;
  }
`;

const SectionContainer = styled.div`
  max-width: 1440px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.875rem;
  color: white;
  margin-bottom: 1rem;
  font-family: 'Audiowide', cursive;
  
  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`;

const Divider = styled.div`
  height: 0.25rem;
  width: 6rem;
  background: linear-gradient(to right, #6b46c1, #2563eb);
  margin: 0 auto 1.5rem;
`;

const SectionDescription = styled.p`
  color: #d1d5db;
  max-width: 48rem;
  margin: 0 auto;
`;

const AgentGridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  & > div {
    height: 100%;
    display: flex;
  }
`;

const AgentGrid: React.FC = () => {
  const { agents: configuredAgents, loading } = useAgentsFromEnv();

  // Função para mesclar configurações do env com dados padrão
  const getDisplayAgents = () => {
    return agents.map((defaultAgent) => {
      const envConfig = configuredAgents.find(config => config.id === defaultAgent.id);
      
      // Se não está visível na configuração do ambiente, pula este agente
      if (envConfig && !envConfig.visible) {
        return null;
      }
      
      // Mescla dados padrão com configurações do ambiente
      return {
        id: defaultAgent.id,
        icon: envConfig?.icon || defaultAgent.icon,
        title: envConfig?.title || defaultAgent.title,
        description: envConfig?.description || defaultAgent.description,
        initialMessage: envConfig?.initialMessage || `Olá! Sou o ${defaultAgent.title}. Como posso ajudar você hoje?`,
        webhookName: envConfig?.webhookName || defaultAgent.title
      };
    }).filter(Boolean); // Remove agentes null (não visíveis)
  };

  const displayAgents = getDisplayAgents();

  if (loading) {
    return (
      <AgentSection id="agents">
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>Carregando Agentes...</SectionTitle>
            <Divider />
          </SectionHeader>
        </SectionContainer>
      </AgentSection>
    );
  }

  return (
    <AgentSection id="agents">
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>Nossos Agentes Inteligentes</SectionTitle>
          <Divider />
          <SectionDescription>
            Escolha entre nossa seleção de agentes de IA especializados, cada um projetado para 
            resolver problemas específicos e transformar a maneira como você trabalha.
          </SectionDescription>
        </SectionHeader>
        
        <AgentGridContainer>
          {displayAgents.map((agent) => {
            if (!agent) return null;
            return (
              <AgentCard 
                key={agent.id}
                icon={agent.icon}
                title={agent.title}
                description={agent.description}
                initialMessage={agent.initialMessage}
                webhookName={agent.webhookName}
              />
            );
          })}
        </AgentGridContainer>
      </SectionContainer>
    </AgentSection>
  );
};

export default AgentGrid;
