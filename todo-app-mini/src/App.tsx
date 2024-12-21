import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import TodoList from './components/TodoList';
import NotificationList from './components/NotificationList';
import WorkSessionTimer from './components/WorkSessionTimer';
import WorkSessionSettingsModal from './components/WorkSessionSettingsModal';
import { useWorkSessionStore } from './store/workSessionStore';

const App = () => {
  const [activeTab, setActiveTab] = useState<'todo' | 'notifications' | 'work'>('todo');
  const [showWorkSettings, setShowWorkSettings] = useState(false);
  const { loadSettings } = useWorkSessionStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'todo':
        return <TodoList />;
      case 'notifications':
        return <NotificationList />;
      case 'work':
        return (
          <View style={styles.workContainer}>
            <WorkSessionTimer />
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowWorkSettings(true)}
            >
              <Text style={styles.settingsButtonText}>作業時間の設定</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderContent()}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'todo' && styles.activeTab]}
          onPress={() => setActiveTab('todo')}
        >
          <Text
            style={[styles.tabText, activeTab === 'todo' && styles.activeTabText]}
          >
            タスク
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'notifications' && styles.activeTabText,
            ]}
          >
            通知
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'work' && styles.activeTab]}
          onPress={() => setActiveTab('work')}
        >
          <Text
            style={[styles.tabText, activeTab === 'work' && styles.activeTabText]}
          >
            作業時間
          </Text>
        </TouchableOpacity>
      </View>
      <WorkSessionSettingsModal
        visible={showWorkSettings}
        onClose={() => setShowWorkSettings(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  workContainer: {
    flex: 1,
  },
  settingsButton: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default App; 