import React from 'react';
import styled from 'styled-components';

const PricingSection = styled.section`
  position: relative;
  z-index: 10;
  padding: 4rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
  
  @media (min-width: 1024px) {
    padding: 4rem 4rem;
  }
`;

const SectionContainer = styled.div`
  max-width: 1440px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const SectionIcon = styled.div`
  font-size: 2.5rem;
  color: #60a5fa;
  margin-bottom: 1rem;
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
  background: linear-gradient(to right, #6b46c1, #2563eb);
  margin: 0 auto 1.5rem;
`;

const SectionDescription = styled.p`
  color: #d1d5db;
  max-width: 48rem;
  margin: 0 auto;
  font-size: 1.1rem;
`;

const PlansGrid = styled.div`
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

const PlanCard = styled.div<{ isPopular?: boolean }>`
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  transition: all 0.3s ease;
  
  ${({ isPopular }) => isPopular && `
    border: 2px solid #10b981;
    transform: scale(1.05);
    box-shadow: 0 20px 40px rgba(16, 185, 129, 0.2);
    background: rgba(16, 185, 129, 0.05);
  `}
  
  &:hover {
    transform: translateY(-10px) ${({ isPopular }) => isPopular ? 'scale(1.05)' : ''};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  color: white;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const PlanPrice = styled.div`
  margin-bottom: 2rem;
`;

const Price = styled.span<{ isPopular?: boolean }>`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ isPopular }) => isPopular ? '#10b981' : '#60a5fa'};
`;

const PriceUnit = styled.span`
  font-size: 1rem;
  color: #9ca3af;
  margin-left: 0.5rem;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  color: #d1d5db;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  
  &:before {
    content: '';
    width: 1rem;
    height: 1rem;
    background: #10b981;
    border-radius: 50%;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }
`;

const CapacityInfo = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
  color: #10b981;
  font-size: 0.9rem;
  font-weight: 600;
`;

const SupportInfo = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #60a5fa;
  font-size: 0.9rem;
  font-weight: 600;
`;

const PlanButton = styled.button<{ isPopular?: boolean }>`
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${({ isPopular }) => isPopular ? `
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #059669, #047857);
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
    }
  ` : `
    background: linear-gradient(135deg, #6b46c1, #8b5cf6);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #8b5cf6, #a78bfa);
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(107, 70, 193, 0.3);
    }
  `}
`;

const PricingPlans: React.FC = () => {
  const plans = [
    {
      name: 'VPS 8GB',
      price: 'R$169,90',
      unit: 'BRL/mês',
      features: [
        '8GB RAM',
        '2 vCPU',
        '120 GB NVMe',
        '1 IPv4',
        'Servidor no Brasil',
        'Uptime superior a 99,9%'
      ],
      capacity: 'Capacidade: Até 20 clientes',
      support: 'Suporte: Até 26 conexões',
      buttonText: 'Contratar VPS 8GB',
      isPopular: false
    },
    {
      name: 'VPS 16GB',
      price: 'R$279,90',
      unit: 'BRL/mês',
      features: [
        '16GB RAM',
        '6 vCPU',
        '200 GB NVMe',
        '1 IPv4',
        'Servidor no Brasil',
        'Uptime superior a 99,9%'
      ],
      capacity: 'Capacidade: Até 40 clientes',
      support: 'Suporte: Até 34 conexões',
      buttonText: 'Contratar VPS 16GB',
      isPopular: true
    },
    {
      name: 'VPS 32GB',
      price: 'R$429,90',
      unit: 'BRL/mês',
      features: [
        '32GB RAM',
        '6 vCPU',
        '250 GB NVMe',
        '1 IPv4',
        'Servidor no Brasil',
        'Uptime superior a 99,9%'
      ],
      capacity: 'Capacidade: Até 60 clientes',
      support: 'Suporte: Até 45 conexões',
      buttonText: 'Contratar VPS 32GB',
      isPopular: false
    }
  ];

  return (
    <PricingSection id="pricing">
      <SectionContainer>
        <SectionHeader>
          <SectionIcon>
            <i className="fas fa-rocket"></i>
          </SectionIcon>
          <SectionTitle>Planos VPS</SectionTitle>
          <Divider />
          <SectionDescription>
            Escolha o plano ideal para escalar seu negócio com alto desempenho e estabilidade
          </SectionDescription>
        </SectionHeader>
        
        <PlansGrid>
          {plans.map((plan, index) => (
            <PlanCard key={index} isPopular={plan.isPopular} data-testid={`plan-card-${index}`}>
              {plan.isPopular && <PopularBadge>Mais Popular</PopularBadge>}
              
              <PlanName>{plan.name}</PlanName>
              
              <PlanPrice>
                <Price isPopular={plan.isPopular}>{plan.price}</Price>
                <PriceUnit>{plan.unit}</PriceUnit>
              </PlanPrice>
              
              <FeaturesList>
                {plan.features.map((feature, featureIndex) => (
                  <FeatureItem key={featureIndex}>{feature}</FeatureItem>
                ))}
              </FeaturesList>
              
              <CapacityInfo>{plan.capacity}</CapacityInfo>
              <SupportInfo>{plan.support}</SupportInfo>
              
              <PlanButton 
                isPopular={plan.isPopular}
                data-testid={`button-${plan.buttonText.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {plan.buttonText}
              </PlanButton>
            </PlanCard>
          ))}
        </PlansGrid>
      </SectionContainer>
    </PricingSection>
  );
};

export default PricingPlans;