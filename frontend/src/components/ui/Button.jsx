import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

const ButtonStyles = styled.button`
  font-family: ${theme.typography.fontFamily.heading};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.md};
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: ${theme.typography.fontSize.base};
  border: none;
  
  ${props => props.$variant === 'primary' && css`
    background-color: ${theme.colors.primary.yellow};
    color: ${theme.colors.text.primary};
    &:hover {
      background-color: ${theme.colors.secondary.yellow};
      box-shadow: ${theme.shadows.md};
    }
  `}
  
  ${props => props.$variant === 'secondary' && css`
    background-color: ${theme.colors.primary.teal};
    color: ${theme.colors.text.primary};
    &:hover {
      background-color: ${theme.colors.secondary.teal};
      box-shadow: ${theme.shadows.md};
    }
  `}
  
  ${props => props.$variant === 'outline' && css`
    background-color: transparent;
    border: 2px solid ${theme.colors.primary.dark};
    color: ${theme.colors.text.primary};
    &:hover {
      background-color: ${theme.colors.primary.dark};
      color: ${theme.colors.text.light};
    }
  `}
  
  ${props => props.$size === 'small' && css`
    padding: 0.5rem 1rem;
    font-size: ${theme.typography.fontSize.sm};
  `}
  
  ${props => props.$size === 'large' && css`
    padding: 1rem 2rem;
    font-size: ${theme.typography.fontSize.lg};
  `}
  
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  ${props => props.disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      box-shadow: none;
    }
  `}
`;

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false, 
  disabled = false, 
  onClick, 
  type = 'button', 
  ...props 
}) => {
  return (
    <ButtonStyles 
      $variant={variant} 
      $size={size} 
      $fullWidth={fullWidth} 
      disabled={disabled} 
      onClick={onClick} 
      type={type} 
      {...props}
    >
      {children}
    </ButtonStyles>
  );
}; 