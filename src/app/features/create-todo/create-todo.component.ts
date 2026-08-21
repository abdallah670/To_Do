import { Component, inject, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TodoService } from '../services/todo.service';
import { Todo } from '../models/todo.model';

@Component({
  selector: 'app-create-todo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-todo.component.html',
  styleUrls: ['./create-todo.component.scss']
})
export class CreateTodoComponent {
  private fb = inject(FormBuilder);
  private todoService = inject(TodoService);

  @Output() taskCreated = new EventEmitter<Todo>();

  isLoading = signal(false);

  todoForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    due_at: ['']
  });

  onSubmit() {
    if (this.todoForm.valid && !this.isLoading()) {
      const formValue = this.todoForm.value;
      
      const newTodo = {
        title: formValue.title!,
        description: formValue.description || '',
        is_completed: false,
        due_at: formValue.due_at ? new Date(formValue.due_at).toISOString() : ''
      };

      this.isLoading.set(true);
      this.todoService.createTodo(newTodo).subscribe({
        next: (createdTodo) => {
          this.isLoading.set(false);
          this.taskCreated.emit(createdTodo);
          this.todoForm.reset({
            title: '',
            description: '',
            due_at: ''
          });
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    } else {
      this.todoForm.markAllAsTouched();
    }
  }
}

