import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import NotificationService, { NotificationInfo, SoundType } from '../services/NotificationService';

interface EditNotificationModalProps {
  visible: boolean;
  notification: NotificationInfo;
  onClose: () => void;
  onSave: () => void;
}

const EditNotificationModal: React.FC<EditNotificationModalProps> = ({
  visible,
  notification,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState(notification.date);
  const [repeatType, setRepeatType] = useState(notification.repeatType || 'none');
  const [soundType, setSoundType] = useState<SoundType>(notification.soundType);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = () => {
    NotificationService.cancelNotification(notification.id);
    NotificationService.scheduleNotification(
      notification.id,
      notification.title,
      date,
      repeatType === 'none' ? undefined : repeatType,
      soundType
    );
    onSave();
    onClose();
  };

  const handleSoundSelect = (type: SoundType) => {
    setSoundType(type);
    NotificationService.playSound(type);
  };

  const repeatTypes = [
    { value: 'none', label: '繰り返しなし' },
    { value: 'day', label: '毎日' },
    { value: 'week', label: '毎週' },
    { value: 'month', label: '毎月' },
  ];

  const soundTypes: { value: SoundType; label: string; icon: string }[] = [
    { value: 'default', label: 'デフォルト', icon: '🔔' },
    { value: 'tri-tone', label: 'トライトーン', icon: '🎵' },
    { value: 'note', label: 'ノート', icon: '🎶' },
    { value: 'aurora', label: 'オーロラ', icon: '✨' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.content}>
            <Text style={styles.title}>通知の編集</Text>

            <View style={styles.section}>
              <Text style={styles.label}>日時</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {format(date, 'M月d日 HH:mm', { locale: ja })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>繰り返し</Text>
              <View style={styles.repeatButtons}>
                {repeatTypes.map(({ value, label }) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.repeatButton,
                      repeatType === value && styles.repeatButtonActive,
                    ]}
                    onPress={() => setRepeatType(value)}
                  >
                    <Text
                      style={[
                        styles.repeatButtonText,
                        repeatType === value && styles.repeatButtonTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>通知音</Text>
              <View style={styles.soundButtons}>
                {soundTypes.map(({ value, label, icon }) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.soundButton,
                      soundType === value && styles.soundButtonActive,
                    ]}
                    onPress={() => handleSoundSelect(value)}
                  >
                    <Text style={styles.soundIcon}>{icon}</Text>
                    <Text
                      style={[
                        styles.soundButtonText,
                        soundType === value && styles.soundButtonTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
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
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="spinner"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    textAlign: 'center',
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
    backgroundColor: '#F2F2F7',
  },
  repeatButtonActive: {
    backgroundColor: '#007AFF',
  },
  repeatButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
  repeatButtonTextActive: {
    color: '#fff',
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
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  soundButtonActive: {
    backgroundColor: '#007AFF',
  },
  soundIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  soundButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
  soundButtonTextActive: {
    color: '#fff',
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
    backgroundColor: '#F2F2F7',
  },
  saveButton: {
    backgroundColor: '#007AFF',
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
});

export default EditNotificationModal; 