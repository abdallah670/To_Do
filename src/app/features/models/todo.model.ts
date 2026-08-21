export interface ApiResponse<T> {
  data: T;
}

export interface Todo {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
  due_at: string;
}

export interface TodoCreate {
  title: string;
  description: string;
  is_completed: boolean;
  due_at: string;
}

export interface TodoUpdate {
  is_completed: boolean;
}
