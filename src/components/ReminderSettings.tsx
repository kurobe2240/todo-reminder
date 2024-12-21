import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Task } from '../types/task';

interface ReminderSettingsProps {
  task: Task;
  onUpdate: (reminder: Task['reminder']) => void;
}

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.small.fontSize};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const DaySelector = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const DayButton = styled.button<{ selected: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme, selected }) =>
    selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, selected }) =>
    selected ? theme.colors.primary : 'transparent'};
  color: ${({ theme, selected }) =>
    selected ? 'white' : theme.colors.text.primary};
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  task,
  onUpdate
}) => {
  const [datetime, setDatetime] = useState(
    task.reminder?.datetime
      ? new Date(task.reminder.datetime).toISOString().slice(0, 16)
      : ''
  );
  const [repeatType, setRepeatType] = useState(task.reminder?.repeat?.type || 'none');
  const [selectedDays, setSelectedDays] = useState<number[]>(
    task.reminder?.repeat?.days || []
  );

  const handleDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDatetime = e.target.value;
    setDatetime(newDatetime);
    updateReminder(newDatetime, repeatType, selectedDays);
  };

  const handleRepeatTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRepeatType = e.target.value as 'none' | 'daily' | 'weekly' | 'monthly';
    setRepeatType(newRepeatType);
    updateReminder(datetime, newRepeatType, selectedDays);
  };

  const toggleDay = (day: number) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newSelectedDays);
    updateReminder(datetime, repeatType, newSelectedDays);
  };

  const updateReminder = (
    newDatetime: string,
    newRepeatType: string,
    newSelectedDays: number[]
  ) => {
    if (!newDatetime) {
      onUpdate(undefined);
      return;
    }

    onUpdate({
      datetime: new Date(newDatetime),
      repeat: newRepeatType === 'none'
        ? undefined
        : {
            type: newRepeatType as 'daily' | 'weekly' | 'monthly',
            days: newSelectedDays
          }
    });
  };

  // 通知の許可を要求
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Container>
      <FormGroup>
        <Label>日時</Label>
        <Input
          type="datetime-local"
          value={datetime}
          onChange={handleDatetimeChange}
        />
      </FormGroup>

      <FormGroup>
        <Label>繰り返し</Label>
        <Select value={repeatType} onChange={handleRepeatTypeChange}>
          <option value="none">繰り返しなし</option>
          <option value="daily">毎日</option>
          <option value="weekly">毎週</option>
          <option value="monthly">毎月</option>
        </Select>
      </FormGroup>

      {repeatType === 'weekly' && (
        <FormGroup>
          <Label>曜日を選択</Label>
          <DaySelector>
            {weekDays.map((day, index) => (
              <DayButton
                key={day}
                selected={selectedDays.includes(index)}
                onClick={() => toggleDay(index)}
                type="button"
              >
                {day}
              </DayButton>
            ))}
          </DaySelector>
        </FormGroup>
      )}

      {repeatType === 'monthly' && (
        <FormGroup>
          <Label>日付を選択</Label>
          <DaySelector>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <DayButton
                key={day}
                selected={selectedDays.includes(day)}
                onClick={() => toggleDay(day)}
                type="button"
              >
                {day}
              </DayButton>
            ))}
          </DaySelector>
        </FormGroup>
      )}
    </Container>
  );
}; 