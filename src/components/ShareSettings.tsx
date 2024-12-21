import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Task } from '../types/task';
import { User } from '../services/AuthService';
import SharingService, { ShareSettings as IShareSettings, Comment } from '../services/SharingService';

interface ShareSettingsProps {
  task: Task;
  currentUser: User;
  onClose: () => void;
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Content = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const Title = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, variant }) =>
    variant === 'secondary' ? theme.colors.secondary : theme.colors.primary};
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const UserList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const UserItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const CommentList = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const CommentItem = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.small.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CommentContent = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ShareSettings: React.FC<ShareSettingsProps> = ({
  task,
  currentUser,
  onClose
}) => {
  const [sharedUsers, setSharedUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sharingService = SharingService.getInstance();

  useEffect(() => {
    loadSharedUsers();
    loadComments();
  }, [task.id]);

  const loadSharedUsers = async () => {
    try {
      const users = await sharingService.getSharedUsers(task.id);
      setSharedUsers(users);
    } catch (error) {
      setError('共有ユーザーの読み込みに失敗しました');
    }
  };

  const loadComments = async () => {
    try {
      const taskComments = await sharingService.getComments(task.id);
      setComments(taskComments);
    } catch (error) {
      setError('コメントの読み込みに失敗しました');
    }
  };

  const handleShare = async () => {
    try {
      await sharingService.shareTask(task.id, [newEmail], {
        view: true,
        edit: false,
        delete: false
      });
      setNewEmail('');
      await loadSharedUsers();
      setError(null);
    } catch (error) {
      setError('タスクの共有に失敗しました');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment = await sharingService.addComment(task.id, newComment, currentUser);
      setComments([...comments, comment]);
      setNewComment('');
      setError(null);
    } catch (error) {
      setError('コメントの追加に失敗しました');
    }
  };

  return (
    <Container onClick={onClose}>
      <Content onClick={(e) => e.stopPropagation()}>
        <Title>共有設定</Title>

        <Section>
          <Label>ユーザーを追加</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              type="email"
              placeholder="メールアドレス"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Button onClick={handleShare}>共有</Button>
          </div>
        </Section>

        <Section>
          <Label>共有ユーザー</Label>
          <UserList>
            {sharedUsers.map((user) => (
              <UserItem key={user.id}>
                <span>{user.name} ({user.email})</span>
              </UserItem>
            ))}
          </UserList>
        </Section>

        <Section>
          <Label>コメント</Label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <Input
              type="text"
              placeholder="コメントを入力"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button onClick={handleAddComment}>送信</Button>
          </div>

          <CommentList>
            {comments.map((comment) => (
              <CommentItem key={comment.id}>
                <CommentHeader>
                  <span>{comment.userName}</span>
                  <span>
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </CommentHeader>
                <CommentContent>{comment.content}</CommentContent>
              </CommentItem>
            ))}
          </CommentList>
        </Section>

        {error && <div style={{ color: 'red' }}>{error}</div>}
      </Content>
    </Container>
  );
}; 