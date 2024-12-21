import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useWorkSessionPresetStore } from '../store/workSessionPresetStore';
import { useWorkSessionStore } from '../store/workSessionStore';

interface WorkSessionPresetModalProps {
  visible: boolean;
  onClose: () => void;
}

const WorkSessionPresetModal: React.FC<WorkSessionPresetModalProps> = ({
  visible,
  onClose,
}) => {
  const { presets, addPreset, removePreset } = useWorkSessionPresetStore();
  const { settings, updateSettings } = useWorkSessionStore();
  const [newPresetName, setNewPresetName] = useState('');

  const handleSelectPreset = async (presetId: string) => {
    const selectedPreset = presets.find(preset => preset.id === presetId);
    if (selectedPreset) {
      await updateSettings(selectedPreset.settings);
      onClose();
    }
  };

  const handleSaveCurrentAsPreset = async () => {
    if (!newPresetName.trim()) {
      Alert.alert('エラー', 'プリセット名を入力してください。');
      return;
    }

    await addPreset(newPresetName.trim(), settings);
    setNewPresetName('');
    Alert.alert('完了', 'プリセットを保存しました。');
  };

  const handleRemovePreset = (presetId: string) => {
    Alert.alert(
      'プリセットの削除',
      '本当にこのプリセットを削除しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await removePreset(presetId);
          },
        },
      ],
    );
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 1) {
      return `${minutes * 60}秒`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins > 0 ? `${mins}分` : ''}`;
    }
    return `${mins}分`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>作業パターンのプリセット</Text>

          <ScrollView style={styles.scrollView}>
            {presets.map(preset => (
              <View key={preset.id} style={styles.presetItem}>
                <View style={styles.presetInfo}>
                  <Text style={styles.presetName}>{preset.name}</Text>
                  <Text style={styles.presetDetails}>
                    作業時間: {formatDuration(preset.settings.totalDuration)}
                    {'\n'}
                    休憩間隔: {formatDuration(preset.settings.breakInterval)}
                    {'\n'}
                    休憩時間: {formatDuration(preset.settings.breakDuration)}
                  </Text>
                </View>
                <View style={styles.presetActions}>
                  <TouchableOpacity
                    style={[styles.button, styles.selectButton]}
                    onPress={() => handleSelectPreset(preset.id)}
                  >
                    <Text style={styles.buttonText}>選択</Text>
                  </TouchableOpacity>
                  {!['pomodoro', 'long-focus', 'short-sprint'].includes(preset.id) && (
                    <TouchableOpacity
                      style={[styles.button, styles.deleteButton]}
                      onPress={() => handleRemovePreset(preset.id)}
                    >
                      <Text style={styles.deleteButtonText}>削除</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <View style={styles.saveNewPreset}>
              <Text style={styles.sectionTitle}>現在の設定をプリセットとして保存</Text>
              <TextInput
                style={styles.input}
                value={newPresetName}
                onChangeText={setNewPresetName}
                placeholder="プリセット名を入力"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveCurrentAsPreset}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.button, styles.closeButton]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: '80%',
  },
  presetItem: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  presetInfo: {
    marginBottom: 10,
  },
  presetName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  presetDetails: {
    color: '#666',
    lineHeight: 20,
  },
  presetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveNewPreset: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#34C759',
    alignSelf: 'flex-end',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#8E8E93',
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WorkSessionPresetModal; 