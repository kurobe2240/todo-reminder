import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Task, TaskPriority, TaskCategory } from '../types/task';

interface TaskEditModalProps {
  task?: Task;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const ModalOverlay = styled.div`
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

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.small.fontSize};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.body.fontSize};
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.body.fontSize};
  min-height: 100px;
  resize: vertical;
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.body.fontSize};
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.body.fontSize};
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    category: 'other' as TaskCategory,
    tags: '',
    completed: false
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        category: task.category,
        tags: task.tags?.join(', ') || '',
        completed: task.completed
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>タイトル</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>説明</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>優先度</Label>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>カテゴリー</Label>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="work">仕事</option>
              <option value="personal">個人</option>
              <option value="shopping">買い物</option>
              <option value="other">その他</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>タグ（カンマ区切り）</Label>
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="例: 重要, 会議, フォローアップ"
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={onClose}>キャンセル</Button>
            <Button type="submit">保存</Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
}; 