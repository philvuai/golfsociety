import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User, UserPlus, Edit2, Trash2, Search, Mail, Phone, Trophy } from 'lucide-react';
import { Member } from '../types';
import { apiService } from '../services/api';
import MemberForm from './MemberForm';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const Container = styled.div`
  padding: 32px;
  background: transparent;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 300px;
  
  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid ${props => props.theme.colors.border.medium};
  border-radius: 8px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  
  &:focus {
    border-color: ${props => props.theme.colors.accent.primary};
    outline: none;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.text.secondary};
  width: 18px;
  height: 18px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.theme.colors.accent.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.status.info};
    transform: translateY(-2px);
  }
`;

const MembersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const MemberCard = styled.div`
  background: ${props => props.theme.colors.surface};
  backdrop-filter: ${props => props.theme.blur.md};
  -webkit-backdrop-filter: ${props => props.theme.blur.md};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${props => props.theme.colors.border.medium};
  box-shadow: ${props => props.theme.shadows.medium};
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.large};
    border-color: ${props => props.theme.colors.accent.primary};
  }
`;

const MemberHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const MemberName = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const MemberActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.border.light};
    color: ${props => props.theme.colors.text.primary};
  }

  &.delete:hover {
    background: ${props => props.theme.colors.status.error};
    color: white;
  }
`;

const MemberDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const HandicapBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${props => props.theme.colors.accent.primary};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const JoinedDate = styled.div`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 12px;
  margin-top: 12px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 18px;
  color: ${props => props.theme.colors.text.secondary};
`;

const ErrorContainer = styled.div`
  background: ${props => props.theme.colors.status.error}20;
  border: 1px solid ${props => props.theme.colors.status.error};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: ${props => props.theme.colors.status.error};
  font-size: 14px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${props => props.theme.colors.text.secondary};

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h3 {
    font-size: 18px;
    margin-bottom: 8px;
    color: ${props => props.theme.colors.text.primary};
  }

  p {
    font-size: 14px;
    line-height: 1.5;
  }
`;

interface MembersListProps {
  user: { username: string; role: 'admin' | 'viewer' };
}

const MembersList: React.FC<MembersListProps> = ({ user }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const { theme } = useTheme();

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredMembers(filtered);
  }, [members, searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedMembers = await apiService.getMembers();
      setMembers(fetchedMembers);
    } catch (err: any) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMember = await apiService.createMember(memberData);
      setMembers(prev => [...prev, newMember]);
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create member');
    }
  };

  const handleEditMember = async (memberData: Member) => {
    try {
      const updatedMember = await apiService.updateMember(memberData);
      setMembers(prev => prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      ));
      setEditingMember(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update member');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteMember(memberId);
      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete member');
    }
  };

  const formatJoinedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <StyledThemeProvider theme={theme}>
        <Container>
          <LoadingContainer>Loading members...</LoadingContainer>
        </Container>
      </StyledThemeProvider>
    );
  }

  return (
    <StyledThemeProvider theme={theme}>
      <Container>
        <Header>
          <Title>Members</Title>
          <Subtitle>Manage golf society members and their information</Subtitle>
        </Header>

        {error && (
          <ErrorContainer>
            {error}
          </ErrorContainer>
        )}

        <ActionsBar>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          
          <AddButton onClick={() => setShowAddForm(true)}>
            <UserPlus size={18} />
            Add Member
          </AddButton>
        </ActionsBar>

        {filteredMembers.length === 0 && !loading ? (
          <EmptyState>
            <User />
            <h3>No members found</h3>
            <p>
              {searchTerm 
                ? "No members match your search criteria. Try adjusting your search terms."
                : "Start building your member database by adding your first member."
              }
            </p>
          </EmptyState>
        ) : (
          <MembersGrid>
            {filteredMembers.map(member => (
              <MemberCard key={member.id}>
                <MemberHeader>
                  <MemberName>{member.name}</MemberName>
                  <MemberActions>
                    <ActionButton onClick={() => setEditingMember(member)}>
                      <Edit2 size={16} />
                    </ActionButton>
                    <ActionButton 
                      className="delete"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <Trash2 size={16} />
                    </ActionButton>
                  </MemberActions>
                </MemberHeader>

                {member.email && (
                  <MemberDetail>
                    <Mail />
                    {member.email}
                  </MemberDetail>
                )}

                {member.phone && (
                  <MemberDetail>
                    <Phone />
                    {member.phone}
                  </MemberDetail>
                )}

                {member.handicap !== undefined && (
                  <MemberDetail>
                    <HandicapBadge>
                      <Trophy size={12} />
                      {member.handicap}
                    </HandicapBadge>
                  </MemberDetail>
                )}

                <JoinedDate>
                  Joined: {formatJoinedDate(member.joinedDate)}
                </JoinedDate>
              </MemberCard>
            ))}
          </MembersGrid>
        )}

        {(showAddForm || editingMember) && (
          <MemberForm
            member={editingMember}
            isOpen={showAddForm || !!editingMember}
            onClose={() => {
              setShowAddForm(false);
              setEditingMember(null);
            }}
            onSave={editingMember ? handleEditMember : handleAddMember}
          />
        )}
      </Container>
    </StyledThemeProvider>
  );
};

export default MembersList;
