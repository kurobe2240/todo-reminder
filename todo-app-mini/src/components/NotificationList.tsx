import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  ActionSheetIOS,
  Switch,
  Modal,
} from 'react-native';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import NotificationService, { NotificationInfo, SoundType } from '../services/NotificationService';
import EditNotificationModal from './EditNotificationModal';
import DateRangeModal from './DateRangeModal';
import FilterPresetModal from './FilterPresetModal';
import { useFilterStore, FilterCondition, FilterPreset } from '../store/filterStore';

interface NotificationListProps {
  onRefresh?: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ onRefresh }) => {
  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationInfo | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterCondition, setFilterCondition] = useState<FilterCondition>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);

  const { presets, addPreset, removePreset, loadPresets } = useFilterStore();

  useEffect(() => {
    loadPresets();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notificationList = await NotificationService.getPendingNotifications();
      setNotifications(notificationList.sort((a, b) => a.date.getTime() - b.date.getTime()));
    } catch (error) {
      console.error('通知の取得に失敗しました:', error);
      Alert.alert('エラー', '通知の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleCancelNotification = (notification: NotificationInfo) => {
    Alert.alert(
      '通知のキャンセル',
      'この通知をキャンセルしますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            NotificationService.cancelNotification(notification.id);
            await loadNotifications();
            await NotificationService.updateBadgeCount();
            onRefresh?.();
          },
        },
      ],
    );
  };

  const handleEditNotification = (notification: NotificationInfo) => {
    if (selectionMode) {
      toggleSelection(notification.id);
    } else {
      setSelectedNotification(notification);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    await loadNotifications();
    await NotificationService.updateBadgeCount();
    onRefresh?.();
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (selectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      '通知の一括削除',
      `選択した${selectedIds.size}件の通知を削除しますか？`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            selectedIds.forEach(id => {
              NotificationService.cancelNotification(id);
            });
            setSelectedIds(new Set());
            setSelectionMode(false);
            await loadNotifications();
            await NotificationService.updateBadgeCount();
            onRefresh?.();
          },
        },
      ],
    );
  };

  const applyFilterConditions = () => {
    const newSelectedIds = new Set<string>();
    notifications.forEach(notification => {
      let matches = true;

      // 日付範囲のフィルター
      if (filterCondition.dateRange) {
        const { startDate, endDate } = filterCondition.dateRange;
        if (!isWithinInterval(notification.date, { start: startDate, end: endDate })) {
          matches = false;
        }
      }

      // 通知音のフィルター
      if (filterCondition.soundType && notification.soundType !== filterCondition.soundType) {
        matches = false;
      }

      // 繰り返し設定のフィルター
      if (filterCondition.repeatType) {
        if (filterCondition.repeatType === 'none' && notification.repeatType) {
          matches = false;
        } else if (filterCondition.repeatType !== 'none' && notification.repeatType !== filterCondition.repeatType) {
          matches = false;
        }
      }

      if (matches) {
        newSelectedIds.add(notification.id);
      }
    });
    setSelectedIds(newSelectedIds);
  };

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    setFilterCondition(prev => ({
      ...prev,
      dateRange: { startDate, endDate },
    }));
    setShowDateRangeModal(false);
  };

  const handleSoundSelect = (soundType: SoundType) => {
    setFilterCondition(prev => ({
      ...prev,
      soundType,
    }));
    NotificationService.playSound(soundType);
  };

  const handleRepeatTypeSelect = (repeatType: string) => {
    setFilterCondition(prev => ({
      ...prev,
      repeatType,
    }));
  };

  const handleSavePreset = async (name: string) => {
    await addPreset(name, filterCondition);
    Alert.alert('保存完了', 'フィルタープリセットを保存しました。');
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilterCondition(preset.condition);
    setShowPresetModal(false);
    applyFilterConditions();
  };

  const handleDeletePreset = async (id: string) => {
    await removePreset(id);
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.filterModalContainer}>
        <View style={styles.filterModalContent}>
          <Text style={styles.filterModalTitle}>フィルター条件</Text>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>日付範囲</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowDateRangeModal(true)}
            >
              <Text style={styles.filterButtonText}>
                {filterCondition.dateRange
                  ? `${format(filterCondition.dateRange.startDate, 'M/d')} - ${format(filterCondition.dateRange.endDate, 'M/d')}`
                  : '日付範囲を選択'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>通知音</Text>
            <View style={styles.soundButtons}>
              {(['default', 'tri-tone', 'note', 'aurora'] as SoundType[]).map(sound => (
                <TouchableOpacity
                  key={sound}
                  style={[
                    styles.soundButton,
                    filterCondition.soundType === sound && styles.soundButtonActive,
                  ]}
                  onPress={() => handleSoundSelect(sound)}
                >
                  <Text style={styles.soundButtonText}>{sound}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>繰り返し設定</Text>
            <View style={styles.repeatButtons}>
              {['none', 'day', 'week', 'month'].map(repeat => (
                <TouchableOpacity
                  key={repeat}
                  style={[
                    styles.repeatButton,
                    filterCondition.repeatType === repeat && styles.repeatButtonActive,
                  ]}
                  onPress={() => handleRepeatTypeSelect(repeat)}
                >
                  <Text style={styles.repeatButtonText}>
                    {repeat === 'none' ? '一回のみ' : getRepeatTypeText(repeat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterActionButton, styles.filterPresetButton]}
              onPress={() => {
                setShowPresetModal(true);
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.filterPresetButtonText}>プリセット</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterActionButton, styles.filterClearButton]}
              onPress={() => {
                setFilterCondition({});
                setSelectedIds(new Set());
              }}
            >
              <Text style={styles.filterClearButtonText}>クリア</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterActionButton, styles.filterApplyButton]}
              onPress={() => {
                applyFilterConditions();
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.filterApplyButtonText}>適用</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const getRepeatTypeText = (repeatType?: string) => {
    switch (repeatType) {
      case 'day':
        return '毎日';
      case 'week':
        return '毎週';
      case 'month':
        return '毎月';
      default:
        return '一回のみ';
    }
  };

  const renderItem = ({ item }: { item: NotificationInfo }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        selectedIds.has(item.id) && styles.selectedItem,
      ]}
      onPress={() => handleEditNotification(item)}
      onLongPress={toggleSelectionMode}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationRepeat}>{getRepeatTypeText(item.repeatType)}</Text>
      </View>
      <Text style={styles.notificationDate}>
        {format(item.date, 'M月d日 HH:mm', { locale: ja })}
      </Text>
      <View style={styles.notificationFooter}>
        <Text style={styles.notificationSound}>🔔 {item.soundType}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {selectionMode ? (
        <View style={styles.selectionHeader}>
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionCount}>
              {selectedIds.size}件選択中
            </Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Text style={styles.filterButtonText}>フィルター</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.selectionButtons}>
            <TouchableOpacity
              style={[styles.headerButton, styles.cancelButton]}
              onPress={toggleSelectionMode}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.deleteButton]}
              onPress={handleBulkDelete}
              disabled={selectedIds.size === 0}
            >
              <Text style={[styles.deleteButtonText, selectedIds.size === 0 && styles.disabledText]}>
                削除
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.selectButton}
          onPress={toggleSelectionMode}
        >
          <Text style={styles.selectButtonText}>選択</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadNotifications}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            予定されている通知はありません
          </Text>
        }
      />
      {selectedNotification && (
        <EditNotificationModal
          visible={showEditModal}
          notification={selectedNotification}
          onClose={() => {
            setShowEditModal(false);
            setSelectedNotification(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
      <DateRangeModal
        visible={showDateRangeModal}
        onClose={() => setShowDateRangeModal(false)}
        onApply={handleDateRangeSelect}
      />
      {renderFilterModal()}
      <FilterPresetModal
        visible={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        onSave={handleSavePreset}
        onLoad={handleLoadPreset}
        onDelete={handleDeletePreset}
        presets={presets}
        currentCondition={filterCondition}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionCount: {
    fontSize: 16,
    color: '#666',
  },
  filterButton: {
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  selectionButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  selectButton: {
    alignSelf: 'flex-end',
  },
  selectButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#000',
  },
  deleteButtonText: {
    color: '#fff',
  },
  disabledText: {
    opacity: 0.5,
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: '#E5F1FF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  notificationRepeat: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 8,
  },
  notificationDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  notificationSound: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
  filterModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
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
  soundButtonText: {
    fontSize: 14,
    color: '#000',
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
    color: '#000',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  filterActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filterClearButton: {
    backgroundColor: '#F2F2F7',
  },
  filterApplyButton: {
    backgroundColor: '#007AFF',
  },
  filterClearButtonText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
  },
  filterApplyButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterPresetButton: {
    backgroundColor: '#F2F2F7',
    flex: 1,
  },
  filterPresetButtonText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default NotificationList; 