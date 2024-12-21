import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { RepeatType, SoundType } from '../store/todoStore';
import { useTheme } from '../theme/ThemeContext';
import { Theme } from '../theme/types';

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (reminder: {
    date: number;
    repeatType: RepeatType;
    soundType: SoundType;
  }) => void;
  initialReminder?: {
    date: number;
    repeatType: RepeatType;
    soundType: SoundType;
  };
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  visible,
  onClose,
  onSave,
  initialReminder,
}) => {
  const [date, setDate] = useState(
    initialReminder ? new Date(initialReminder.date) : new Date()
  );
  const [repeatType, setRepeatType] = useState<RepeatType>(
    initialReminder?.repeatType || 'none'
  );
  const [soundType, setSoundType] = useState<SoundType>(
    initialReminder?.soundType || 'default'
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();

  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, []);

  const handleSave = useCallback(() => {
    onSave({
      date: date.getTime(),
      repeatType,
      soundType,
    });
    onClose();
  }, [date, repeatType, soundType, onSave, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles(theme).container}>
        <View style={styles(theme).content}>
          <Text style={styles(theme).title}>リマインダー設定</Text>

          <View style={styles(theme).section}>
            <Text style={styles(theme).label}>日時</Text>
            <TouchableOpacity
              style={styles(theme).dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles(theme).dateText}>
                {format(date, 'yyyy/MM/dd HH:mm', { locale: ja })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles(theme).section}>
            <Text style={styles(theme).label}>繰り返し</Text>
            <View style={styles(theme).repeatButtons}>
              {(['none', 'day', 'week', 'month'] as RepeatType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles(theme).repeatButton,
                    repeatType === type && styles(theme).repeatButtonActive,
                  ]}
                  onPress={() => setRepeatType(type)}
                >
                  <Text
                    style={[
                      styles(theme).repeatButtonText,
                      repeatType === type && styles(theme).repeatButtonTextActive,
                    ]}
                  >
                    {type === 'none'
                      ? '繰り返しなし'
                      : type === 'day'
                      ? '毎日'
                      : type === 'week'
                      ? '毎週'
                      : '毎月'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles(theme).section}>
            <Text style={styles(theme).label}>通知音</Text>
            <View style={styles(theme).soundButtons}>
              {(['default', 'bell', 'chime', 'glass'] as SoundType[]).map(
                (type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles(theme).soundButton,
                      soundType === type && styles(theme).soundButtonActive,
                    ]}
                    onPress={() => setSoundType(type)}
                  >
                    <Text style={styles(theme).soundIcon}>
                      {type === 'default'
                        ? '🔔'
                        : type === 'bell'
                        ? '🛎️'
                        : type === 'chime'
                        ? '🎵'
                        : '🔊'}
                    </Text>
                    <Text
                      style={[
                        styles(theme).soundButtonText,
                        soundType === type && styles(theme).soundButtonTextActive,
                      ]}
                    >
                      {type === 'default'
                        ? 'デフォルト'
                        : type === 'bell'
                        ? 'ベル'
                        : type === 'chime'
                        ? 'チャイム'
                        : 'クリスタル'}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          <View style={styles(theme).buttons}>
            <TouchableOpacity
              style={[styles(theme).button, styles(theme).cancelButton]}
              onPress={onClose}
            >
              <Text style={styles(theme).cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles(theme).button, styles(theme).saveButton]}
              onPress={handleSave}
            >
              <Text style={styles(theme).saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.modal.overlay,
    },
    content: {
      backgroundColor: theme.modal.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      color: theme.text,
    },
    section: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.text,
    },
    dateButton: {
      backgroundColor: theme.button.background,
      padding: 12,
      borderRadius: 8,
    },
    dateText: {
      fontSize: 16,
      textAlign: 'center',
      color: theme.text,
    },
    repeatButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4,
    },
    repeatButton: {
      flex: 1,
      minWidth: '45%',
      margin: 4,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.button.background,
    },
    repeatButtonActive: {
      backgroundColor: theme.primary,
    },
    repeatButtonText: {
      fontSize: 14,
      textAlign: 'center',
      color: theme.text,
    },
    repeatButtonTextActive: {
      color: theme.primaryText,
    },
    soundButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4,
    },
    soundButton: {
      flex: 1,
      minWidth: '45%',
      margin: 4,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.button.background,
      alignItems: 'center',
    },
    soundButtonActive: {
      backgroundColor: theme.primary,
    },
    soundIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    soundButtonText: {
      fontSize: 14,
      textAlign: 'center',
      color: theme.text,
    },
    soundButtonTextActive: {
      color: theme.primaryText,
    },
    buttons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    button: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    cancelButton: {
      backgroundColor: theme.button.background,
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    cancelButtonText: {
      color: theme.text,
      textAlign: 'center',
      fontSize: 16,
    },
    saveButtonText: {
      color: theme.primaryText,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default ReminderModal; 