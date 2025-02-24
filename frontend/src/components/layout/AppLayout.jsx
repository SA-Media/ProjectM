import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.background.light};
`;

const Header = styled.header`
  background-color: ${theme.colors.background.light};
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoText = styled.h1`
  font-family: ${theme.typography.fontFamily.heading};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize['2xl']};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const Footer = styled.footer`
  background-color: ${theme.colors.primary.dark};
  color: ${theme.colors.text.light};
  padding: 2rem;
  text-align: center;
  font-family: ${theme.typography.fontFamily.body};
`;

export const AppLayout = ({ children }) => {
  return (
    <AppWrapper>
      <Header>
        <LogoContainer>
          <div 
            style={{
              width: 40,
              height: 40,
              backgroundColor: theme.colors.primary.yellow,
              borderRadius: theme.borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            SB
          </div>
          <LogoText>SEO Backlink Builder</LogoText>
        </LogoContainer>
      </Header>
      <MainContent>{children}</MainContent>
      <Footer>
        <p>© {new Date().getFullYear()} SEO Backlink Builder. All rights reserved.</p>
      </Footer>
    </AppWrapper>
  );
}; 