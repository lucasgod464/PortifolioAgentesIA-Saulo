import React from "react";
import styled from "styled-components";
import { useLogoFromEnv, useLogoLinkFromEnv } from "../hooks/use-env-config";

const HeaderContainer = styled.header`
  position: relative;
  z-index: 10;
  padding: 1.5rem 1rem;

  @media (min-width: 768px) {
    padding: 1.5rem 2rem;
  }

  @media (min-width: 1024px) {
    padding: 1.5rem 4rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const LogoLink = styled.a`
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const LogoText = styled.h1`
  font-size: 1.5rem;

  @media (min-width: 768px) {
    font-size: 1.875rem;
  }

  color: white;
  font-family: "Audiowide", cursive;

  span {
    color: #a78bfa;
  }
`;

// O hook useLogoFromEnv foi movido para client/src/hooks/use-env-config.ts

const Header: React.FC = () => {
  const logoUrl = useLogoFromEnv();
  const logoLink = useLogoLinkFromEnv();

  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoContainer>
          {logoUrl ? (
            // Se houver uma URL de logo definida, exibe a imagem clicável
            <LogoLink href={logoLink} data-testid="logo-link">
              <LogoImage src={logoUrl} alt="Logo" />
            </LogoLink>
          ) : (
            // Fallback: exibe o logo padrão clicável se a variável de ambiente não estiver definida
            <LogoLink href={logoLink} data-testid="logo-link">
              <LogoIcon>
                <i className="fas fa-brain"></i>
              </LogoIcon>
              <LogoText>
                Nexus<span>AI</span>
              </LogoText>
            </LogoLink>
          )}
        </LogoContainer>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
