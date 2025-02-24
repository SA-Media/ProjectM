import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Card = styled.div`
  background-color: ${theme.colors.background.light};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.lg};
  border-left: 4px solid ${theme.colors.primary.yellow};
`;

const CardTitle = styled.h3`
  font-family: ${theme.typography.fontFamily.heading};
  font-size: ${theme.typography.fontSize.xl};
  margin-top: 0;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text.primary};
`;

const SubjectList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const SubjectItem = styled.li`
  padding: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
  background-color: rgba(${props => props.index % 2 === 0 ? 
    `${parseInt(theme.colors.primary.yellow.slice(1, 3), 16)}, ${parseInt(theme.colors.primary.yellow.slice(3, 5), 16)}, ${parseInt(theme.colors.primary.yellow.slice(5, 7), 16)}, 0.1` : 
    `${parseInt(theme.colors.primary.teal.slice(1, 3), 16)}, ${parseInt(theme.colors.primary.teal.slice(3, 5), 16)}, ${parseInt(theme.colors.primary.teal.slice(5, 7), 16)}, 0.1`
  });
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.typography.fontFamily.body};
  font-size: ${theme.typography.fontSize.base};
`;

const EmptyMessage = styled.p`
  font-family: ${theme.typography.fontFamily.body};
  font-style: italic;
  color: ${theme.colors.text.secondary};
`;

export const AnalysisCard = ({ title, subjects = [] }) => {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      {subjects && subjects.length > 0 ? (
        <SubjectList>
          {subjects.map((subject, index) => (
            <SubjectItem key={index} index={index}>
              {subject}
            </SubjectItem>
          ))}
        </SubjectList>
      ) : (
        <EmptyMessage>No data available</EmptyMessage>
      )}
    </Card>
  );
}; 