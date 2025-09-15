import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Database, CheckCircle2, Shield, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from '@/components/admin/AdminLayout';

// Schema para validação do formulário
const dbConfigFormSchema = z.object({
  host: z.string().min(1, "Host é obrigatório"),
  port: z.number().int().min(1).max(65535, "Porta deve estar entre 1 e 65535"),
  user: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().optional(),
  database: z.string().min(1, "Nome do banco é obrigatório"),
  sessionTable: z.string().min(1, "Tabela de sessão é obrigatória"),
});

type DbConfigForm = z.infer<typeof dbConfigFormSchema>;

interface DbConfigMasked {
  host: string;
  port: number;
  user: string;
  database: string;
  sessionTable: string;
  passwordMasked: boolean;
}

export default function DbConfigPage() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Busca configurações atuais (mascaradas)
  const { data: currentConfig, isLoading } = useQuery<DbConfigMasked>({
    queryKey: ["/api/admin/db-config"],
    retry: false,
  });

  // Form principal para configuração de banco
  const form = useForm<DbConfigForm>({
    resolver: zodResolver(dbConfigFormSchema),
    defaultValues: {
      host: currentConfig?.host || "",
      port: currentConfig?.port || 5432,
      user: currentConfig?.user || "",
      password: "", // Sempre vazio por segurança
      database: currentConfig?.database || "",
      sessionTable: currentConfig?.sessionTable || "session",
    },
  });


  // Atualiza valores do form quando carrega configurações
  if (currentConfig && !form.formState.isDirty) {
    form.reset({
      host: currentConfig.host,
      port: currentConfig.port,
      user: currentConfig.user,
      password: "", // Sempre vazio
      database: currentConfig.database,
      sessionTable: currentConfig.sessionTable,
    });
  }

  // Mutation para testar conexão
  const testConnectionMutation = useMutation({
    mutationFn: async (data: DbConfigForm) => {
      const response = await apiRequest("POST", "/api/admin/db-config/test", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setConnectionTestResult({ success: true, message: data.message });
      toast({
        title: "✅ Conexão bem-sucedida!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      const message = error.details || error.message || "Falha na conexão";
      setConnectionTestResult({ success: false, message });
      toast({
        title: "❌ Falha na conexão",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Mutation para salvar configurações
  const saveConfigMutation = useMutation({
    mutationFn: async (data: DbConfigForm) => {
      const response = await apiRequest("PUT", "/api/admin/db-config", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Configurações salvas!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/db-config"] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro ao salvar",
        description: error.message || "Falha ao salvar configurações",
        variant: "destructive",
      });
    },
  });

  // Testa a conexão
  const handleTestConnection = async (data: DbConfigForm) => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    try {
      await testConnectionMutation.mutateAsync(data);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Salva as configurações diretamente
  const handleSaveConfig = async (data: DbConfigForm) => {
    await saveConfigMutation.mutateAsync(data);
  };

  // Preview da DATABASE_URL
  const formValues = form.watch();
  const databaseUrl = formValues.host && formValues.port && formValues.user && formValues.password && formValues.database
    ? `postgres://${formValues.user}:${"*".repeat(formValues.password.length)}@${formValues.host}:${formValues.port}/${formValues.database}?sslmode=disable`
    : "";

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Database className="h-6 w-6 text-cyan-500" />
            <h1 className="text-2xl font-bold">Configurações do Banco de Dados</h1>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                <span className="ml-2">Carregando configurações...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Database className="h-6 w-6 text-cyan-500" />
          <h1 className="text-2xl font-bold">Configurações do Banco de Dados</h1>
        </div>

      {/* Aviso de segurança */}
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Configuração Segura</h3>
              <p className="text-sm text-amber-700">
                As credenciais são criptografadas e armazenadas com segurança. 
                Teste a conexão antes de salvar. Reinicialização do servidor será necessária.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Credenciais do Banco</span>
          </CardTitle>
          <CardDescription>
            Configure as credenciais de conexão com o banco de dados PostgreSQL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveConfig)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host do Banco</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ex: localhost" 
                          data-testid="input-db-host"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Porta</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5432" 
                          data-testid="input-db-port"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 5432)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="postgres" 
                          data-testid="input-db-user"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Senha 
                        {currentConfig?.passwordMasked && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (deixe vazio para manter atual)
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={currentConfig?.passwordMasked ? "••••••••" : "Senha do banco"}
                          data-testid="input-db-password"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="database"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Banco</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="postgres" 
                          data-testid="input-db-name"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sessionTable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tabela de Sessão</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="session" 
                          data-testid="input-session-table"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Preview da DATABASE_URL */}
              {databaseUrl && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Preview da DATABASE_URL:</h4>
                  <code className="text-sm text-gray-600 break-all" data-testid="preview-database-url">
                    {databaseUrl}
                  </code>
                </div>
              )}

              {/* Resultado do teste de conexão */}
              {connectionTestResult && (
                <div className={`p-4 rounded-lg flex items-start space-x-3 ${
                  connectionTestResult.success 
                    ? "bg-green-50 border border-green-200" 
                    : "bg-red-50 border border-red-200"
                }`}>
                  {connectionTestResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-medium ${
                      connectionTestResult.success ? "text-green-800" : "text-red-800"
                    }`}>
                      {connectionTestResult.success ? "Conexão bem-sucedida!" : "Falha na conexão"}
                    </h4>
                    <p className={`text-sm ${
                      connectionTestResult.success ? "text-green-700" : "text-red-700"
                    }`}>
                      {connectionTestResult.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={form.handleSubmit(handleTestConnection)}
                  disabled={isTestingConnection || testConnectionMutation.isPending}
                  data-testid="button-test-connection"
                  className="flex-1"
                >
                  {isTestingConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Testando...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>

                <Button
                  type="submit"
                  disabled={saveConfigMutation.isPending}
                  data-testid="button-save-config"
                  className="flex-1"
                >
                  {saveConfigMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      </div>
    </AdminLayout>
  );
}