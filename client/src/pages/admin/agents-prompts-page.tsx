import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAgentsFromEnv, AgentConfig } from '../../hooks/use-env-config';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';

// Floating particles animation
const float = keyframes`
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0.2;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-100vh) translateX(100vw) rotate(360deg);
    opacity: 0.2;
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(135deg, #0b1a2d, #111);
  overflow: hidden;
`;

const ParticlesContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Particle = styled.div<{ size: number; posX: number; posY: number; duration: number; delay: number }>`
  position: absolute;
  background: #6e3996;
  border-radius: 50%;
  opacity: 0.2;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  left: ${props => props.posX}px;
  top: ${props => props.posY}px;
  animation: ${float} ${props => props.duration}s infinite linear ${props => props.delay}s;
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0;
  padding: 30px;
  background: rgba(11, 26, 45, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 0 25px rgba(111, 57, 150, 0.4);
  border: 1px solid rgba(111, 57, 150, 0.3);
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 100px);
`;

const Title = styled.h1`
  text-align: center;
  color: #a56bff;
  margin-bottom: 30px;
  font-size: 2.2rem;
  text-shadow: 0 0 10px rgba(165, 107, 255, 0.5);
  font-family: 'Audiowide', cursive;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 1.1rem;
  color: #a56bff;
  font-weight: 500;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid #6e3996;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 10px #a56bff;
    border-color: #a56bff;
  }
  
  option {
    background-color: #0b1a2d;
    color: white;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid #6e3996;
  color: white;
  font-size: 1rem;
  resize: vertical;
  transition: all 0.3s ease;
  font-family: monospace;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 10px #a56bff;
    border-color: #a56bff;
  }
`;

const Button = styled.button<{ disabled?: boolean }>`
  display: block;
  width: 100%;
  padding: 15px;
  background: ${props => props.disabled ? 'rgba(111, 57, 150, 0.5)' : 'linear-gradient(45deg, #6e3996, #a56bff)'};
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    box-shadow: 0 0 15px #a56bff;
    transform: translateY(-2px);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: 0.5s;
  }
  
  &:hover:not(:disabled):before {
    left: 100%;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(111, 57, 150, 0.3);
  border-radius: 50%;
  border-top-color: #a56bff;
  animation: ${spin} 1s ease-in-out infinite;
  display: inline-block;
  margin-right: 10px;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 5px;
  padding: 10px;
  margin: 10px 0;
`;

const SuccessMessage = styled.div`
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 5px;
  padding: 10px;
  margin: 10px 0;
`;

