import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import lamejs from "lamejs";
import TypingIndicatorComponent from "./TypingIndicator";
import AudioPlayer from "./AudioPlayer";
import { useWebhookUrl, useSessionId } from "../hooks/use-env-config";

// Singleton para gerenciar o estado global do modal
export class ChatModalManager {
  private static instance: ChatModalManager;
  private isOpen: boolean = false;
  private agentName: string = "";
  private agentIcon: string = "";
  private listeners: Function[] = [];

  private constructor() {}

  static getInstance(): ChatModalManager {
    if (!ChatModalManager.instance) {
      ChatModalManager.instance = new ChatModalManager();
    }
    return ChatModalManager.instance;
  }

  openModal(agentName: string, agentIcon: string): void {
    this.isOpen = true;
    this.agentName = agentName;
    this.agentIcon = agentIcon;
    this.notifyListeners();
  }

  closeModal(): void {
    this.isOpen = false;
    this.notifyListeners();
  }

  getState(): { isOpen: boolean; agentName: string; agentIcon: string } {
    return {
      isOpen: this.isOpen,
      agentName: this.agentName,
      agentIcon: this.agentIcon,
    };
  }

  subscribe(listener: Function): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }
}

// Hook para usar o gerenciador de modal
export function useChatModal() {
  const [state, setState] = useState<{
    isOpen: boolean;
    agentName: string;
    agentIcon: string;
  }>({
    isOpen: false,
    agentName: "",
    agentIcon: "",
  });

  useEffect(() => {
    const modalManager = ChatModalManager.getInstance();
    setState(modalManager.getState());

    const unsubscribe = modalManager.subscribe((newState: any) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const openModal = (agentName: string, agentIcon: string) => {
    ChatModalManager.getInstance().openModal(agentName, agentIcon);
  };

  const closeModal = () => {
    ChatModalManager.getInstance().closeModal();
  };

  return {
    ...state,
    openModal,
    closeModal,
  };
}

// Componentes UI para o modal
const zoomInBounce = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  background: rgba(22, 27, 58, 0.95);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(139, 92, 246, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(to right, #1e3a8a, #1a2151);
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
`;

const AgentAvatar = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(to bottom right, #6b46c1, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 1rem;
  font-size: 1.25rem;
`;

const AgentInfo = styled.div`
  flex: 1;
`;

const AgentName = styled.h3`
  margin: 0;
  color: white;
  font-size: 1.125rem;
`;

const AgentStatus = styled.p`
  margin: 0;
  color: #a5b4fc;
  font-size: 0.875rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  padding: 8px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  position: relative;
  z-index: 10;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ChatArea = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 300px;
  max-height: 50vh;
  background-image: linear-gradient(
      rgba(22, 27, 58, 0.95),
      rgba(22, 27, 58, 0.95)
    ),
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 50 L70 30 L50 10 L30 30 Z' fill='%236b46c1' fill-opacity='0.05'/%3E%3C/svg%3E");
`;

const MessageWrapper = styled.div<{ $isUser: boolean }>`
  align-self: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
`;

const BubbleContainer = styled.div<{ $isUser: boolean }>`
  max-width: 80%;
  width: auto;
  padding: 0.75rem 1.25rem; /* Aumentado o padding horizontal para 1.25rem (20px) */
  border-radius: 1.5rem;
  background: ${(props) =>
    props.$isUser
      ? "linear-gradient(120deg, #6b46c1, #3a6bd3)"
      : "rgba(45, 55, 72, 0.7)"};
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 250px; /* Largura mínima para acomodar o player de áudio */

  /* Removendo a ponta de balão para deixar mais limpo como na imagem */
  /*
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 0.5rem solid transparent;
    ${(props) =>
    props.$isUser
      ? "border-left-color: #3a6bd3; right: -0.75rem; top: 50%; transform: translateY(-50%);"
      : "border-right-color: rgba(45, 55, 72, 0.7); left: -0.75rem; top: 50%; transform: translateY(-50%);"}
  }
  */
`;

const MessageTime = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 0.5rem;
  align-self: flex-end;
`;

const InputArea = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.7);
  gap: 0.75rem;
  border-top: 1px solid rgba(139, 92, 246, 0.2);

  @media (max-width: 480px) {
    padding: 0.75rem;
    gap: 0.5rem;
  }
`;

const ChatInput = styled.input`
  flex: 1;
  background: rgba(45, 55, 72, 0.7);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 1.5rem;
  padding: 0.75rem 1.25rem;
  color: white;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: rgba(139, 92, 246, 0.6);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(to right, #6b46c1, #2563eb);
  border: none;
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0; /* Impede que os botões sejam comprimidos */
  min-width: 2.5rem; /* Garante largura mínima */

  &:hover {
    transform: scale(1.1);
  }

  /* Responsividade para mobile */
  @media (max-width: 480px) {
    width: 2.75rem;
    height: 2.75rem;
    min-width: 2.75rem;
    font-size: 0.95rem;
  }

  /* Para telas muito pequenas */
  @media (max-width: 360px) {
    width: 2.5rem;
    height: 2.5rem;
    min-width: 2.5rem;
    font-size: 0.9rem;
  }
`;

const SendButton = styled(ActionButton)``;

const RecordButton = styled(ActionButton)<{ $isRecording?: boolean }>`
  background: ${(props) =>
    props.$isRecording
      ? "linear-gradient(to right, #e11d48, #f43f5e)"
      : "linear-gradient(to right, #4f46e5, #6366f1)"};
  animation: ${(props) => (props.$isRecording ? "pulse 2s infinite" : "none")};

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(229, 62, 62, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(229, 62, 62, 0);
    }
  }
`;

const RecordingTime = styled.div`
  position: absolute;
  bottom: 4.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(22, 27, 58, 0.9);
  color: white;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(139, 92, 246, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
  z-index: 5;
  animation: recordingPulse 2s infinite ease-in-out;

  &::before {
    content: "";
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #f43f5e;
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes recordingPulse {
    0%, 100% {
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
    }
    50% {
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.4);
    }
  }
`;

// Removidos estilos duplicados - usando componentes externos

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  time: string;
  createdAt: number;
  type?: "audio" | "image" | "document" | "video" | "text";
}

// Renderizador de conteúdo baseado no tipo da mensagem
interface MessageContentProps {
  message: Message;
}

const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
  const { text, type } = message;

  switch (type) {
    case "image":
      return (
        <div className="message-content-image">
          <img
            src={text}
            alt="Imagem enviada"
            style={{
              maxWidth: "100%",
              borderRadius: "0.5rem",
              marginBottom: "0.5rem",
            }}
          />
        </div>
      );

    case "audio":
      // O tempo de gravação estará na mensagem no formato "data:audio/mp3;base64,XXX|duration:MM:SS"
      let audioDuration = "";
      if (text.includes("|duration:")) {
        const parts = text.split("|duration:");
        audioDuration = parts[1] || "";
      }
      return (
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
          <AudioPlayer
            src={text.split("|duration:")[0]}
            duration={audioDuration}
          />
        </div>
      );

    case "video":
      return (
        <div className="message-content-video">
          <video
            controls
            src={text}
            style={{
              maxWidth: "100%",
              borderRadius: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            Seu navegador não suporta o elemento de vídeo.
          </video>
        </div>
      );

    case "document":
      return (
        <div className="message-content-document">
          <a
            href={text}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              textDecoration: "none",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <i
              className="fas fa-file-alt"
              style={{ marginRight: "0.5rem" }}
            ></i>
            Abrir documento
          </a>
        </div>
      );

    case "text":
    default:
      return <div className="message-content-text">{text}</div>;
  }
};

// Hook para gravar áudio
const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  // Flag para indicar se o áudio foi descartado
  const [isDiscarded, setIsDiscarded] = useState(false);

  // Referência para a função de configuração de audioBase64
  const audioBase64Setter = useRef(setAudioBase64);
  // Referência para a função de configuração de isDiscarded
  const isDiscardedSetter = useRef(setIsDiscarded);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Função para iniciar a gravação
  const startRecording = async () => {
    try {
      // Limpa os dados anteriores
      audioChunksRef.current = [];
      setAudioBase64(null);
      setRecordingTime(0);

      // Solicita permissão para acessar o microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Configura o MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Configura os listeners
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Quando a gravação for interrompida, converta o áudio para MP3 e base64
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        convertBlobToBase64(audioBlob).then((base64) => {
          setAudioBase64(base64);
        });

        // Interrompe todos os tracks de áudio
        stream.getTracks().forEach((track) => track.stop());
      };

      // Inicia a gravação
      mediaRecorder.start();
      setIsRecording(true);

      // Configura o timer para atualizar o tempo de gravação
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Erro ao iniciar a gravação:", error);
      alert(
        "Não foi possível acessar o microfone. Verifique as permissões do navegador.",
      );
    }
  };

  // Função para interromper a gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Limpa o timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Função para comprimir áudio para MP3 usando lamejs e convertê-lo para base64
  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Converte o blob para array buffer para processamento
      blob
        .arrayBuffer()
        .then((buffer) => {
          // Converte o buffer para AudioContext para processamento
          const audioContext = new AudioContext();
          return audioContext.decodeAudioData(buffer);
        })
        .then((audioBuffer) => {
          // Obtem os dados de áudio como Float32Array
          const samples = audioBuffer.getChannelData(0);

          // Parâmetros de compressão MP3
          const sampleRate = audioBuffer.sampleRate;
          const bitRate = 96; // Taxa de bits menor (kbps) para melhor compressão

          // Cria o encoder MP3
          const mp3Encoder = new lamejs.Mp3Encoder(1, sampleRate, bitRate);

          // Processa o áudio em blocos para melhor memória
          const blockSize = 1152; // Tamanho recomendado para frames MP3
          const mp3Data = [];

          // Converte Float32Array para Int16Array que o lamejs pode processar
          const samples16 = new Int16Array(samples.length);
          for (let i = 0; i < samples.length; i++) {
            // Normaliza os valores de -1.0,1.0 para -32768,32767
            samples16[i] =
              samples[i] < 0
                ? Math.max(-1, samples[i]) * 0x8000
                : Math.min(1, samples[i]) * 0x7fff;
          }

          // Processa o áudio em blocos
          for (let i = 0; i < samples16.length; i += blockSize) {
            const blockSamples = samples16.subarray(i, i + blockSize);
            const mp3Buffer = mp3Encoder.encodeBuffer(blockSamples);
            if (mp3Buffer.length > 0) {
              mp3Data.push(mp3Buffer);
            }
          }

          // Adiciona o frame de finalização
          const mp3Finish = mp3Encoder.flush();
          if (mp3Finish.length > 0) {
            mp3Data.push(mp3Finish);
          }

          // Combina todos os blocos MP3 em um único Uint8Array
          const mp3DataLength = mp3Data.reduce(
            (total, buffer) => total + buffer.length,
            0,
          );
          const mp3Complete = new Uint8Array(mp3DataLength);
          let offset = 0;
          for (let buffer of mp3Data) {
            mp3Complete.set(buffer, offset);
            offset += buffer.length;
          }

          // Cria um novo Blob MP3
          const mp3Blob = new Blob([mp3Complete], { type: "audio/mp3" });

          // Converte para base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove o prefixo 'data:audio/mp3;base64,' para obter apenas o base64
            const base64 = base64String.split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(mp3Blob);
        })
        .catch((error) => {
          console.error("Erro ao processar áudio:", error);

          // Fallback para o método original sem compressão se ocorrer um erro
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            const base64 = base64String.split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
    });
  };

  // Formata o tempo de gravação (segundos) para MM:SS
  const formatRecordingTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Função para descartar a gravação sem processar o áudio
  const discardRecording = () => {
    if (isRecording && mediaRecorderRef.current) {
      try {
        // Substitui o evento onstop original por uma função vazia
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => {
            console.log("Áudio descartado - onstop customizado");
          };
        }

        // Interrompe a gravação
        mediaRecorderRef.current.stop();

        // Interrompe todos os tracks de áudio
        const stream = mediaRecorderRef.current.stream;
        stream.getTracks().forEach((track) => track.stop());

        // Define o estado de gravação como falso
        setIsRecording(false);

        // Limpa o timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Limpa os dados de áudio sem disparar o callback
        audioChunksRef.current = [];

        // Não setamos audioBase64 para evitar o efeito

        // Reset o tempo de gravação
        setRecordingTime(0);

        // Limpa a referência do mediaRecorder
        mediaRecorderRef.current = null;

        console.log("Gravação descartada com sucesso");
      } catch (error) {
        console.error("Erro ao descartar gravação:", error);
      }
    }
  };

  return {
    isRecording,
    recordingTime,
    formattedTime: formatRecordingTime(recordingTime),
    audioBase64,
    isDiscarded,
    setIsDiscarded,
    startRecording,
    stopRecording,
    discardRecording,
  };
};

// Componente principal GlobalChatModal
const GlobalChatModal: React.FC = () => {
  const { isOpen, agentName, agentIcon, closeModal } = useChatModal();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(1);
  const webhookUrl = useWebhookUrl();
  const sessionId = useSessionId();

  // Estado para gravar áudio
  const {
    isRecording,
    recordingTime,
    formattedTime,
    audioBase64,
    isDiscarded,
    setIsDiscarded,
    startRecording,
    stopRecording,
    discardRecording,
  } = useAudioRecorder();

  // Reseta as mensagens e adiciona a mensagem inicial quando o modal é aberto
  useEffect(() => {
    if (isOpen && agentName) {
      setMessages([
        {
          id: 1,
          text: `Olá! Eu sou o assistente virtual para ${agentName}. Como posso ajudar você hoje?`,
          isUser: false,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: Date.now(),
          type: "text",
        },
      ]);
      messageIdCounter.current = 2;
    }
  }, [isOpen, agentName]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Função para converter nomes para um formato URL amigável
  const slugifyAgentName = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
      .replace(/\s+/g, "-") // Substitui espaços por hífens
      .replace(/-+/g, "-") // Remove múltiplos hífens
      .replace(/^-+|-+$/g, ""); // Remove hífens no início e fim
  };

  // Função para enviar áudio
  const handleSendAudio = () => {
    if (!audioBase64) return;

    // Adiciona mensagem do usuário (áudio) com a duração
    const newUserMessage: Message = {
      id: messageIdCounter.current++,
      text: `data:audio/mp3;base64,${audioBase64}|duration:${formattedTime}`,
      isUser: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: Date.now(),
      type: "audio",
    };

    setMessages((prev) => [...prev, newUserMessage]);

    // Ativa o indicador de digitação
    setIsTyping(true);

    // Prepara o payload para o webhook
    const webhookPayload = {
      agent: slugifyAgentName(agentName),
      message: audioBase64,
      typeMessage: "audio",
      sessionId: sessionId,
    };

    console.log("Enviando mensagem de áudio com sessionId:", sessionId);

    // Envia requisição HTTP POST para o webhook
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log("Webhook response data (audio):", responseData);

        // Extrai as mensagens da estrutura aninhada
        let messages: Array<{
          message: string;
          typeMessage: "audio" | "image" | "document" | "video" | "text";
        }> = [];

        // Analisando o formato real do response com logs
        console.log("Tipo de responseData (audio):", typeof responseData);
        if (typeof responseData === "object" && responseData !== null) {
          console.log(
            "Propriedades de responseData (audio):",
            Object.keys(responseData),
          );
        }

        // Tenta extrair mensagens de todos os formatos possíveis
        if (Array.isArray(responseData) && responseData.length > 0) {
          // Formato 1: [{messages: [{message, typeMessage}, ...]}]
          if (
            responseData[0]?.messages &&
            Array.isArray(responseData[0].messages)
          ) {
            messages = responseData[0].messages;
            console.log("Formato 1 detectado (audio):", messages);
          }
          // Formato 2: [{message, typeMessage}, ...]
          else if (responseData[0]?.message && responseData[0]?.typeMessage) {
            messages = responseData;
            console.log("Formato 2 detectado (audio):", messages);
          }
        }
        // Formato 3: {messages: [{message, typeMessage}, ...]}
        else if (
          responseData?.messages &&
          Array.isArray(responseData.messages)
        ) {
          messages = responseData.messages;
          console.log("Formato 3 detectado (audio):", messages);
        }

        // Processa cada mensagem da resposta com delay entre elas
        if (messages.length > 0) {
          console.log("Mensagens processadas (audio):", messages);

          // Função para adicionar mensagens sequencialmente com delay
          const addMessagesWithDelay = (
            msgs: typeof messages,
            index: number,
          ) => {
            if (index >= msgs.length) {
              return;
            }

            // Verifica se é a última mensagem
            const isLastMessage = index === msgs.length - 1;

            // Se for a última mensagem, desativa o indicador ANTES de exibi-la
            if (isLastMessage) {
              setIsTyping(false);
            }

            const item = msgs[index];
            const newAgentMessage: Message = {
              id: messageIdCounter.current++,
              text: item.message,
              isUser: false,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              createdAt: Date.now(),
              type: item.typeMessage,
            };

            setMessages((prev) => [...prev, newAgentMessage]);

            // Agenda a próxima mensagem com delay de 2 segundos
            setTimeout(() => {
              addMessagesWithDelay(msgs, index + 1);
            }, 2000);
          };

          // Inicia o processo com a primeira mensagem
          addMessagesWithDelay(messages, 0);
        } else {
          // Fallback para quando não há resposta do webhook ou formato é inválido
          console.log(
            "Usando mensagem fallback (audio) - formato de resposta não reconhecido",
          );
          const fallbackMessage: Message = {
            id: messageIdCounter.current++,
            text: `Recebi seu áudio e estou processando. Como posso ajudar você com ${agentName}?`,
            isUser: false,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            createdAt: Date.now(),
            type: "text",
          };

          setMessages((prev) => [...prev, fallbackMessage]);
          // Desativa o indicador de digitação para a mensagem fallback
          setIsTyping(false);
        }
      })
      .catch((error) => {
        console.error("Erro ao enviar áudio para o webhook:", error);
        // Mensagem de erro
        const errorMessage: Message = {
          id: messageIdCounter.current++,
          text: `Desculpe, tivemos um problema ao processar seu áudio. Por favor, tente novamente.`,
          isUser: false,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: Date.now(),
          type: "text",
        };
        setMessages((prev) => [...prev, errorMessage]);
        // Desativa o indicador de digitação em caso de erro
        setIsTyping(false);
      });
  };

  // Função para lidar com audioBase64 quando disponível
  const processAudio = () => {
    if (audioBase64 && !isDiscarded) {
      handleSendAudio();
    }
  };

  // Efeito para enviar o áudio quando estiver disponível
  useEffect(() => {
    processAudio();
  }, [audioBase64, isDiscarded]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    // Adiciona mensagem do usuário
    const newUserMessage: Message = {
      id: messageIdCounter.current++,
      text: inputValue,
      isUser: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: Date.now(),
      type: "text",
    };

    setMessages((prev) => [...prev, newUserMessage]);

    // Ativa o indicador de digitação
    setIsTyping(true);

    // Prepara o formato do payload para o webhook
    const webhookPayload = {
      agent: slugifyAgentName(agentName),
      message: inputValue,
      typeMessage: "text",
      sessionId: sessionId,
    };

    console.log("Enviando mensagem de texto com sessionId:", sessionId);

    // Envia requisição HTTP POST para o webhook
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log("Webhook response data:", responseData);

        // Extrai as mensagens da estrutura aninhada
        let messages: Array<{
          message: string;
          typeMessage: "audio" | "image" | "document" | "video" | "text";
        }> = [];

        // Analisando o formato real do response com logs
        console.log("Tipo de responseData:", typeof responseData);
        if (typeof responseData === "object" && responseData !== null) {
          console.log(
            "Propriedades de responseData:",
            Object.keys(responseData),
          );
        }

        // Tenta extrair mensagens de todos os formatos possíveis
        if (Array.isArray(responseData) && responseData.length > 0) {
          // Formato 1: [{messages: [{message, typeMessage}, ...]}]
          if (
            responseData[0]?.messages &&
            Array.isArray(responseData[0].messages)
          ) {
            messages = responseData[0].messages;
            console.log("Formato 1 detectado:", messages);
          }
          // Formato 2: [{message, typeMessage}, ...]
          else if (responseData[0]?.message && responseData[0]?.typeMessage) {
            messages = responseData;
            console.log("Formato 2 detectado:", messages);
          }
        }
        // Formato 3: {messages: [{message, typeMessage}, ...]}
        else if (
          responseData?.messages &&
          Array.isArray(responseData.messages)
        ) {
          messages = responseData.messages;
          console.log("Formato 3 detectado:", messages);
        }

        // Processa cada mensagem da resposta com delay entre elas
        if (messages.length > 0) {
          console.log("Mensagens processadas:", messages);

          // Função para adicionar mensagens sequencialmente com delay
          const addMessagesWithDelay = (
            msgs: typeof messages,
            index: number,
          ) => {
            if (index >= msgs.length) {
              return;
            }

            // Verifica se é a última mensagem
            const isLastMessage = index === msgs.length - 1;

            // Se for a última mensagem, desativa o indicador ANTES de exibi-la
            if (isLastMessage) {
              setIsTyping(false);
            }

            const item = msgs[index];
            const newAgentMessage: Message = {
              id: messageIdCounter.current++,
              text: item.message,
              isUser: false,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              createdAt: Date.now(),
              type: item.typeMessage,
            };

            setMessages((prev) => [...prev, newAgentMessage]);

            // Agenda a próxima mensagem com delay de 2 segundos
            setTimeout(() => {
              addMessagesWithDelay(msgs, index + 1);
            }, 2000);
          };

          // Inicia o processo com a primeira mensagem
          addMessagesWithDelay(messages, 0);
        } else {
          // Fallback para quando não há resposta do webhook ou formato é inválido
          console.log(
            "Usando mensagem fallback - formato de resposta não reconhecido",
          );
          const fallbackMessage: Message = {
            id: messageIdCounter.current++,
            text: `Como posso ajudar você com ${agentName}?`,
            isUser: false,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            createdAt: Date.now(),
            type: "text",
          };

          setMessages((prev) => [...prev, fallbackMessage]);
          // Desativa o indicador de digitação para a mensagem fallback
          setIsTyping(false);
        }
      })
      .catch((error) => {
        console.error("Erro ao enviar para o webhook:", error);
        // Mensagem de erro caso a requisição falhe
        const errorMessage: Message = {
          id: messageIdCounter.current++,
          text: `Desculpe, estamos com dificuldades técnicas. Por favor, tente novamente mais tarde.`,
          isUser: false,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: Date.now(),
          type: "text",
        };
        setMessages((prev) => [...prev, errorMessage]);
        // Desativa o indicador de digitação em caso de erro
        setIsTyping(false);
      });

    setInputValue("");
  };

  // Handlers para fechar o modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      console.log("Fechando modal via clique outside");
      closeModal();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      console.log("Fechando modal via ESC");
      closeModal();
    }
  };

  const handleCloseButtonClick = (e: React.MouseEvent) => {
    console.log("Fechando modal via botão X");
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };

  return (
    <ModalOverlay
      $isOpen={isOpen}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      className="fade-in"
    >
      <ModalContainer
        className="zoom-in-bounce"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <AgentAvatar>
            <i className={agentIcon}></i>
          </AgentAvatar>
          <AgentInfo>
            <AgentName>{agentName}</AgentName>
            <AgentStatus>Online agora</AgentStatus>
          </AgentInfo>
          <CloseButton onClick={handleCloseButtonClick}>×</CloseButton>
        </ModalHeader>

        <ChatArea>
          {messages.map((message) => (
            <MessageWrapper
              key={`${message.id}-${message.createdAt}`}
              $isUser={message.isUser}
              className="zoom-in-bounce"
            >
              <BubbleContainer $isUser={message.isUser}>
                <MessageContent message={message} />
                <MessageTime>{message.time}</MessageTime>
              </BubbleContainer>
            </MessageWrapper>
          ))}

          {/* Indicador de digitação */}
          {isTyping && <TypingIndicatorComponent />}

          <div ref={messagesEndRef} />
        </ChatArea>

        <InputArea>
          {isRecording && <RecordingTime>{formattedTime}</RecordingTime>}

          <ChatInput
            type="text"
            placeholder="Digite sua mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isRecording}
          />

          {/* Botão de gravação/descarte */}
          <RecordButton
            onClick={isRecording ? discardRecording : startRecording}
            $isRecording={isRecording}
            title={isRecording ? "Descartar gravação" : "Gravar áudio"}
          >
            <i
              className={isRecording ? "fas fa-trash" : "fas fa-microphone"}
            ></i>
          </RecordButton>

          {/* Botão de envio - agora também interrompe e envia o áudio se estiver gravando */}
          <SendButton
            onClick={isRecording ? stopRecording : handleSendMessage}
            disabled={!isRecording && inputValue.trim() === ""}
            title={isRecording ? "Enviar áudio" : "Enviar mensagem"}
          >
            <i className="fas fa-paper-plane"></i>
          </SendButton>
        </InputArea>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default GlobalChatModal;
