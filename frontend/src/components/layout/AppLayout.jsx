import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { useNavigate } from 'react-router-dom';

const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(120deg, rgba(227, 243, 26, 0.08), rgba(122, 201, 192, 0.12));
`;

const HeaderHeight = '70px'; // Define header height as a constant for consistency

const Header = styled.header`
  height: ${HeaderHeight};
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 200; // Ensure header is above sidebar
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

const ClickableLogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  justify-content: center; // Center the content horizontally
`;

const SidebarWrapper = styled.aside`
  width: ${props => props.isOpen ? '280px' : '0'};
  background-color: white;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  position: fixed;
  top: ${HeaderHeight}; // Position below header
  left: 0;
  bottom: 0;
  z-index: 100;
  overflow-y: auto;
  transition: width 0.3s ease;
  box-shadow: ${props => props.isOpen ? theme.shadows.md : 'none'};
`;

const SidebarToggle = styled.button`
  position: fixed;
  left: ${props => props.isOpen ? '280px' : '0'};
  top: calc(${HeaderHeight} + 10px); // Position relative to header
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-left: ${props => props.isOpen ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'};
  border-radius: 0 8px 8px 0;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: left 0.3s ease;
  z-index: 101;
  box-shadow: ${theme.shadows.sm};
  
  &:hover {
    background-color: #f8f8f8;
  }
  
  /* Hide on very small screens */
  @media (max-width: 480px) {
    display: none;
  }
`;

const SidebarContent = styled.div`
  padding: 1.5rem;
`;

const SidebarHeader = styled.div`
  font-family: ${theme.typography.fontFamily.heading};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.text.primary};
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(227, 243, 26, 0.08);
  margin-bottom: ${theme.spacing.md};
`;

const ClearHistoryButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.5rem 1rem;
  margin-top: ${theme.spacing.sm};
  width: 100%;
  text-align: center;
  
  &:hover {
    color: ${theme.colors.primary.teal};
    text-decoration: underline;
  }
`;

const EmptyHistory = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  padding: ${theme.spacing.xl} 0;
  font-style: italic;
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: calc(100vh - 210px);
  overflow-y: auto;
`;

const HistoryItem = styled.li`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.sm};
  cursor: pointer;
  background-color: ${props => props.isSelected ? 'rgba(122, 201, 192, 0.2)' : 'transparent'};
  border-left: ${props => props.isSelected ? `3px solid ${theme.colors.primary.teal}` : '3px solid transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'rgba(122, 201, 192, 0.2)' : 'rgba(122, 201, 192, 0.1)'};
  }
`;

const HistoryItemTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HistoryItemTimestamp = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const HistoryItemBadge = styled.span`
  background-color: ${props => props.badgeColor || theme.colors.primary.yellow};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xs};
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.full};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-left: auto;
  opacity: 0.8;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: ${props => props.sidebarOpen ? 'calc(100% - 280px)' : '1200px'};
  width: 100%;
  transition: max-width 0.3s ease, margin-left 0.3s ease;
  margin-left: ${props => props.sidebarOpen ? '280px' : '0'};
  
  /* Center content but maintain sidebar space */
  @media (min-width: 1480px) {
    max-width: ${props => props.sidebarOpen ? '1200px' : '1200px'};
  }
  
  /* Ensure we don't get too narrow on mid-size screens */
  @media (max-width: 1479px) and (min-width: 769px) {
    max-width: ${props => props.sidebarOpen ? 'calc(100% - 280px)' : 'calc(100% - 2rem)'};
  }
  
  /* Full width on mobile */
  @media (max-width: 768px) {
    max-width: 100%;
    margin-left: 0;
    padding: 1rem;
  }
`;

const Footer = styled.footer`
  background-color: ${theme.colors.primary.dark};
  color: ${theme.colors.text.light};
  padding: 2rem;
  text-align: center;
  font-family: ${theme.typography.fontFamily.body};
`;

export const AppLayout = ({ 
  children, 
  historyItems = [], 
  onSelectHistoryItem = () => {}, 
  onClearHistory = () => {},
  selectedHistoryItem = null,
  debugLayout = false
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  // Format relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  // Get a safe display title, never showing undefined
  const getDisplayTitle = (item) => {
    if (!item) return 'Analysis';
    if (!item.title || item.title.includes('undefined')) {
      return `Analysis ${getRelativeTime(item.timestamp)}`;
    }
    return item.title;
  };

  return (
    <AppWrapper>
      <Header>
        <ClickableLogoContainer onClick={handleLogoClick}>
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
        </ClickableLogoContainer>
      </Header>
      <MainContainer style={debugLayout ? {border: '1px dashed red'} : {}}>
        <SidebarWrapper isOpen={sidebarOpen} style={debugLayout ? {border: '1px dashed blue'} : {}}>
          <SidebarHeader>Analysis History</SidebarHeader>
          <SidebarContent>
            {historyItems.length === 0 ? (
              <EmptyHistory>No previous analyses yet</EmptyHistory>
            ) : (
              <>
                <HistoryList>
                  {historyItems.map(item => (
                    <HistoryItem 
                      key={item.id}
                      isSelected={selectedHistoryItem && selectedHistoryItem.id === item.id}
                      onClick={() => onSelectHistoryItem(item)}
                    >
                      <HistoryItemTitle>
                        {getDisplayTitle(item)}
                      </HistoryItemTitle>
                      <HistoryItemTimestamp>
                        {getRelativeTime(item.timestamp)}
                        {item.type === 'copyRating' ? (
                          <HistoryItemBadge badgeColor={theme.colors.primary.teal}>
                            Copy Score: {item.copyScores?.overallScore}/100
                          </HistoryItemBadge>
                        ) : item.results?.subjects?.length > 0 && (
                          <HistoryItemBadge>
                            {item.results.subjects.length} themes
                          </HistoryItemBadge>
                        )}
                      </HistoryItemTimestamp>
                    </HistoryItem>
                  ))}
                </HistoryList>
                <ClearHistoryButton onClick={onClearHistory}>
                  Clear All History
                </ClearHistoryButton>
              </>
            )}
          </SidebarContent>
        </SidebarWrapper>
        <SidebarToggle isOpen={sidebarOpen} onClick={toggleSidebar}>
          {sidebarOpen ? '←' : '→'}
        </SidebarToggle>
        <MainContent sidebarOpen={sidebarOpen} style={debugLayout ? {border: '1px dashed green'} : {}}>
          {children}
        </MainContent>
      </MainContainer>
      <Footer>
        <p>© {new Date().getFullYear()} SEO Backlink Builder. All rights reserved.</p>
      </Footer>
    </AppWrapper>
  );
}; 