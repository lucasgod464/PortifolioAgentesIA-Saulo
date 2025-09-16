import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Users, 
  Bot, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLogoFromEnv } from '@/hooks/use-env-config';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn, slideInLeft } from '@/styles/animations';

const SidebarContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 250px;
  background: linear-gradient(180deg, rgba(30, 22, 68, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
  border-right: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.3);
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;
  z-index: 40;
  display: flex;
  flex-direction: column;
  animation: ${slideInLeft} 0.3s ease-out;
  
  @media (max-width: 768px) {
    width: 80%;
    max-width: 300px;
  }
`;

const SidebarOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 30;
  display: ${props => props.isOpen ? 'block' : 'none'};
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
`;

const Logo = styled.img`
  height: 40px;
  margin-right: 0.5rem;
`;

const SidebarTitle = styled.h2`
  color: white;
  font-size: 1.25rem;
  font-weight: 500;
`;

const SidebarNav = styled.nav`
  padding: 1rem;
  flex: 1;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0.5rem;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: ${props => props.$active ? 'white' : '#a5b4fc'};
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  background: ${props => props.$active ? 'rgba(139, 92, 246, 0.2)' : 'transparent'};
  
  &:hover {
    background: rgba(139, 92, 246, 0.15);
    color: white;
  }
  
  svg {
    margin-right: 0.75rem;
  }
`;

const SidebarFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(139, 92, 246, 0.2);
`;

const LogoutButton = styled(Button)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.1);
  color: #a5b4fc;
  border: 1px solid rgba(139, 92, 246, 0.3);
  
  &:hover {
    background: rgba(139, 92, 246, 0.2);
    color: white;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const MobileMenuButton = styled(Button)<{ $isOpen: boolean }>`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 50;
  padding: 0.5rem;
  background: ${props => props.$isOpen ? 'transparent' : 'rgba(30, 22, 68, 0.9)'};
  border: ${props => props.$isOpen ? 'none' : '1px solid rgba(139, 92, 246, 0.3)'};
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const logoUrl = useLogoFromEnv();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };
  
  return (
    <>
      <MobileMenuButton 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        $isOpen={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </MobileMenuButton>
      
      <SidebarOverlay isOpen={isOpen} onClick={closeSidebar} />
      
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader>
          {logoUrl && <Logo src={logoUrl} alt="Logo" />}
          <SidebarTitle>Admin</SidebarTitle>
        </SidebarHeader>
        
        <SidebarNav>
          <NavList>
            <NavItem>
              <NavLink 
                href="/admin/dashboard" 
                $active={location === '/admin/dashboard'}
                onClick={closeSidebar}
              >
                <Home size={20} />
                Dashboard
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink 
                href="/admin/agents" 
                $active={location === '/admin/agents'}
                onClick={closeSidebar}
              >
                <Bot size={20} />
                Agentes
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink 
                href="/admin/prompts" 
                $active={location === '/admin/prompts'}
                onClick={closeSidebar}
              >
                <MessageSquare size={20} />
                Prompts
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink 
                href="/admin/users" 
                $active={location === '/admin/users'}
                onClick={closeSidebar}
              >
                <Users size={20} />
                Usuários
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink 
                href="/admin/settings" 
                $active={location === '/admin/settings'}
                onClick={closeSidebar}
              >
                <Settings size={20} />
                Configurações
              </NavLink>
            </NavItem>
          </NavList>
        </SidebarNav>
        
        <SidebarFooter>
          <LogoutButton 
            variant="outline" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={18} />
            {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
          </LogoutButton>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
}