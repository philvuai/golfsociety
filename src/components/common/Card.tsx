import styled from 'styled-components';

export const Card = styled.div`
  background: ${p => p.theme.colors.surface};
  backdrop-filter: ${p => p.theme.blur.md};
  -webkit-backdrop-filter: ${p => p.theme.blur.md};
  border-radius: 20px;
  border: 1px solid ${p => p.theme.colors.border.medium};
  overflow: hidden;
  box-shadow: ${p => p.theme.shadows.medium};
  transition: all ${p => p.theme.animations.normal};
  animation: slideIn 0.8s ease-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${p => p.theme.shadows.large};
    border-color: ${p => p.theme.colors.accent.primary};
  }
`;

export const CardHeader = styled.div`
  padding: 24px 28px 20px;
  border-bottom: 1px solid ${p => p.theme.colors.border.light};
`;

export const CardTitle = styled.h3`
  color: ${p => p.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
`;

export const CardContent = styled.div`
  padding: 24px 28px;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 18px;
  color: ${p => p.theme.colors.text.secondary};
`;

export const ErrorContainer = styled.div`
  background: ${p => p.theme.colors.status.error}20;
  border: 1px solid ${p => p.theme.colors.status.error};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: ${p => p.theme.colors.status.error};
  font-size: 14px;
`;
