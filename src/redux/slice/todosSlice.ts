import { createSlice, nanoid, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { todoApiClient, ApiTodo } from '../../api/todoApi';

export type Todo = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

type TodosState = {
  items: Todo[];
  setFilter: 'all' | 'completed' | 'incomplete';
  searchTerm: string;
  loading: boolean;
  error: string | null;
};

const initialState: TodosState = {
  items: [],
  setFilter: 'all',
  searchTerm: '',
  loading: false,
  error: null,
};

type AddTodoPayload = {
  title: string;
  description: string;
};

type UpdateTodoPayload = {
  id: string;
  title: string;
  description: string;
};

// Async Thunks
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { rejectWithValue }) => {
    try {
      const data = await todoApiClient.fetchTodos();
      return data.map(todo => ({
        id: String(todo.id),
        title: todo.title,
        description: '',
        completed: todo.completed,
      }));
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch todos');
    }
  }
);

export const createTodo = createAsyncThunk(
  'todos/createTodo',
  async ({ title, description }: { title: string; description: string }, { rejectWithValue }) => {
    try {
      const data = await todoApiClient.createTodo(title);
      return {
        id: String(data.id),
        title: data.title,
        description,
        completed: data.completed,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create todo');
    }
  }
);

export const updateTodoAsync = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, title, description, completed }: { id: string; title: string; description: string; completed: boolean }, { rejectWithValue }) => {
    try {
      const data = await todoApiClient.updateTodo(id, title, completed);
      return {
        id: String(data.id),
        title: data.title,
        description,
        completed: data.completed,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update todo');
    }
  }
);

export const deleteTodoAsync = createAsyncThunk(
  'todos/deleteTodo',
  async (id: string, { rejectWithValue }) => {
    try {
      await todoApiClient.deleteTodo(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete todo');
    }
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<AddTodoPayload>) => {
      const { title, description } = action.payload;
      state.items.unshift({
        id: nanoid(),
        title: title.trim(),
        description: description.trim(),
        completed: false,
      });
    },
    updateTodo: (state, action: PayloadAction<UpdateTodoPayload>) => {
      const { id, title, description } = action.payload;
      const target = state.items.find(todo => todo.id === id);
      if (!target) {
        return;
      }

      target.title = title.trim();
      target.description = description.trim();
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const target = state.items.find(todo => todo.id === action.payload);
      if (!target) {
        return;
      }

      target.completed = !target.completed;
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(todo => todo.id !== action.payload);
    },
    setFilter: (state, action: PayloadAction<'all' | 'completed' | 'incomplete'>) => {
      state.setFilter = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Todos
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Todo
    builder
      .addCase(createTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Todo
    builder
      .addCase(updateTodoAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTodoAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(todo => todo.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTodoAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Todo
    builder
      .addCase(deleteTodoAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTodoAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(todo => todo.id !== action.payload);
      })
      .addCase(deleteTodoAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addTodo, updateTodo, toggleTodo, deleteTodo , setFilter, setSearchTerm } = todosSlice.actions;
export default todosSlice.reducer;
