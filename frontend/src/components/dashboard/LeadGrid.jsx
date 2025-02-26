import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import LeadCard from './LeadCard';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.xl};
  width: 100%;
  justify-items: center;
  align-items: stretch;
`;

const EmptyState = styled.div`
  width: 100%;
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.body};
  font-size: ${theme.typography.fontSize.lg};
  background-color: ${theme.colors.background.light};
  border-radius: ${theme.borderRadius.md};
  border: 1px dashed ${theme.colors.text.secondary};
  margin: 2rem 0;
`;

const LeadGrid = ({ leads = [] }) => {
  if (!leads || leads.length === 0) {
    return (
      <EmptyState>
        <h3>No leads found matching your criteria</h3>
        <p>Try analyzing an article with different themes or broader industry topics.</p>
        <p>If your MySQL server is not running, please start it and try again.</p>
      </EmptyState>
    );
  }

  return (
    <GridContainer>
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </GridContainer>
  );
};

export default LeadGrid; 