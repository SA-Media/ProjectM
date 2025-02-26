import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Card = styled.div`
  background-color: ${theme.colors.background.light};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const Name = styled.h3`
  font-family: ${theme.typography.fontFamily.heading};
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const Industry = styled.span`
  font-family: ${theme.typography.fontFamily.body};
  font-size: ${theme.typography.fontSize.sm};
  background-color: rgba(${parseInt(theme.colors.primary.teal.slice(1, 3), 16)}, 
                        ${parseInt(theme.colors.primary.teal.slice(3, 5), 16)}, 
                        ${parseInt(theme.colors.primary.teal.slice(5, 7), 16)}, 0.1);
  color: ${theme.colors.primary.teal};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
`;

const InfoItem = styled.div`
  margin-bottom: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${theme.spacing.xs};
    color: ${theme.colors.text.secondary};
  }
`;

const Label = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-right: ${theme.spacing.xs};
`;

const Value = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  font-weight: 500;
`;

const Position = styled.div`
  font-family: ${theme.typography.fontFamily.body};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
`;

const ActionButton = styled.button`
  background-color: ${theme.colors.primary.teal};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-family: ${theme.typography.fontFamily.body};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  margin-top: auto;
  align-self: flex-start;
  
  &:hover {
    background-color: ${theme.colors.primary.darkTeal};
  }
`;

// Add an SVG icon for email
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

// Add an SVG icon for phone
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

// Add an SVG icon for website
const WebsiteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const LeadCard = ({ lead }) => {
  if (!lead) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <Name>{lead.company_name || 'Unknown Company'}</Name>
        {lead.industry && <Industry>{lead.industry}</Industry>}
      </CardHeader>
      
      {lead.position && <Position>Lead contact: {lead.position}</Position>}
      
      <InfoItem>
        <EmailIcon />
        <Label>Email:</Label>
        <Value>{lead.email || 'N/A'}</Value>
      </InfoItem>
      
      <InfoItem>
        <PhoneIcon />
        <Label>Phone:</Label>
        <Value>{lead.phone || 'N/A'}</Value>
      </InfoItem>
      
      {lead.website && (
        <InfoItem>
          <WebsiteIcon />
          <Label>Website:</Label>
          <Value>
            <a 
              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.colors.primary.teal, textDecoration: 'none' }}
            >
              {lead.website}
            </a>
          </Value>
        </InfoItem>
      )}
      
      <ActionButton onClick={() => window.open(`mailto:${lead.email}`)}>
        Contact Lead
      </ActionButton>
    </Card>
  );
};

export default LeadCard; 