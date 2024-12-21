import React, { useRef } from 'react';
import styled from 'styled-components';
import { Task } from '../types/task';
import DataManagementService from '../services/DataManagementService';

interface DataManagementProps {
  tasks: Task[];
  onImport: (tasks: Task[]) => void;
}

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
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

const FileInput = styled.input`
  display: none;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.small.fontSize};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export const DataManagement: React.FC<DataManagementProps> = ({
  tasks,
  onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const dataService = DataManagementService.getInstance();

  const handleExport = () => {
    try {
      dataService.exportData(tasks);
    } catch (error) {
      setError('データのエクスポートに失敗しました');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedTasks = await dataService.importData(file);
      onImport(importedTasks);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'データのインポートに失敗しました');
    }

    // ファイル選択をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Container>
      <ButtonGroup>
        <Button onClick={handleExport}>���クスポート</Button>
        <Button variant="secondary" onClick={handleImportClick}>
          インポート
        </Button>
        <FileInput
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
        />
      </ButtonGroup>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
}; 