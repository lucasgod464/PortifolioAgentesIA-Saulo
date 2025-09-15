import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import type { DbConfig, DbConfigMasked } from '@shared/schema';

const scryptAsync = promisify(scrypt);

// Arquivo onde as credenciais criptografadas serão armazenadas
const CREDENTIALS_FILE = path.join(process.cwd(), '.db-credentials.enc');

interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
  salt: string;
}

interface StoredCredentials {
  data: EncryptedData;
  version: string;
}

/**
 * Deriva uma chave de criptografia a partir da MASTER_KEY
 */
async function deriveKey(masterKey: string, salt: Buffer): Promise<Buffer> {
  return (await scryptAsync(masterKey, salt, 32)) as Buffer;
}

/**
 * Criptografa as credenciais do banco usando AES-256-GCM
 */
async function encryptCredentials(credentials: DbConfig, masterKey: string): Promise<EncryptedData> {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKey(masterKey, salt);
  
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  const plaintext = JSON.stringify(credentials);
  
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    ciphertext,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    salt: salt.toString('hex')
  };
}

/**
 * Descriptografa as credenciais do banco
 */
async function decryptCredentials(encryptedData: EncryptedData, masterKey: string): Promise<DbConfig> {
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const tag = Buffer.from(encryptedData.tag, 'hex');
  const salt = Buffer.from(encryptedData.salt, 'hex');
  
  try {
    // Deriva a chave usando o salt armazenado
    const key = await deriveKey(masterKey, salt);
    
    // Descriptografa com a chave derivada
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    const credentials = JSON.parse(decrypted);
    return credentials as DbConfig;
  } catch (error) {
    throw new Error('Falha ao descriptografar credenciais: chave master inválida ou dados corrompidos');
  }
}

/**
 * Salva as credenciais criptografadas no arquivo
 */
export async function saveDbCredentials(credentials: DbConfig): Promise<void> {
  const masterKey = process.env.MASTER_KEY;
  if (!masterKey) {
    throw new Error('MASTER_KEY não definida. Defina a variável de ambiente MASTER_KEY para salvar credenciais.');
  }
  
  try {
    const encryptedData = await encryptCredentials(credentials, masterKey);
    const storedData: StoredCredentials = {
      data: encryptedData,
      version: '1.0'
    };
    
    await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(storedData, null, 2));
    console.log('✅ Credenciais de banco salvas com segurança');
  } catch (error) {
    console.error('❌ Erro ao salvar credenciais:', error);
    throw new Error('Falha ao salvar credenciais do banco de dados');
  }
}

/**
 * Carrega e descriptografa as credenciais do arquivo
 */
export async function loadDbCredentials(): Promise<DbConfig | null> {
  const masterKey = process.env.MASTER_KEY;
  if (!masterKey) {
    console.warn('⚠️ MASTER_KEY não definida. Usando configurações de ambiente padrão.');
    return null;
  }
  
  try {
    const fileContent = await fs.readFile(CREDENTIALS_FILE, 'utf8');
    const storedData: StoredCredentials = JSON.parse(fileContent);
    
    const credentials = await decryptCredentials(storedData.data, masterKey);
    console.log('✅ Credenciais de banco carregadas com sucesso');
    return credentials;
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