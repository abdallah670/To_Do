import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Todo, TodoCreate, TodoUpdate, ApiResponse } from '../models/todo.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'https://huma-volve.com/api/todos';

  constructor(private http: HttpClient) {}

  getTodos(): Observable<Todo[]> {
    return this.http.get<ApiResponse<Todo[]>>(this.apiUrl).pipe(
      map(res => res.data ?? (res as any))
    );
  }

  createTodo(todo: TodoCreate): Observable<Todo> {
    return this.http.post<ApiResponse<Todo>>(this.apiUrl, todo).pipe(
      map(res => res.data ?? (res as any))
    );
  }

  updateTodo(id: number, todo: TodoCreate): Observable<Todo> {
    return this.http.put<ApiResponse<Todo>>(`${this.apiUrl}/${id}`, todo).pipe(
      map(res => res.data ?? (res as any))
    );
  }

  completeTodo(id: number): Observable<Todo> {
    const update: TodoUpdate = { is_completed: true };
    return this.http.patch<ApiResponse<Todo>>(`${this.apiUrl}/${id}`, update).pipe(
      map(res => res.data ?? (res as any))
    );
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

