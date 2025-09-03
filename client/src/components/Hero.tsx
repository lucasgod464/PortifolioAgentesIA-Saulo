import React from 'react';
import styled from 'styled-components';

const HeroSection = styled.section`
  position: relative;
  z-index: 10;
  padding: 3rem 1rem;
  
  @media (min-width: 768px) {
    padding: 5rem 2rem;
  }
  
  @media (min-width: 1024px) {
    padding: 5rem 4rem;
  }
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const HeroTitle = styled.h2`
  font-size: 2.25rem;
  line-height: 1.2;
  color: white;
  margin-bottom: 1.5rem;
  animation: float 6s ease-in-out infinite;
  font-family: 'Audiowide', cursive;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
  
  @media (min-width: 1024px) {
    font-size: 3.75rem;
  }
  
  span {
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    background-image: linear-gradient(90deg, 
      hsl(180, 100%, 50%) 0%,
      hsl(240, 100%, 60%) 50%,
      hsl(300, 100%, 60%) 100%
    );
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const HeroDescription = styled.p`
  color: #d1d5db;
  font-size: 1.125rem;
  max-width: 48rem;
  margin: 0 auto 2.5rem;
  
  @media (min-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  
  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const PrimaryButton = styled.a`
  display: inline-block;
  width: 100%;
  padding: 0.875rem 2rem;
  background: linear-gradient(90deg, 
    hsl(180, 100%, 50%) 0%,
    hsl(280, 100%, 60%) 100%
  );
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1.125rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  overflow: hidden;
  text-decoration: none;
  
  @media (min-width: 640px) {
    width: auto;
  }
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(transparent, rgba(139, 92, 246, 0.1), transparent);
    opacity: 0;
    transform: rotate(30deg);
    transition: opacity 0.3s ease;
    z-index: -1;
  }
  
  &:hover:after {
    opacity: 1;
    animation: glowAnimation 1.5s infinite;
  }
  
  @keyframes glowAnimation {
    0% { transform: rotate(30deg) translateX(-100%); }
    100% { transform: rotate(30deg) translateX(100%); }
  }
`;

const SecondaryButton = styled.a`
  display: inline-block;
  width: 100%;
  padding: 0.875rem 2rem;
  border: 2px solid;
  border-image: linear-gradient(90deg, 
    hsl(180, 100%, 50%) 0%,
    hsl(280, 100%, 60%) 100%
  ) 1;
  background: transparent;
  color: hsl(180, 100%, 50%);
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1.125rem;
  transition: all 0.3s ease;
  text-decoration: none;
  
  @media (min-width: 640px) {
    width: auto;
  }
  
  &:hover {
    background: linear-gradient(90deg, 
      hsl(180, 100%, 50%) 0%,
      hsl(280, 100%, 60%) 100%
    );
    color: white;
    transform: translateY(-2px);
  }
`;

const Hero: React.FC = () => {
  return (
    <HeroSection>
      <HeroContainer>
        <HeroTitle>
          <span>Agentes de IA</span> para transformar seu negócio
        </HeroTitle>
        
        <HeroDescription>
          Explore nossa coleção de agentes inteligentes projetados para automatizar tarefas, 
          analisar dados e impulsionar a eficiência da sua empresa com tecnologia de ponta.
        </HeroDescription>
        
        <ButtonsContainer>
          <PrimaryButton href="#agents">
            Explorar Agentes
          </PrimaryButton>
        </ButtonsContainer>
      </HeroContainer>
    </HeroSection>
  );
};

export default Hero;
