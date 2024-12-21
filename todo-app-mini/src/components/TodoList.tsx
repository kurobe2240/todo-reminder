import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useTodoStore, Category, Priority } from '../store/todoStore';
import TodoItem from './TodoItem';

const TodoList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'category'>('date');

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
    <View style={styles.filterRow}>
      <TouchableOpacity
        style={[styles.filterButton, !selectedCategory && styles.filterButtonActive]}
        onPress={() => setSelectedCategory(null)}
      >
        <Text style={[styles.filterText, !selectedCategory && styles.filterTextActive]}>
          全て
        </Text>
      </TouchableOpacity>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.filterButton, selectedCategory === category && styles.filterButtonActive]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[styles.filterText, selectedCategory === category && styles.filterTextActive]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPriorityFilter = () => (
    <View style={styles.filterRow}>
      <TouchableOpacity
        style={[styles.filterButton, !selectedPriority && styles.filterButtonActive]}
        onPress={() => setSelectedPriority(null)}
      >
        <Text style={[styles.filterText, !selectedPriority && styles.filterTextActive]}>
          全て
        </Text>
      </TouchableOpacity>
      {(['high', 'medium', 'low'] as Priority[]).map((priority) => (
        <TouchableOpacity
          key={priority}
          style={[styles.filterButton, selectedPriority === priority && styles.filterButtonActive]}
          onPress={() => setSelectedPriority(priority)}
        >
          <Text style={[styles.filterText, selectedPriority === priority && styles.filterTextActive]}>
            {priority}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSortButtons = () => (
    <View style={styles.filterRow}>
      <TouchableOpacity
        style={[styles.filterButton, sortBy === 'date' && styles.filterButtonActive]}
        onPress={() => setSortBy('date')}
      >
        <Text style={[styles.filterText, sortBy === 'date' && styles.filterTextActive]}>
          日付順
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, sortBy === 'priority' && styles.filterButtonActive]}
        onPress={() => setSortBy('priority')}
      >
        <Text style={[styles.filterText, sortBy === 'priority' && styles.filterTextActive]}>
          優先度順
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, sortBy === 'category' && styles.filterButtonActive]}
        onPress={() => setSortBy('category')}
      >
        <Text style={[styles.filterText, sortBy === 'category' && styles.filterTextActive]}>
          カテゴリ順
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderCategoryFilter()}
      {renderPriorityFilter()}
      {renderSortButtons()}
      <FlatList
        data={filteredTodos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F2F2F7',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#000',
  },
  filterTextActive: {
    color: '#fff',
  },
});

export default React.memo(TodoList); 