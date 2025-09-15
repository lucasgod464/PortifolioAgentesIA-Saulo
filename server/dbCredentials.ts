import fs from 'fs/promises';
import path from 'path';
import type { DbConfig, DbConfigMasked } from '@shared/schema';

// Arquivo onde as credenciais serão armazenadas (sem criptografia)
const CREDENTIALS_FILE = path.join(process.cwd(), '.db-credentials.json');

interface StoredCredentials {
  data: DbConfig;
  version: string;
}

/**
 * Salva as credenciais no arquivo (preserva senha existente se não fornecida)
 */
export async function saveDbCredentials(credentials: DbConfig): Promise<void> {
  try {
    let finalCredentials = credentials;
    
    // Se não há senha fornecida, preserva a senha existente
    if (!credentials.password) {
      const existingCredentials = await loadDbCredentials();
      if (existingCredentials?.password) {
        finalCredentials = {
          ...credentials,
          password: existingCredentials.password
        };
      } else {
        throw new Error('Senha é obrigatória na primeira configuração');
      }
    }
    
    const storedData: StoredCredentials = {
      data: finalCredentials,
      version: '1.0'
    };
    
    await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(storedData, null, 2));
    console.log('✅ Credenciais de banco salvas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar credenciais:', error);
    throw new Error('Falha ao salvar credenciais do banco de dados');
  }
}

/**
 * Carrega as credenciais do arquivo
 */
export async function loadDbCredentials(): Promise<DbConfig | null> {
  try {
    const fileContent = await fs.readFile(CREDENTIALS_FILE, 'utf8');
    const storedData: StoredCredentials = JSON.parse(fileContent);
    
    console.log('✅ Credenciais de banco carregadas com sucesso');
    return storedData.data;
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.log('ℹ️ Arquivo de credenciais não encontrado. Usando configurações de ambiente padrão.');
      return null;
    }
    
    console.error('❌ Erro ao carregar credenciais:', error);
    throw new Error('Falha ao carregar credenciais do banco de dados');
  }
}

/**
 * Verifica se existem credenciais salvas
 */
export async function hasStoredCredentials(): Promise<boolean> {
  try {
    await fs.access(CREDENTIALS_FILE);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retorna configurações mascaradas para a API (sem expor a senha)
 */
export async function getMaskedDbConfig(): Promise<DbConfigMasked | null> {
  try {
    const credentials = await loadDbCredentials();
    if (!credentials) {
      return null;
    }
    
    return {
      host: credentials.host,
      port: credentials.port,
      user: credentials.user,
      database: credentials.database,
      sessionTable: credentials.sessionTable,
      passwordMasked: true
    };
  } catch (error) {
    console.error('Erro ao obter configurações mascaradas:', error);
    return null;
  }
}

/**
 * Gera a DATABASE_URL a partir das credenciais
 */
export function buildDatabaseUrl(credentials: DbConfig): string {
  const { host, port, user, password, database } = credentials;
  return `postgres://${user}:${password}@${host}:${port}/${database}?sslmode=disable`;
}

/**
 * Remove as credenciais salvas
 */
export async function removeDbCredentials(): Promise<void> {
  try {
    await fs.unlink(CREDENTIALS_FILE);
    console.log('✅ Credenciais removidas com sucesso');
  } catch (error) {
    if ((error as any).code !== 'ENOENT') {
      console.error('❌ Erro ao remover credenciais:', error);
      throw error;
    }
  }
}