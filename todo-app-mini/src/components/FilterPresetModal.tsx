import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { FilterCondition, FilterPreset } from '../store/filterStore';

interface FilterPresetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  onLoad: (preset: FilterPreset) => void;
  onDelete: (id: string) => void;
  presets: FilterPreset[];
  currentCondition: FilterCondition;
}

const FilterPresetModal: React.FC<FilterPresetModalProps> = ({
  visible,
  onClose,
  onSave,
  onLoad,
  onDelete,
  presets,
  currentCondition,
}) => {
  const [presetName, setPresetName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSave = () => {
    if (!presetName.trim()) {
      Alert.alert('エラー', 'プリセット名を入力してください。');
      return;
    }
    onSave(presetName.trim());
    setPresetName('');
    setShowSaveForm(false);
  };

  const handleDelete = (preset: FilterPreset) => {
    Alert.alert(
      'プリセットの削除',
      `"${preset.name}"を削除しますか？`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => onDelete(preset.id),
        },
      ],
    );
  };

  const getConditionSummary = (condition: FilterCondition) => {
    const parts: string[] = [];

    if (condition.dateRange) {
      parts.push(`期間: ${format(condition.dateRange.startDate, 'M/d')} - ${format(condition.dateRange.endDate, 'M/d')}`);
    }
    if (condition.soundType) {
      parts.push(`通知音: ${condition.soundType}`);
    }
    if (condition.repeatType) {
      parts.push(`繰り返し: ${condition.repeatType === 'none' ? '一回のみ' : condition.repeatType}`);
    }

    return parts.join(' / ') || '条件なし';
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
          <Text style={styles.title}>フィルタープリセット</Text>

          {showSaveForm ? (
            <View style={styles.saveForm}>
              <Text style={styles.label}>現在の条件を保存</Text>
              <Text style={styles.conditionSummary}>
                {getConditionSummary(currentCondition)}
              </Text>
              <TextInput
                style={styles.input}
                value={presetName}
                onChangeText={setPresetName}
                placeholder="プリセット名を入力"
                maxLength={30}
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setPresetName('');
                    setShowSaveForm(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowSaveForm(true)}
              >
                <Text style={styles.addButtonText}>+ 現在の条件を保存</Text>
              </TouchableOpacity>

              <ScrollView style={styles.presetList}>
                {presets.map(preset => (
                  <View key={preset.id} style={styles.presetItem}>
                    <View style={styles.presetInfo}>
                      <Text style={styles.presetName}>{preset.name}</Text>
                      <Text style={styles.presetCondition}>
                        {getConditionSummary(preset.condition)}
                      </Text>
                      <Text style={styles.presetDate}>
                        {format(preset.createdAt, 'yyyy/MM/dd HH:mm', { locale: ja })}
                      </Text>
                    </View>
                    <View style={styles.presetActions}>
                      <TouchableOpacity
                        style={[styles.presetButton, styles.loadButton]}
                        onPress={() => onLoad(preset)}
                      >
                        <Text style={styles.loadButtonText}>読込</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.presetButton, styles.deleteButton]}
                        onPress={() => handleDelete(preset)}
                      >
                        <Text style={styles.deleteButtonText}>削除</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          {!showSaveForm && (
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  presetList: {
    maxHeight: '70%',
  },
  presetItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  presetInfo: {
    marginBottom: 8,
  },
  presetName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  presetCondition: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  presetDate: {
    fontSize: 12,
    color: '#999',
  },
  presetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  loadButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  loadButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  saveForm: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  conditionSummary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  closeButton: {
    backgroundColor: '#F2F2F7',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButtonText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default FilterPresetModal; 