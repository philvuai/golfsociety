import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const Container = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ToastItem = styled.div<{ variant: 'success' | 'error' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  min-width: 280px;
  max-width: 400px;
  animation: ${slideIn} 0.3s ease-out;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: ${p => p.variant === 'success' ? '#dcfce7' : p.variant === 'error' ? '#fef2f2' : '#eff6ff'};
  color: ${p => p.variant === 'success' ? '#15803d' : p.variant === 'error' ? '#b91c1c' : '#1e40af'};
  border: 1px solid ${p => p.variant === 'success' ? '#bbf7d0' : p.variant === 'error' ? '#fecaca' : '#bfdbfe'};
`;

const Message = styled.span`
  flex: 1;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  padding: 2px;
  display: flex;
  &:hover { opacity: 1; }
  &::before { display: none; }
`;

const icons = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  if (toasts.length === 0) return null;

  return (
    <Container>
      {toasts.map(toast => (
        <ToastItem key={toast.id} variant={toast.type}>
          {icons[toast.type]}
          <Message>{toast.message}</Message>
          <CloseBtn onClick={() => removeToast(toast.id)}>
            <X size={14} />
          </CloseBtn>
        </ToastItem>
      ))}
    </Container>
  );
};

export default ToastContainer;
