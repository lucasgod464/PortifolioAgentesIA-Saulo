import { useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Agent } from '@shared/schema';
import { Edit, Trash2, Plus, Bot } from 'lucide-react';
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

const AgentsTable = styled(Card)`
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

const IconPreview = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  
  i {
    margin-right: 0.5rem;
  }
`;

interface AgentFormData {
  id?: number;
  title: string;
  description: string;
  icon: string;
  initialMessage?: string;
  webhookName?: string;
}

export default function AgentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AgentFormData>({
    title: '',
    description: '',
    icon: 'fas fa-robot',
    initialMessage: '',
    webhookName: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Fetching agents
  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    queryFn: async () => {
      const res = await fetch('/api/agents');
      if (!res.ok) throw new Error('Erro ao buscar agentes');
      return res.json();
    }
  });

  // Creating a new agent
  const createAgentMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      const res = await apiRequest('POST', '/api/agents', data);
      if (!res.ok) {
        throw new Error('Erro ao criar agente');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      resetForm();
      setIsDialogOpen(false);
      toast({
        title: 'Agente criado com sucesso',
        description: 'O novo agente foi adicionado à lista.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar agente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Updating an agent
  const updateAgentMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      if (!data.id) throw new Error('ID do agente não fornecido');
      const res = await apiRequest('PUT', `/api/agents/${data.id}`, data);
      if (!res.ok) {
        throw new Error('Erro ao atualizar agente');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      resetForm();
      setIsDialogOpen(false);
      toast({
        title: 'Agente atualizado com sucesso',
        description: 'As alterações foram salvas.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar agente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Deleting an agent
  const deleteAgentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/agents/${id}`);
      if (!res.ok) {
        throw new Error('Erro ao excluir agente');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: 'Agente excluído com sucesso',
        description: 'O agente foi removido da lista.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir agente',
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
      updateAgentMutation.mutate(formData);
    } else {
      createAgentMutation.mutate(formData);
    }
  };

  const handleEdit = (agent: Agent) => {
    setFormData({
      ...agent,
      initialMessage: agent.initialMessage || '',
      webhookName: agent.webhookName || '',
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.')) {
      deleteAgentMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: 'fas fa-robot',
      initialMessage: '',
      webhookName: '',
    });
    setIsEditing(false);
  };

  const openNewAgentDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <PageHeader>
        <PageTitle>Gerenciamento de Agentes</PageTitle>
        <Button onClick={openNewAgentDialog}>
          <Plus size={16} className="mr-2" />
          Novo Agente
        </Button>
      </PageHeader>

      <AgentsTable>
        <CardHeader>
          <CardTitle className="text-white">Agentes Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <Table className="border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <StyledTableHead className="w-[50px]">ID</StyledTableHead>
                  <StyledTableHead className="w-[80px]">Ícone</StyledTableHead>
                  <StyledTableHead>Título</StyledTableHead>
                  <StyledTableHead className="max-w-[300px]">Descrição</StyledTableHead>
                  <StyledTableHead className="text-right">Ações</StyledTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents && agents.length > 0 ? (
                  agents.map((agent) => (
                    <StyledTableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.id}</TableCell>
                      <TableCell>
                        <i className={`${agent.icon} text-purple-400`}></i>
                      </TableCell>
                      <TableCell className="font-medium">{agent.title}</TableCell>
                      <TableCell className="max-w-[300px] truncate text-gray-300">{agent.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <ActionButton 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(agent)}
                          >
                            <Edit className="text-blue-400" />
                          </ActionButton>
                          <ActionButton 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(agent.id)}
                          >
                            <Trash2 />
                          </ActionButton>
                        </div>
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <StyledTableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Bot size={24} className="mx-auto mb-2 opacity-50" />
                      Nenhum agente encontrado
                    </TableCell>
                  </StyledTableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </AgentsTable>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Agente' : 'Novo Agente'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Modifique os dados do agente abaixo.' 
                : 'Preencha os detalhes para criar um novo agente.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Comercial"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ex: Assistente virtual para equipes comerciais e vendas"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="icon">Classe do Ícone (Font Awesome)</Label>
              <Input
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                placeholder="Ex: fas fa-briefcase"
                required
              />
              <IconPreview>
                <i className={formData.icon}></i>
                <span>Prévia do ícone</span>
              </IconPreview>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="initialMessage">Mensagem Inicial (Opcional)</Label>
              <Textarea
                id="initialMessage"
                name="initialMessage"
                value={formData.initialMessage || ''}
                onChange={handleInputChange}
                placeholder="Ex: Olá! Sou o Agente Financeiro. Posso ajudar com análises, investimentos e planejamento financeiro. Como posso ajudar?"
                rows={3}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="webhookName">Nome do Webhook (Opcional)</Label>
              <Input
                id="webhookName"
                name="webhookName"
                value={formData.webhookName || ''}
                onChange={handleInputChange}
                placeholder="Ex: Agente Financeiro"
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
                disabled={createAgentMutation.isPending || updateAgentMutation.isPending}
              >
                {isEditing 
                  ? (updateAgentMutation.isPending ? 'Salvando...' : 'Salvar Alterações') 
                  : (createAgentMutation.isPending ? 'Criando...' : 'Criar Agente')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}