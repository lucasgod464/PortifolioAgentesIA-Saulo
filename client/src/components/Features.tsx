import React from 'react';
import styled from 'styled-components';
import { features } from '../data/features';

const FeaturesSection = styled.section`
  position: relative;
  z-index: 10;
  padding: 4rem 1rem;
  background: linear-gradient(135deg, 
    hsl(220, 30%, 8%) 0%,
    hsl(240, 40%, 12%) 50%,
    hsl(260, 30%, 10%) 100%
  );
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
  
  @media (min-width: 1024px) {
    padding: 4rem 4rem;
  }
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.875rem;
  color: white;
  margin-bottom: 1rem;
  font-family: 'Audiowide', cursive;
  
  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`;

const Divider = styled.div`
  height: 0.25rem;
  width: 6rem;
  background: linear-gradient(90deg, 
    hsl(180, 100%, 50%) 0%,
    hsl(280, 100%, 60%) 100%
  );
  margin: 0 auto 1.5rem;
`;

const SectionDescription = styled.p`
  color: #d1d5db;
  max-width: 48rem;
  margin: 0 auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: rgba(22, 27, 58, 0.8);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(139, 92, 246, 0.2);
`;

const IconContainer = styled.div`
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, 
    rgba(0, 255, 255, 0.2) 0%,
    rgba(168, 85, 247, 0.2) 100%
  );
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Icon = styled.i`
  font-size: 1.875rem;
  background: linear-gradient(90deg, 
    hsl(180, 100%, 70%) 0%,
    hsl(280, 100%, 70%) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.75rem;
`;

const FeatureDescription = styled.p`
  color: #d1d5db;
`;

const Features: React.FC = () => {
  return (
    <FeaturesSection>
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>Por que escolher nossos agentes?</SectionTitle>
          <Divider />
          <SectionDescription>
            Nossos agentes de IA foram desenvolvidos para oferecer soluções eficientes e 
            adaptáveis para desafios empresariais cotidianos.
          </SectionDescription>
        </SectionHeader>
        
        <FeaturesGrid>
          {features.map((feature) => (
            <FeatureCard key={feature.id}>
              <IconContainer>
                <Icon className={feature.icon} />
              </IconContainer>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </SectionContainer>
    </FeaturesSection>
  );
};

export default Features;
