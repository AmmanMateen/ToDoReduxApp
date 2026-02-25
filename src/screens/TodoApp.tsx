import { FlatList, KeyboardAvoidingView, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native'
import React, { useMemo, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store/store';
import { addTodo, deleteTodo, Todo, toggleTodo, updateTodo, setFilter, setSearchTerm, fetchTodos, createTodo, updateTodoAsync, deleteTodoAsync } from '../redux/slice/todosSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

const TodoApp = () => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector((state: RootState) => state.todos.items);
  const currentFilter = useSelector((state: RootState) => state.todos.setFilter);
  const searchTerm = useSelector((state: RootState) => state.todos.searchTerm);
  const loading = useSelector((state: RootState) => state.todos.loading);
  const error = useSelector((state: RootState) => state.todos.error);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const isEditing = editingId !== null;

  // Fetch todos on component mount
  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  let filteredTodos = todos;

  // Apply filter
  switch (currentFilter) {
    case 'completed':
      filteredTodos = filteredTodos.filter(todo => todo.completed);
      break;
    case 'incomplete':
      filteredTodos = filteredTodos.filter(todo => !todo.completed);
      break;
    case 'all':
    default:
      break;
  }

  // Apply search
  if (searchTerm && searchTerm.trim()) {
    const lowerSearch = searchTerm.toLowerCase();

    filteredTodos = filteredTodos.filter(todo =>
      todo.title.toLowerCase().includes(lowerSearch) ||
      todo.description.toLowerCase().includes(lowerSearch)
    );
  }

  const onSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    if (isEditing && editingId) {
      const targetTodo = todos.find(t => t.id === editingId);
      if (targetTodo) {
        dispatch(
          updateTodoAsync({
            id: editingId,
            title: trimmedTitle,
            description,
            completed: targetTodo.completed,
          }),
        );
      }
    } else {
      dispatch(
        createTodo({
          title: trimmedTitle,
          description,
        }),
      );
    }

    setTitle('');
    setDescription('');
    setEditingId(null);
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setTitle(todo.title);
    setDescription(todo.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.heading}>Todo Application</Text>
        <View style={styles.formCard}>
          <TextInput
            placeholder="Search todos..."
            placeholderTextColor="#6b7280"
            value={searchTerm}
            onChangeText={(text) => dispatch(setSearchTerm(text))}
            style={styles.input}
          />
          <TextInput
            placeholder="Title"
            placeholderTextColor="#6b7280"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Description"
            placeholderTextColor="#6b7280"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.descriptionInput]}
            multiline
          />
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={onSave}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isEditing ? 'Update Todo' : 'Add Todo'}
                </Text>
              )}
            </Pressable>
            {isEditing ? (
              <Pressable style={styles.secondaryButton} onPress={cancelEdit}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
            ) : null}
          </View>

          {error && (
            <Text style={styles.errorText}>❌ {error}</Text>
          )}
        </View>

        <View style={styles.filterContainer}>
          <Pressable
            style={[
              styles.filterButton,
              currentFilter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => dispatch(setFilter('all'))}>
            <Text
              style={[
                styles.filterText,
                currentFilter === 'all' && styles.filterTextActive,
              ]}>
              All
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              currentFilter === 'incomplete' && styles.filterButtonActive,
            ]}
            onPress={() => dispatch(setFilter('incomplete'))}>
            <Text
              style={[
                styles.filterText,
                currentFilter === 'incomplete' && styles.filterTextActive,
              ]}>
              Incomplete
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              currentFilter === 'completed' && styles.filterButtonActive,
            ]}
            onPress={() => dispatch(setFilter('completed'))}>
            <Text
              style={[
                styles.filterText,
                currentFilter === 'completed' && styles.filterTextActive,
              ]}>
              Completed
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={filteredTodos}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading todos...</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>No todos yet. Add one above.</Text>
            )
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.todoCard}>
              <View style={styles.todoInfo}>
                <Text
                  style={[
                    styles.todoTitle,
                    item.completed ? styles.completedText : null,
                  ]}>
                  {item.title}
                </Text>
                {item.description ? (
                  <Text
                    style={[
                      styles.todoDescription,
                      item.completed ? styles.completedText : null,
                    ]}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <View style={styles.todoActions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => dispatch(toggleTodo(item.id))}>
                  <Text style={styles.actionText}>
                    {item.completed ? 'Undo' : 'Done'}
                  </Text>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => startEdit(item)}>
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    if (editingId === item.id) {
                      cancelEdit();
                    }
                    dispatch(deleteTodoAsync(item.id));
                  }}>
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default TodoApp

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    marginBottom: 10,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  todoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  todoInfo: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  todoDescription: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  todoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  deleteText: {
    color: '#b91c1c',
  },
});