const InfoBox = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  color: #93c5fd;
`;

// Schema for form validation
const assistantSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  nomeAgente: z.string().min(1, 'Nome do agente é obrigatório'),
  promptAgente: z.string().min(10, 'Prompt deve ter pelo menos 10 caracteres'),
  tools: z.string().optional(),
  model: z.string().optional(),
  temperatura: z.string().optional(),
});

type AssistantFormData = z.infer<typeof assistantSchema>;

interface AssistantsPortfolio {
  id: string;
  nomeAgente: string;
  promptAgente?: string;
  assistantId?: string;
  model?: string;
  tools?: string;
  temperatura?: string;
}

const AgentsPromptsAdminPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const { agents: configuredAgents, loading: agentsLoading } = useAgentsFromEnv();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate particles
  const [particles] = useState(() => {
    const particleCount = Math.min(20, Math.floor(window.innerWidth / 40));
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      size: Math.random() * 100 + 30,
      posX: Math.random() * window.innerWidth,
      posY: Math.random() * window.innerHeight,
      duration: Math.random() * 25 + 15,
      delay: Math.random() * 10,
    }));
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<AssistantFormData>({
    resolver: zodResolver(assistantSchema),
  });

  const watchedAgentId = watch('id');

  // Fetch assistants portfolio
  const { data: assistants, isLoading: assistantsLoading } = useQuery({
    queryKey: ['/api/assistants-portfolio'],
    queryFn: () => apiRequest('/api/assistants-portfolio') as Promise<AssistantsPortfolio[]>,
  });

  // Create/Update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (data: AssistantFormData) => {
      const existingAssistant = assistants?.find(a => a.id === data.id);
      
      if (existingAssistant) {
        return apiRequest(`/api/assistants-portfolio/${data.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest('/api/assistants-portfolio', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistants-portfolio'] });
      toast({
        title: "Sucesso!",
        description: "Prompt do agente atualizado com sucesso.",
        variant: "default",
      });
      // Don't reset form to allow continued editing
    },
    onError: (error: any) => {
      toast({
        title: "Erro!",
        description: `Não foi possível atualizar o prompt: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Load existing assistant data when agent is selected
  useEffect(() => {
    if (selectedAgent) {
      const agentConfig = configuredAgents.find(agent => agent.id.toString() === selectedAgent);
      const existingAssistant = assistants?.find(a => a.id === selectedAgent);
      
      if (agentConfig) {
        setValue('id', selectedAgent);
        setValue('nomeAgente', agentConfig.title || `Agente ${selectedAgent}`);
        setValue('promptAgente', existingAssistant?.promptAgente || '');
        setValue('tools', existingAssistant?.tools || '');
        setValue('model', existingAssistant?.model || 'gpt-4-turbo-preview');
        setValue('temperatura', existingAssistant?.temperatura || '0.7');
      }
    }
  }, [selectedAgent, configuredAgents, assistants, setValue]);

  const onSubmit = (data: AssistantFormData) => {
    createUpdateMutation.mutate(data);
  };

  const visibleAgents = configuredAgents.filter(agent => agent.visible);
  const existingAssistant = assistants?.find(a => a.id === selectedAgent);

  return (
    <AdminLayout>
      <Background>
        <ParticlesContainer>
          {particles.map(particle => (
            <Particle
              key={particle.id}
              size={particle.size}
              posX={particle.posX}
              posY={particle.posY}
              duration={particle.duration}
              delay={particle.delay}
            />
          ))}
        </ParticlesContainer>
      </Background>
      
      <Container>
        <Title>Gerenciamento de Prompts dos Agentes</Title>
        
        <InfoBox>
          <strong>ℹ️ Informação:</strong> Esta página permite configurar prompts personalizados para os agentes 
          visíveis em seu ambiente. Os agentes são carregados automaticamente das suas configurações de ambiente.
        </InfoBox>
        
        {agentsLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <LoadingSpinner />
            <span>Carregando agentes...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup>
              <Label htmlFor="agentSelect">Selecionar Agente ({visibleAgents.length} disponíveis)</Label>
              <Select
                id="agentSelect"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                data-testid="select-agent"
              >
                <option value="">Selecione um agente</option>
                {visibleAgents.map((agent) => (
                  <option key={agent.id} value={agent.id.toString()}>
                    {agent.title || `Agente ${agent.id}`} {assistants?.find(a => a.id === agent.id.toString()) ? '✅' : '⭕'}
                  </option>
                ))}
              </Select>
            </FormGroup>

            {selectedAgent && (
              <>
                <InfoBox>
                  <strong>Status:</strong> {existingAssistant ? 'Prompt já configurado - editando' : 'Novo prompt - criando'}
                  <br />
                  <strong>Agente:</strong> {configuredAgents.find(a => a.id.toString() === selectedAgent)?.title}
                </InfoBox>

                <FormGroup>
                  <Label htmlFor="nomeAgente">Nome do Agente</Label>
                  <TextArea
                    id="nomeAgente"
                    {...register('nomeAgente')}
                    placeholder="Nome do agente"
                    rows={2}
                    data-testid="input-nome-agente"
                  />
                  {errors.nomeAgente && (
                    <ErrorMessage>{errors.nomeAgente.message}</ErrorMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="promptAgente">Prompt do Agente *</Label>
                  <TextArea
                    id="promptAgente"
                    {...register('promptAgente')}
                    placeholder="Insira o prompt detalhado para o agente selecionado...

Exemplo:
Você é um assistente especializado em vendas e comercial. Suas responsabilidades incluem:
- Qualificar leads de forma eficiente
- Identificar necessidades dos clientes
- Propor soluções adequadas
- Manter um relacionamento profissional

Sempre responda de forma:
- Clara e objetiva
- Profissional e cordial  
- Focada em resultados"
                    rows={15}
                    data-testid="input-prompt-agente"
                  />
                  {errors.promptAgente && (
                    <ErrorMessage>{errors.promptAgente.message}</ErrorMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="tools">Tools (JSON Opcional)</Label>
                  <TextArea
                    id="tools"
                    {...register('tools')}
                    placeholder='[
  {
    "type": "function",
    "function": {
      "name": "buscar_informacoes",
      "description": "Busca informações relevantes",
      "parameters": {
        "type": "object",
        "properties": {
          "consulta": {
            "type": "string",
            "description": "Termo de busca"
          }
        },
        "required": ["consulta"]
      }
    }
  }
]'
                    rows={8}
                    data-testid="input-tools"
                  />
                  {errors.tools && (
                    <ErrorMessage>{errors.tools.message}</ErrorMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="model">Modelo</Label>
                  <Select
                    id="model"
                    {...register('model')}
                    data-testid="select-model"
                  >
                    <option value="gpt-4-turbo-preview">GPT-4 Turbo Preview (Recomendado)</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Mais Rápido)</option>
                    <option value="gpt-4o">GPT-4o (Multimodal)</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="temperatura">Temperatura (Criatividade)</Label>
                  <Select
                    id="temperatura"
                    {...register('temperatura')}
                    data-testid="select-temperatura"
                  >
                    <option value="0.1">0.1 - Muito Conservador (Respostas precisas)</option>
                    <option value="0.3">0.3 - Conservador (Consistente)</option>
                    <option value="0.5">0.5 - Equilibrado</option>
                    <option value="0.7">0.7 - Criativo (Recomendado)</option>
                    <option value="0.9">0.9 - Muito Criativo</option>
                    <option value="1.0">1.0 - Máximo (Experimental)</option>
                  </Select>
                </FormGroup>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || createUpdateMutation.isPending}
                  data-testid="button-submit"
                >
                  {(isSubmitting || createUpdateMutation.isPending) && <LoadingSpinner />}
                  {existingAssistant ? 'Atualizar Prompt' : 'Criar Prompt'}
                </Button>
              </>
            )}
          </form>
        )}
      </Container>
    </AdminLayout>
  );
};

export default AgentsPromptsAdminPage;