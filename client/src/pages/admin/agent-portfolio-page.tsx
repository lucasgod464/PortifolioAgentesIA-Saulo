import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAgentsFromEnv, AgentConfig } from '@/hooks/use-env-config';
import { Edit, Trash2, Plus, MessageSquare, Bot, CheckCircle2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import styled from 'styled-components';
import { fadeIn, slideUp, glowPulse, shimmer, neonPulse, gradientShift, pulseLight } from '@/styles/animations';

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

const PromptsTable = styled(Card)`
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

const StyledTableRow = styled(TableRow)`
  position: relative;
  transition: all 0.2s ease;
  background: linear-gradient(90deg, rgba(25, 30, 45, 0.3) 0%, rgba(45, 55, 72, 0.3) 100%);
  border: none;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 4px;
  
  &:hover {
    background: linear-gradient(90deg, rgba(25, 30, 45, 0.6) 0%, rgba(45, 55, 72, 0.6) 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
  }
  
  td {
    border-bottom: none;
  }
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #8b5cf6, #6366f1);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  &:hover:before {
    opacity: 1;
  }
`;

const StyledTableHead = styled(TableHead)`
  background: linear-gradient(90deg, rgba(30, 35, 50, 0.7) 0%, rgba(50, 60, 80, 0.7) 100%);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 0.75rem;
`;

const ActionButton = styled(Button)`
  padding: 0.5rem;
  height: 2.25rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const PromptTextArea = styled(Textarea)`
  min-height: 200px;
  font-family: monospace;
`;

const TruncatedText = styled.div`
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HasPromptBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.25) 100%);
  color: rgb(52, 211, 153);
  border-radius: 1rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 500;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.2);
  letter-spacing: 0.5px;
  animation: ${pulseLight} 3s infinite ease-in-out;
  
  svg {
    width: 0.75rem;
    height: 0.75rem;
    margin-right: 0.35rem;
    filter: drop-shadow(0 0 1px rgba(34, 197, 94, 0.5));
  }
`;

interface AssistantsPortfolio {
  id: string;
  nomeAgente: string;
  promptAgente?: string;
  assistantId?: string;
  model?: string;
  tools?: string;
  temperatura?: string;
}

interface PromptFormData {
  id?: string;
  agentId: number;
  nomeAgente: string;
  promptAgente: string;
  assistantId?: string;
  model: string;
  tools?: string;
  temperatura: string;
}

export default function AgentPortfolioPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PromptFormData>({
    agentId: 0,
    nomeAgente: '',
    promptAgente: '',
    assistantId: '',
    model: 'gpt-4o-mini',
    tools: '',
    temperatura: '0.7',
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Buscar agentes visíveis da página principal
  const { agents: visibleAgents, loading: isLoadingAgents } = useAgentsFromEnv();

  // Buscar prompts da tabela assistants_portfolio
  const { 
    data: assistants, 
    isLoading: isLoadingPrompts,
    refetch: refetchPrompts
  } = useQuery<AssistantsPortfolio[]>({
    queryKey: ['/api/assistants-portfolio'],
    queryFn: async () => {
      const res = await fetch('/api/assistants-portfolio');
      if (!res.ok) throw new Error('Erro ao buscar prompts dos agentes');
      return res.json();
    }
  });

  // Criar novo prompt
  const createPromptMutation = useMutation({
    mutationFn: async (data: PromptFormData) => {
      const assistantData = {
        id: `agent_${data.agentId}`,
        nomeAgente: data.nomeAgente,
        promptAgente: data.promptAgente,
        assistantId: data.assistantId || null,
        model: data.model,
        tools: data.tools || null,
        temperatura: data.temperatura,
      };

      const res = await apiRequest('POST', '/api/assistants-portfolio', assistantData);
      if (!res.ok) {
        throw new Error('Erro ao criar prompt');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistants-portfolio'] });
      resetForm();
      setIsDialogOpen(false);
      toast({
        title: 'Prompt criado com sucesso',
        description: 'O prompt foi adicionado ao agente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar prompt',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Atualizar prompt
  const updatePromptMutation = useMutation({
    mutationFn: async (data: PromptFormData) => {
      if (!data.id) throw new Error('ID do prompt não fornecido');
      
      const assistantData = {
        nomeAgente: data.nomeAgente,
        promptAgente: data.promptAgente,
        assistantId: data.assistantId || null,
        model: data.model,
        tools: data.tools || null,
        temperatura: data.temperatura,
      };

      const res = await apiRequest('PUT', `/api/assistants-portfolio/${data.id}`, assistantData);
      if (!res.ok) {
        throw new Error('Erro ao atualizar prompt');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistants-portfolio'] });
      resetForm();
      setIsDialogOpen(false);
      toast({
        title: 'Prompt atualizado com sucesso',
        description: 'As alterações foram salvas.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar prompt',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Deletar prompt
  const deletePromptMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/assistants-portfolio/${id}`);
      if (!res.ok) {
        throw new Error('Erro ao excluir prompt');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistants-portfolio'] });
      toast({
        title: 'Prompt excluído com sucesso',
        description: 'O prompt foi removido com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir prompt',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && formData.id) {
      updatePromptMutation.mutate(formData);
    } else {
      createPromptMutation.mutate(formData);
    }
  };

  const handleEdit = (assistant: AssistantsPortfolio) => {
    const agentId = parseInt(assistant.id.replace('agent_', ''));
    setFormData({
      id: assistant.id,
      agentId: agentId,
      nomeAgente: assistant.nomeAgente,
      promptAgente: assistant.promptAgente || '',
      assistantId: assistant.assistantId || '',
      model: assistant.model || 'gpt-4o-mini',
      tools: assistant.tools || '',
      temperatura: assistant.temperatura || '0.7',
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este prompt? Esta ação não pode ser desfeita.')) {
      deletePromptMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      agentId: 0,
      nomeAgente: '',
      promptAgente: '',
      assistantId: '',
      model: 'gpt-4o-mini',
      tools: '',
      temperatura: '0.7',
    });
    setIsEditing(false);
  };

  const openNewPromptDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleAgentChange = (value: string) => {
    const agentId = parseInt(value);
    const selectedAgent = visibleAgents.find(agent => agent.id === agentId);
    
    setFormData(prev => ({ 
      ...prev, 
      agentId,
      nomeAgente: selectedAgent?.title || `Agente ${agentId}`
    }));
  };

  // Combinar agentes visíveis com prompts existentes
  const getAgentsWithPrompts = () => {
    return visibleAgents.map(agent => {
      const existingPrompt = assistants?.find(ass => ass.id === `agent_${agent.id}`);
      return {
        ...agent,
        hasPrompt: !!existingPrompt,
        prompt: existingPrompt
      };
    });
  };

  const agentsWithPrompts = getAgentsWithPrompts();

  return (
    <AdminLayout>
      <PageHeader>
        <PageTitle>Gerenciar Prompts dos Agentes</PageTitle>
        <Button onClick={openNewPromptDialog}>
          <Plus size={16} className="mr-2" />
          Novo Prompt
        </Button>
      </PageHeader>

      <PromptsTable>
        <CardHeader>
          <CardTitle className="text-white">
            Agentes e seus Prompts ({agentsWithPrompts.length} agentes visíveis)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAgents || isLoadingPrompts ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <Table className="border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <StyledTableHead className="w-[80px]">ID</StyledTableHead>
                  <StyledTableHead>Nome do Agente</StyledTableHead>
                  <StyledTableHead>Prompt</StyledTableHead>
                  <StyledTableHead className="w-[100px]">Status</StyledTableHead>
                  <StyledTableHead className="w-[150px] text-right">Ações</StyledTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentsWithPrompts.length > 0 ? (
                  agentsWithPrompts.map((agent) => (
                    <StyledTableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bot size={16} className="text-cyan-400" />
                          <span className="text-gray-300">{agent.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agent.prompt?.promptAgente ? (
                          <TruncatedText 
                            title={agent.prompt.promptAgente}
                            className="text-gray-300"
                          >
                            {agent.prompt.promptAgente}
                          </TruncatedText>
                        ) : (
                          <span className="text-gray-500 italic">Sem prompt configurado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {agent.hasPrompt && (
                          <HasPromptBadge>
                            <CheckCircle2 />
                            Configurado
                          </HasPromptBadge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {agent.hasPrompt ? (
                            <>
                              <ActionButton 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEdit(agent.prompt!)}
                              >
                                <Edit className="text-blue-400" />
                              </ActionButton>
                              <ActionButton 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDelete(agent.prompt!.id)}
                              >
                                <Trash2 />
                              </ActionButton>
                            </>
                          ) : (
                            <ActionButton 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  agentId: agent.id,
                                  nomeAgente: agent.title || `Agente ${agent.id}`
                                }));
                                setIsDialogOpen(true);
                              }}
                            >
                              <Plus className="text-green-400" />
                            </ActionButton>
                          )}
                        </div>
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <StyledTableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                      <span className="text-gray-300">Nenhum agente visível encontrado</span>
                    </TableCell>
                  </StyledTableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </PromptsTable>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Prompt do Agente' : 'Criar Prompt para Agente'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Modifique as configurações do prompt do agente abaixo.' 
                : 'Configure o prompt e parâmetros para o agente selecionado.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup>
                <Label htmlFor="agentId">Agente</Label>
                <Select
                  value={formData.agentId.toString()}
                  onValueChange={handleAgentChange}
                  disabled={isEditing}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um agente" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.title || `Agente ${agent.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="model">Modelo</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                    <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                  </SelectContent>
                </Select>
              </FormGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup>
                <Label htmlFor="assistantId">Assistant ID (OpenAI)</Label>
                <Input
                  id="assistantId"
                  name="assistantId"
                  value={formData.assistantId}
                  onChange={handleInputChange}
                  placeholder="asst_xxxxxxxxxxxxx"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="temperatura">Temperatura</Label>
                <Select
                  value={formData.temperatura}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, temperatura: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a temperatura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 (Muito conservador)</SelectItem>
                    <SelectItem value="0.3">0.3 (Conservador)</SelectItem>
                    <SelectItem value="0.7">0.7 (Balanceado)</SelectItem>
                    <SelectItem value="1.0">1.0 (Criativo)</SelectItem>
                    <SelectItem value="1.5">1.5 (Muito criativo)</SelectItem>
                  </SelectContent>
                </Select>
              </FormGroup>
            </div>
            
            <FormGroup>
              <Label htmlFor="promptAgente">Prompt do Agente</Label>
              <PromptTextArea
                id="promptAgente"
                name="promptAgente"
                value={formData.promptAgente}
                onChange={handleInputChange}
                placeholder="Digite o prompt completo do agente aqui..."
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="tools">Tools/Funções (JSON)</Label>
              <Textarea
                id="tools"
                name="tools"
                value={formData.tools}
                onChange={handleInputChange}
                placeholder='[{"type": "function", "function": {...}}]'
                className="font-mono"
              />
            </FormGroup>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createPromptMutation.isPending || updatePromptMutation.isPending}
              >
                {isEditing 
                  ? (updatePromptMutation.isPending ? 'Salvando...' : 'Salvar Alterações') 
                  : (createPromptMutation.isPending ? 'Criando...' : 'Criar Prompt')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}