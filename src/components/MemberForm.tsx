import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Save, User } from 'lucide-react';
import { Member } from '../types';

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(${props => props.isOpen ? 1 : 0.9});
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 1001;
  overflow-y: auto;
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: ${props => props.isOpen ? 1 : 0};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const Form = styled.form`
  padding: 0 24px 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &:invalid {
    border-color: #ef4444;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.variant === 'primary' ? `
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
    
    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: #f9fafb;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }
  `}
`;

const HelpText = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  margin-bottom: 0;
`;

const RequiredMark = styled.span`
  color: #ef4444;
  margin-left: 2px;
`;

interface MemberFormProps {
  member?: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: any) => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ member, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    handicap: '',
    membershipNumber: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        handicap: member.handicap?.toString() || '',
        membershipNumber: member.membershipNumber || '',
      });
    } else {
      // Reset form for new member
      setFormData({
        name: '',
        email: '',
        phone: '',
        handicap: '',
        membershipNumber: '',
      });
    }
  }, [member, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const memberData = {
        ...formData,
        handicap: formData.handicap ? parseFloat(formData.handicap) : undefined,
        joinedDate: member?.joinedDate || new Date().toISOString(),
        active: member?.active ?? true,
      };

      if (member) {
        // Editing existing member
        await onSave({ ...member, ...memberData });
      } else {
        // Creating new member
        await onSave(memberData);
      }
    } catch (error) {
      // Error handling is done in parent component
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClick={handleOverlayClick}>
      <Modal isOpen={isOpen}>
        <Header>
          <Title>
            <User size={20} />
            {member ? 'Edit Member' : 'Add New Member'}
          </Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">
              Name <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter member's full name"
              required
              autoFocus
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="member@example.com"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01234 567890"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label htmlFor="handicap">Handicap</Label>
              <Input
                id="handicap"
                name="handicap"
                type="number"
                step="0.1"
                min="0"
                max="54"
                value={formData.handicap}
                onChange={handleChange}
                placeholder="18.5"
              />
              <HelpText>Golf handicap (0-54)</HelpText>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="membershipNumber">Membership Number</Label>
              <Input
                id="membershipNumber"
                name="membershipNumber"
                type="text"
                value={formData.membershipNumber}
                onChange={handleChange}
                placeholder="M123456"
              />
            </FormGroup>
          </FormRow>

          <ButtonGroup>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isSubmitting || !formData.name.trim()}
            >
              <Save size={16} />
              {isSubmitting ? 'Saving...' : (member ? 'Update Member' : 'Add Member')}
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default MemberForm;
