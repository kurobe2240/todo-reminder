import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Todo, Priority, Category } from '../store/todoStore';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import ReminderModal from './ReminderModal';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdatePriority?: (id: string, priority: Priority) => void;
  onUpdateCategory?: (id: string, category: Category) => void;
  onSetReminder?: (id: string, reminder: Todo['reminder']) => void;
  onRemoveReminder?: (id: string) => void;
}

const priorityColors: Record<Priority, string> = {
  high: '#FF3B30',
  medium: '#FF9500',
  low: '#34C759',
};

const categoryIcons: Record<Category, string> = {
  work: '💼',
  personal: '👤',
  shopping: '🛍️',
  other: '📌',
};

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onRemove,
  onUpdatePriority,
  onUpdateCategory,
  onSetReminder,
  onRemoveReminder,
}) => {
  const [showReminderModal, setShowReminderModal] = useState(false);

  const handleToggle = useCallback(() => {
    ReactNativeHapticFeedback.trigger('impactLight');
    onToggle(todo.id);
  }, [todo.id, onToggle]);

  const handleRemove = useCallback(() => {
    ReactNativeHapticFeedback.trigger('notificationWarning');
    onRemove(todo.id);
  }, [todo.id, onRemove]);

  const handlePriorityPress = useCallback(() => {
    if (!onUpdatePriority) return;
    ReactNativeHapticFeedback.trigger('impactMedium');
    const priorities: Priority[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(todo.priority);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
    onUpdatePriority(todo.id, nextPriority);
  }, [todo.id, todo.priority, onUpdatePriority]);

  const handleReminderPress = useCallback(() => {
    if (todo.reminder && onRemoveReminder) {
      ReactNativeHapticFeedback.trigger('impactMedium');
      onRemoveReminder(todo.id);
    } else {
      setShowReminderModal(true);
    }
  }, [todo.id, todo.reminder, onRemoveReminder]);

  const handleSetReminder = useCallback((reminder) => {
    if (onSetReminder) {
      onSetReminder(todo.id, reminder);
    }
  }, [todo.id, onSetReminder]);

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={handleToggle}
        >
          <View style={[styles.checkbox, todo.completed && styles.checked]} />
        </TouchableOpacity>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, todo.completed && styles.completedTitle]}>
              {todo.title}
            </Text>
            <TouchableOpacity
              style={[styles.priorityBadge, { backgroundColor: priorityColors[todo.priority] }]}
              onPress={handlePriorityPress}
            >
              <Text style={styles.priorityText}>{todo.priority}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.categoryText}>
              {categoryIcons[todo.category]} {todo.category}
            </Text>
            <TouchableOpacity
              style={[styles.reminderButton, todo.reminder && styles.reminderButtonActive]}
              onPress={handleReminderPress}
            >
              <Text style={[styles.reminderText, todo.reminder && styles.reminderTextActive]}>
                {todo.reminder ? (
                  `⏰ ${format(todo.reminder.date, 'M/d HH:mm', { locale: ja })}`
                ) : (
                  '⏰ リマインダーを設定'
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemove}
        >
          <Text style={styles.removeText}>削除</Text>
        </TouchableOpacity>
      </View>

      <ReminderModal
        visible={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onSave={handleSetReminder}
        initialReminder={todo.reminder}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButton: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  checked: {
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  reminderButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  reminderButtonActive: {
    backgroundColor: '#007AFF',
  },
  reminderText: {
    fontSize: 12,
    color: '#666',
  },
  reminderTextActive: {
    color: '#fff',
  },
  removeButton: {
    padding: 8,
  },
  removeText: {
    color: '#FF3B30',
    fontSize: 14,
  },
});

export default React.memo(TodoItem); 