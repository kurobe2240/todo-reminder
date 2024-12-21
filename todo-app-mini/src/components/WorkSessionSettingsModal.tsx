import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useWorkSessionStore, WorkSessionSettings } from '../store/workSessionStore';
import WorkSessionPresetModal from './WorkSessionPresetModal';

interface WorkSessionSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const WorkSessionSettingsModal: React.FC<WorkSessionSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const { settings, updateSettings } = useWorkSessionStore();
  const [localSettings, setLocalSettings] = useState<WorkSessionSettings>(settings);
  const [presetModalVisible, setPresetModalVisible] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(localSettings);
    onClose();
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

  const handleSliderChange = (key: keyof WorkSessionSettings) => (value: number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>作業時間の設定</Text>

            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setPresetModalVisible(true)}
            >
              <Text style={styles.presetButtonText}>プリセットを選択</Text>
            </TouchableOpacity>

            <ScrollView style={styles.scrollView}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>総作業時間</Text>
                <Text style={styles.durationText}>
                  {formatDuration(localSettings.totalDuration)}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={60}
                  maximumValue={720}
                  step={30}
                  value={localSettings.totalDuration}
                  onValueChange={handleSliderChange('totalDuration')}
                  minimumTrackTintColor="#007AFF"
                  maximumTrackTintColor="#DEDEDE"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>1時間</Text>
                  <Text style={styles.sliderLabel}>12時間</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>休憩間隔</Text>
                <Text style={styles.durationText}>
                  {formatDuration(localSettings.breakInterval)}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={15}
                  maximumValue={120}
                  step={5}
                  value={localSettings.breakInterval}
                  onValueChange={handleSliderChange('breakInterval')}
                  minimumTrackTintColor="#007AFF"
                  maximumTrackTintColor="#DEDEDE"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>15分</Text>
                  <Text style={styles.sliderLabel}>2時間</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>休憩時間</Text>
                <Text style={styles.durationText}>
                  {formatDuration(localSettings.breakDuration)}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1.5}
                  maximumValue={120}
                  step={1.5}
                  value={localSettings.breakDuration}
                  onValueChange={handleSliderChange('breakDuration')}
                  minimumTrackTintColor="#007AFF"
                  maximumTrackTintColor="#DEDEDE"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>1分30秒</Text>
                  <Text style={styles.sliderLabel}>2時間</Text>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>
                    休憩後に自動で作業を開始
                  </Text>
                  <Switch
                    value={localSettings.autoStart}
                    onValueChange={(value: boolean) =>
                      setLocalSettings(prev => ({ ...prev, autoStart: value }))
                    }
                  />
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>通知音を鳴らす</Text>
                  <Switch
                    value={localSettings.soundEnabled}
                    onValueChange={(value: boolean) =>
                      setLocalSettings(prev => ({ ...prev, soundEnabled: value }))
                    }
                  />
                </View>
              </View>
            </ScrollView>

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
        </View>
      </Modal>

      <WorkSessionPresetModal
        visible={presetModalVisible}
        onClose={() => setPresetModalVisible(false)}
      />
    </>
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
  presetButton: {
    backgroundColor: '#5856D6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  presetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  scrollView: {
    maxHeight: '60%',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  durationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sliderLabel: {
    color: '#666',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WorkSessionSettingsModal; 