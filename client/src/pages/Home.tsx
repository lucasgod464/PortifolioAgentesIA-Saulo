import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Hero from '../components/Hero';
import AgentGrid from '../components/AgentGrid';
import Features from '../components/Features';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import NeuralBackground from '../components/NeuralBackground';
import FloatingParticles from '../components/FloatingParticles';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    hsl(220, 30%, 8%) 0%,
    hsl(240, 40%, 12%) 30%,
    hsl(260, 30%, 10%) 70%,
    hsl(220, 30%, 8%) 100%
  );
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 50%);
  overflow-x: hidden;
  position: relative;
`;

const Home: React.FC = () => {
  return (
    <HomeContainer>
      <NeuralBackground />
      <FloatingParticles />
      <Header />
      <Hero />
      <AgentGrid />
      <Features />
      <CTA />
      <Footer />
    </HomeContainer>
  );
};

export default Home;
