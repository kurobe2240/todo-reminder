import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useTodoStore, Category, Priority } from '../store/todoStore';
import { useTheme } from '../theme/ThemeContext';
import { Theme } from '../theme/types';
import TodoItem from './TodoItem';

const TodoList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'category'>('date');
  const { theme } = useTheme();

  const {
    todos,
    categories,
    toggleTodo,
    removeTodo,
    updateTodo,
    setReminder,
    removeReminder,
    filterByCategory,
    filterByPriority,
    sortTodos,
  } = useTodoStore();

  const handleUpdatePriority = useCallback((id: string, priority: Priority) => {
    updateTodo(id, { priority });
  }, [updateTodo]);

  const handleUpdateCategory = useCallback((id: string, category: Category) => {
    updateTodo(id, { category });
  }, [updateTodo]);

  const handleSetReminder = useCallback((id: string, reminder) => {
    setReminder(id, reminder);
  }, [setReminder]);

  const handleRemoveReminder = useCallback((id: string) => {
    removeReminder(id);
  }, [removeReminder]);

  const filteredTodos = React.useMemo(() => {
    let result = todos;
    if (selectedCategory) {
      result = filterByCategory(selectedCategory);
    }
    if (selectedPriority) {
      result = filterByPriority(selectedPriority);
    }
    return sortTodos(sortBy);
  }, [todos, selectedCategory, selectedPriority, sortBy, filterByCategory, filterByPriority, sortTodos]);

  const renderItem = useCallback(({ item }) => (
    <TodoItem
      todo={item}
      onToggle={toggleTodo}
      onRemove={removeTodo}
      onUpdatePriority={handleUpdatePriority}
      onUpdateCategory={handleUpdateCategory}
      onSetReminder={handleSetReminder}
      onRemoveReminder={handleRemoveReminder}
    />
  ), [
    toggleTodo,
    removeTodo,
    handleUpdatePriority,
    handleUpdateCategory,
    handleSetReminder,
    handleRemoveReminder,
  ]);

  const keyExtractor = useCallback((item) => item.id, []);

  const renderCategoryFilter = () => (
    <View style={styles(theme).filterRow}>
      <TouchableOpacity
        style={[
          styles(theme).filterButton,
          !selectedCategory && styles(theme).filterButtonActive
        ]}
        onPress={() => setSelectedCategory(null)}
      >
        <Text style={[
          styles(theme).filterText,
          !selectedCategory && styles(theme).filterTextActive
        ]}>
          全て
        </Text>
      </TouchableOpacity>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles(theme).filterButton,
            selectedCategory === category && styles(theme).filterButtonActive
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[
            styles(theme).filterText,
            selectedCategory === category && styles(theme).filterTextActive
          ]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPriorityFilter = () => (
    <View style={styles(theme).filterRow}>
      <TouchableOpacity
        style={[
          styles(theme).filterButton,
          !selectedPriority && styles(theme).filterButtonActive
        ]}
        onPress={() => setSelectedPriority(null)}
      >
        <Text style={[
          styles(theme).filterText,
          !selectedPriority && styles(theme).filterTextActive
        ]}>
          全て
        </Text>
      </TouchableOpacity>
      {(['high', 'medium', 'low'] as Priority[]).map((priority) => (
        <TouchableOpacity
          key={priority}
          style={[
            styles(theme).filterButton,
            selectedPriority === priority && styles(theme).filterButtonActive
          ]}
          onPress={() => setSelectedPriority(priority)}
        >
          <Text style={[
            styles(theme).filterText,
            selectedPriority === priority && styles(theme).filterTextActive
          ]}>
            {priority}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSortButtons = () => (
    <View style={styles(theme).filterRow}>
      <TouchableOpacity
        style={[
          styles(theme).filterButton,
          sortBy === 'date' && styles(theme).filterButtonActive
        ]}
        onPress={() => setSortBy('date')}
      >
        <Text style={[
          styles(theme).filterText,
          sortBy === 'date' && styles(theme).filterTextActive
        ]}>
          日付順
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles(theme).filterButton,
          sortBy === 'priority' && styles(theme).filterButtonActive
        ]}
        onPress={() => setSortBy('priority')}
      >
        <Text style={[
          styles(theme).filterText,
          sortBy === 'priority' && styles(theme).filterTextActive
        ]}>
          優先度順
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles(theme).filterButton,
          sortBy === 'category' && styles(theme).filterButtonActive
        ]}
        onPress={() => setSortBy('category')}
      >
        <Text style={[
          styles(theme).filterText,
          sortBy === 'category' && styles(theme).filterTextActive
        ]}>
          カテゴリ順
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles(theme).container}>
      {renderCategoryFilter()}
      {renderPriorityFilter()}
      {renderSortButtons()}
      <FlatList
        data={filteredTodos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles(theme).list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    list: {
      padding: 16,
    },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.card,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      backgroundColor: theme.button.background,
    },
    filterButtonActive: {
      backgroundColor: theme.primary,
    },
    filterText: {
      fontSize: 14,
      color: theme.text,
    },
    filterTextActive: {
      color: theme.primaryText,
    },
  });

export default React.memo(TodoList); 