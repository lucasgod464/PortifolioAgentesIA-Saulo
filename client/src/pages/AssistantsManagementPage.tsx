import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AssistantsPortfolio, InsertAssistantsPortfolio } from '@shared/schema';

// Animações
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

const modalAppear = keyframes`
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

// Styled Components
const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(135deg, hsl(210, 100%, 8%), hsl(0, 0%, 7%));
  overflow: hidden;
`;

const Particles = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Particle = styled.div<{ size: number; left: number; top: number; duration: number; delay: number }>`
  position: absolute;
  background: hsl(280, 70%, 60%);
  border-radius: 50%;
  opacity: 0.2;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  animation: ${float} ${props => props.duration}s infinite linear;
  animation-delay: ${props => props.delay}s;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  background: rgba(11, 26, 45, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 0 25px rgba(165, 107, 255, 0.4);
  border: 1px solid rgba(165, 107, 255, 0.3);
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  text-align: center;
  color: hsl(280, 100%, 75%);
  margin-bottom: 30px;
  font-size: 2.2rem;
  text-shadow: 0 0 10px rgba(165, 107, 255, 0.5);
  font-family: 'Audiowide', cursive;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
`;

const StyledLabel = styled(Label)`
  display: block;
  margin-bottom: 8px;
  font-size: 1.1rem;
  color: hsl(280, 100%, 75%);
`;

const StyledButton = styled(Button)`
  width: 100%;
  padding: 15px;
  background: linear-gradient(45deg, hsl(280, 70%, 50%), hsl(280, 100%, 70%));
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: 0 0 15px hsl(280, 100%, 70%);
    transform: translateY(-2px);
    background: linear-gradient(45deg, hsl(280, 70%, 55%), hsl(280, 100%, 75%));
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

  &:hover:before {
    left: 100%;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 1s ease-in-out infinite;
  display: inline-block;
  margin-right: 10px;
`;

interface FormData {
  id: string;
  nomeAgente: string;
  promptAgente: string;
  assistantId: string;
  model: string;
  tools: string;
  temperatura: string;
}

const AssistantsManagementPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    id: '',
    nomeAgente: '',
    promptAgente: '',
    assistantId: '',
    model: '',
    tools: '',
    temperatura: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Query para buscar assistentes
  const { data: assistants = [], isLoading } = useQuery({
    queryKey: ['/api/assistants-portfolio'],
    queryFn: async () => {
      const response = await fetch('/api/assistants-portfolio');
      if (!response.ok) throw new Error('Erro ao carregar assistentes');
      return response.json() as Promise<AssistantsPortfolio[]>;
    }
  });

  // Mutação para criar assistente
  const createMutation = useMutation({
    mutationFn: (data: InsertAssistantsPortfolio) =>
      apiRequest('POST', '/api/assistants-portfolio', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistants-portfolio'] });
      toast({ title: 'Sucesso!', description: 'Assistente criado com sucesso.' });
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro!', 
        description: error.message || 'Erro ao criar assistente.',
        variant: 'destructive'
      });
    }
  });

  // Mutação para atualizar assistente
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertAssistantsPortfolio> }) =>
      apiRequest('PUT', `/api/assistants-portfolio/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistants-portfolio'] });
      toast({ title: 'Sucesso!', description: 'Assistente atualizado com sucesso.' });
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro!', 
        description: error.message || 'Erro ao atualizar assistente.',
        variant: 'destructive'
      });
    }
  });

  // Mutação para deletar assistente
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest('DELETE', `/api/assistants-portfolio/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistants-portfolio'] });
      toast({ title: 'Sucesso!', description: 'Assistente removido com sucesso.' });
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro!', 
        description: error.message || 'Erro ao remover assistente.',
        variant: 'destructive'
      });
    }
  });

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      id: '',
      nomeAgente: '',
      promptAgente: '',
      assistantId: '',
      model: '',
      tools: '',
      temperatura: ''
    });
    setSelectedAssistant('');
    setIsEditing(false);
  };

  // Carregar dados do assistente selecionado
  const handleAssistantSelect = (assistantId: string) => {
    const assistant = assistants.find(a => a.id === assistantId);
    if (assistant) {
      setFormData({
        id: assistant.id,
        nomeAgente: assistant.nomeAgente,
        promptAgente: assistant.promptAgente || '',
        assistantId: assistant.assistantId || '',
        model: assistant.model || '',
        tools: assistant.tools || '',
        temperatura: assistant.temperatura || ''
      });
      setIsEditing(true);
    }
    setSelectedAssistant(assistantId);
  };

  // Submeter formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomeAgente.trim()) {
      toast({ 
        title: 'Erro!', 
        description: 'Nome do agente é obrigatório.',
        variant: 'destructive'
      });
      return;
    }

    const submitData = {
      id: formData.id || Date.now().toString(),
      nomeAgente: formData.nomeAgente,
      promptAgente: formData.promptAgente || null,
      assistantId: formData.assistantId || null,
      model: formData.model || null,
      tools: formData.tools || null,
      temperatura: formData.temperatura || null
    };

    if (isEditing) {
      updateMutation.mutate({ id: formData.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  // Deletar assistente
  const handleDelete = () => {
    if (!formData.id) return;
    
    if (confirm(`Tem certeza que deseja remover o assistente "${formData.nomeAgente}"?`)) {
      deleteMutation.mutate(formData.id);
    }
  };

  // Gerar partículas
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    left: Math.random() * window.innerWidth,
    top: Math.random() * window.innerHeight,
    duration: Math.random() * 30 + 15,
    delay: Math.random() * 10
  }));

  const isLoading2 = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <Background>
        <Particles>
          {particles.map(particle => (
            <Particle
              key={particle.id}
              size={particle.size}
              left={particle.left}
              top={particle.top}
              duration={particle.duration}
              delay={particle.delay}
            />
          ))}
        </Particles>
      </Background>

      <Container>
        <Title>Gestão de Assistentes Portfolio</Title>
        
        <form onSubmit={handleSubmit} data-testid="form-assistants">
          <FormGroup>
            <StyledLabel htmlFor="assistant-select">Assistente Existente (Opcional)</StyledLabel>
            <Select value={selectedAssistant} onValueChange={handleAssistantSelect}>
              <SelectTrigger data-testid="select-assistant">
                <SelectValue placeholder="Selecione um assistente existente para editar" />
              </SelectTrigger>
              <SelectContent>
                {assistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.nomeAgente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormGroup>

          <FormGroup>
            <StyledLabel htmlFor="id">ID do Assistente</StyledLabel>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
              placeholder="ID único do assistente (será gerado automaticamente se vazio)"
              data-testid="input-id"
            />
          </FormGroup>

          <FormGroup>
            <StyledLabel htmlFor="nome-agente">Nome do Agente *</StyledLabel>
            <Input
              id="nome-agente"
              value={formData.nomeAgente}
              onChange={(e) => setFormData(prev => ({ ...prev, nomeAgente: e.target.value }))}
              placeholder="Nome do agente"
              required
              data-testid="input-nome-agente"
            />
          </FormGroup>

          <FormGroup>
            <StyledLabel htmlFor="prompt-agente">Prompt do Agente</StyledLabel>
            <Textarea
              id="prompt-agente"
              value={formData.promptAgente}
              onChange={(e) => setFormData(prev => ({ ...prev, promptAgente: e.target.value }))}
              placeholder="Insira o prompt para o agente selecionado..."
              rows={8}
              data-testid="textarea-prompt"
            />
          </FormGroup>

          <FormGroup>
            <StyledLabel htmlFor="assistant-id">Assistant ID</StyledLabel>
            <Input
              id="assistant-id"
              value={formData.assistantId}
              onChange={(e) => setFormData(prev => ({ ...prev, assistantId: e.target.value }))}
              placeholder="ID do assistente na OpenAI"
              data-testid="input-assistant-id"
            />
          </FormGroup>

          <FormGroup>
            <StyledLabel htmlFor="model">Modelo</StyledLabel>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              placeholder="Ex: gpt-4, gpt-3.5-turbo"
              data-testid="input-model"
            />
          </FormGroup>

          <FormGroup>
            <StyledLabel htmlFor="tools">Tools</StyledLabel>
            <Textarea
              id="tools"
              value={formData.tools}
              onChange={(e) => setFormData(prev => ({ ...prev, tools: e.target.value }))}
              placeholder="Ferramentas disponíveis para o agente (JSON)"
              rows={4}
              data-testid="textarea-tools"
            />
          </FormGroup>

          <FormGroup>
            <StyledLabel htmlFor="temperatura">Temperatura</StyledLabel>
            <Input
              id="temperatura"
              value={formData.temperatura}
              onChange={(e) => setFormData(prev => ({ ...prev, temperatura: e.target.value }))}
              placeholder="Ex: 0.7"
              data-testid="input-temperatura"
            />
          </FormGroup>

          <div className="flex gap-4">
            <StyledButton type="submit" disabled={isLoading2} data-testid="button-submit">
              {isLoading2 && <LoadingSpinner />}
              {isEditing ? 'Atualizar Assistente' : 'Criar Assistente'}
            </StyledButton>
            
            {isEditing && (
              <StyledButton 
                type="button" 
                onClick={handleDelete}
                disabled={isLoading2}
                data-testid="button-delete"
                style={{ background: 'linear-gradient(45deg, #dc2626, #ef4444)' }}
              >
                {isLoading2 && <LoadingSpinner />}
                Remover
              </StyledButton>
            )}
          </div>

          {isEditing && (
            <div className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm}
                data-testid="button-reset"
                className="w-full"
              >
                Novo Assistente
              </Button>
            </div>
          )}
        </form>
      </Container>
    </>
  );
};

export default AssistantsManagementPage;