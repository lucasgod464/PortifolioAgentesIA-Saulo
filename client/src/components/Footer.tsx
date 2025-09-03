import React from "react";
import styled from "styled-components";
import { useLogoFromEnv, useWhatsAppLink } from "../hooks/use-env-config";

const FooterSection = styled.footer`
  position: relative;
  z-index: 10;
  padding: 3rem 1rem;
  background-color: rgba(15, 23, 42, 0.8);
  border-top: 1px solid rgba(139, 92, 246, 0.2);

  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }

  @media (min-width: 1024px) {
    padding: 3rem 4rem;
  }
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const LogoIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: linear-gradient(to bottom right, #6b46c1, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const LogoImage = styled.img`
  width: 250px;
  height: 100px;
  object-fit: contain;
  padding: 5px;
  border-radius: 5px;
`;

const LogoText = styled.h3`
  font-size: 1.5rem;
  color: white;
  font-family: "Audiowide", cursive;

  span {
    color: #a78bfa;
  }
`;

const FooterText = styled.p`
  color: #9ca3af;
  margin-bottom: 2.5rem;
  max-width: 600px;
`;

const BottomBar = styled.div`
  padding-top: 2rem;
  border-top: 1px solid #374151;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const Copyright = styled.div`
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (min-width: 640px) {
    justify-content: flex-start;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  @media (min-width: 640px) {
    margin-top: 0;
  }
`;

const SocialLink = styled.a`
  color: #6b7280;
  transition: color 0.3s ease;
  font-size: 1.125rem;

  &:hover {
    color: #c4b5fd;
  }
`;

const BottomLinks = styled.div`
  margin-top: 1rem;

  @media (min-width: 640px) {
    margin-top: 0;
  }
`;

const BottomLink = styled.a`
  color: #6b7280;
  transition: color 0.3s ease;
  margin-right: 1.5rem;

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    color: #c4b5fd;
  }
`;

const Footer: React.FC = () => {
  // Usa o hook customizado para obter a URL do logo da variável de ambiente
  const logoUrl = useLogoFromEnv();
  
  // Usa o hook customizado para obter o link do WhatsApp da variável de ambiente
  const whatsappLink = useWhatsAppLink();

  // Obtém o ano atual para o copyright
  const currentYear = new Date().getFullYear();

  return (
    <FooterSection>
      <FooterContainer>
        <LogoContainer>
          {logoUrl ? (
            // Se houver uma URL de logo definida, exibe a imagem
            (<LogoImage src={logoUrl} alt="Logo" />)
          ) : (
            // Fallback: exibe o logo padrão se a variável de ambiente não estiver definida
            (<>
              <LogoIcon>
                <i className="fas fa-brain"></i>
              </LogoIcon>
              <LogoText>
                Nexus<span>AI</span>
              </LogoText>
            </>)
          )}
        </LogoContainer>
        <FooterText>
          Transformando empresas através da inteligência artificial avançada e
          agentes especializados.
        </FooterText>

        <BottomBar>
          <Copyright>
            <span className="font-normal">© {currentYear} NexusAI. Tod os os direitos reservados.</span>
            <SocialLinks>
              <SocialLink href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </SocialLink>
              <SocialLink href="#" aria-label="Linkedin">
                <i className="fab fa-linkedin"></i>
              </SocialLink>
              <SocialLink href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </SocialLink>
              <SocialLink href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <i className="fab fa-whatsapp"></i>
              </SocialLink>
            </SocialLinks>
          </Copyright>
          <BottomLinks>
            <BottomLink href="#">Política de Privacidade</BottomLink>
            <BottomLink href="#">Termos de Uso</BottomLink>
          </BottomLinks>
        </BottomBar>
      </FooterContainer>
    </FooterSection>
  );
};

export default Footer;
