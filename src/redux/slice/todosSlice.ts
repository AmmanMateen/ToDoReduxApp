import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

export type Todo = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

type TodosState = {
  items: Todo[];
  setFilter: 'all' | 'completed' | 'incomplete';
};

const initialState: TodosState = {
  items: [],
  setFilter: 'all',
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
    }
  },
});

export const { addTodo, updateTodo, toggleTodo, deleteTodo , setFilter } = todosSlice.actions;
export default todosSlice.reducer;
