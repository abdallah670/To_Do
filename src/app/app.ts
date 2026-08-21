import { Component } from '@angular/core';
import { CreateTodoComponent } from './features/create-todo/create-todo.component';
import { TodoListComponent } from './features/todo-list/todo-list.component';
import { Todo } from './features/models/todo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CreateTodoComponent, TodoListComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  title = 'todo';
  newlyCreatedTask: Todo | null = null;

  onTaskCreated(task: Todo) {
 
    this.newlyCreatedTask = { ...task };
  }
}

