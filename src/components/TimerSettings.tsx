import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TimerSettings as ITimerSettings, TimerPreset, DEFAULT_PRESETS } from '../types/timer';
import { storage } from '../services/storage';

const SettingsContainer = styled.div`
  padding: 20px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
`;

const SettingsGroup = styled.div`
  margin-bottom: 20px;
`;

const SettingsTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #666;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background-color: ${props => {
    switch (props.variant) {
      case 'primary': return '#FF69B4';
      case 'secondary': return '#87CEEB';
      case 'danger': return '#FF6B6B';
      default: return '#FF69B4';
    }
  }};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin: 5px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

interface Props {
  onSave: (settings: ITimerSettings) => void;
  onClose: () => void;
}

export const TimerSettings: React.FC<Props> = ({ onSave, onClose }) => {
  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [settings, setSettings] = useState<ITimerSettings>({
    totalWorkTime: 25 * 60,
    breakInterval: 25 * 60,
    breakDuration: 5 * 60,
    autoStartAfterBreak: true,
    soundEnabled: true,
  });
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    const savedPresets = storage.getPresets();
    const activePresetId = storage.getActivePresetId();
    if (savedPresets.length === 0) {
      storage.savePresets(DEFAULT_PRESETS);
      setPresets(DEFAULT_PRESETS);
    } else {
      setPresets(savedPresets);
    }
    if (activePresetId) {
      setSelectedPresetId(activePresetId);
      const activePreset = savedPresets.find(p => p.id === activePresetId);
      if (activePreset) {
        setSettings(activePreset.settings);
      }
    }
  }, []);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    setSelectedPresetId(presetId);
    const selectedPreset = presets.find(p => p.id === presetId);
    if (selectedPreset) {
      setSettings(selectedPreset.settings);
      storage.saveActivePresetId(presetId);
    }
  };

  const handleSaveAsPreset = () => {
    if (!presetName) return;
    
    const newPreset: TimerPreset = {
      id: Date.now().toString(),
      name: presetName,
      settings,
      isDefault: false,
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    storage.savePresets(updatedPresets);
    setPresetName('');
  };

  const handleDeletePreset = () => {
    if (!selectedPresetId) return;
    const preset = presets.find(p => p.id === selectedPresetId);
    if (!preset || preset.isDefault) return;

    const updatedPresets = presets.filter(p => p.id !== selectedPresetId);
    setPresets(updatedPresets);
    storage.savePresets(updatedPresets);
    setSelectedPresetId('');
  };

  const handleSave = () => {
    storage.saveCurrentSettings(settings);
    onSave(settings);
  };

  return (
    <SettingsContainer>
      <SettingsGroup>
        <SettingsTitle>プリセット</SettingsTitle>
        <Select value={selectedPresetId} onChange={handlePresetChange}>
          <option value="">カスタム設定</option>
          {presets.map(preset => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </Select>
      </SettingsGroup>

      <SettingsGroup>
        <SettingsTitle>タイマー設定</SettingsTitle>
        <InputGroup>
          <Label>総作業時間（分）</Label>
          <Input
            type="number"
            min="60"
            max="720"
            value={settings.totalWorkTime / 60}
            onChange={e => setSettings({
              ...settings,
              totalWorkTime: Number(e.target.value) * 60
            })}
          />
        </InputGroup>

        <InputGroup>
          <Label>休憩間隔（分）</Label>
          <Input
            type="number"
            min="15"
            max="120"
            value={settings.breakInterval / 60}
            onChange={e => setSettings({
              ...settings,
              breakInterval: Number(e.target.value) * 60
            })}
          />
        </InputGroup>

        <InputGroup>
          <Label>休憩時間（分）</Label>
          <Input
            type="number"
            min="1.5"
            max="120"
            step="0.5"
            value={settings.breakDuration / 60}
            onChange={e => setSettings({
              ...settings,
              breakDuration: Number(e.target.value) * 60
            })}
          />
        </InputGroup>

        <InputGroup>
          <Label>
            <Checkbox
              type="checkbox"
              checked={settings.autoStartAfterBreak}
              onChange={e => setSettings({
                ...settings,
                autoStartAfterBreak: e.target.checked
              })}
            />
            休憩後に自動開始
          </Label>
        </InputGroup>

        <InputGroup>
          <Label>
            <Checkbox
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={e => setSettings({
                ...settings,
                soundEnabled: e.target.checked
              })}
            />
            通知音を有効にする
          </Label>
        </InputGroup>
      </SettingsGroup>

      <SettingsGroup>
        <SettingsTitle>プリセットとして保存</SettingsTitle>
        <InputGroup>
          <Input
            type="text"
            placeholder="プリセット名"
            value={presetName}
            onChange={e => setPresetName(e.target.value)}
          />
          <Button onClick={handleSaveAsPreset}>保存</Button>
        </InputGroup>
      </SettingsGroup>

      <Button variant="primary" onClick={handleSave}>
        設定を保存
      </Button>
      <Button variant="secondary" onClick={onClose}>
        キャンセル
      </Button>
      {selectedPresetId && !presets.find(p => p.id === selectedPresetId)?.isDefault && (
        <Button variant="danger" onClick={handleDeletePreset}>
          プリセットを削除
        </Button>
      )}
    </SettingsContainer>
  );
}; 