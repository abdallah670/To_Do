import { Component, inject, OnInit, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../services/todo.service';
import { Todo, TodoCreate } from '../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit, OnChanges {
  private todoService = inject(TodoService);

  @Input() newTask: Todo | null = null;

  todos = signal<Todo[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  completingTasks = new Set<number>();
  deletingTasks = new Set<number>();
  updatingTasks = new Set<number>();

  editingTaskId: number | null = null;
  editForm: Partial<Todo> = {};

  ngOnInit() {
    this.isLoading.set(true);
    this.todoService.getTodos().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : [];
        this.todos.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load tasks. Please check your connection and try again.');
        this.isLoading.set(false);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const change = changes['newTask'];
    if (change && !change.firstChange && change.currentValue) {
      const addedTask = change.currentValue as Todo;
      const alreadyExists = this.todos().some(t => t.id === addedTask.id);
      if (!alreadyExists) {
        this.todos.update(current => [addedTask, ...current]);
      }
    }
  }

  startEdit(task: Todo) {
    this.editingTaskId = task.id;
    let formattedDate = '';
    if (task.due_at) {
      const d = new Date(task.due_at);
      if (!isNaN(d.getTime())) {
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        formattedDate = d.toISOString().slice(0, 16);
      }
    }

    this.editForm = {
      title: task.title,
      description: task.description,
      due_at: formattedDate as any
    };
  }

  cancelEdit() {
    this.editingTaskId = null;
    this.editForm = {};
  }

  saveEdit(task: Todo) {
    if (!this.editForm.title?.trim()) {
      return;
    }
    
    this.updatingTasks.add(task.id);
    
    const updateData: TodoCreate = {
      title: this.editForm.title.trim(),
      description: this.editForm.description || '',
      is_completed: task.is_completed,
      due_at: this.editForm.due_at ? new Date(this.editForm.due_at).toISOString() : ''
    };

    this.todoService.updateTodo(task.id, updateData).subscribe({
      next: (updatedTodo) => {
        this.todos.update(current => 
          current.map(t => t.id === task.id ? updatedTodo : t)
        );
        this.updatingTasks.delete(task.id);
        if (this.editingTaskId === task.id) {
          this.editingTaskId = null;
          this.editForm = {};
        }
        this.showToast('Task updated successfully');
      },
      error: () => {
        this.updatingTasks.delete(task.id);
      }
    });
  }

  completeTask(id: number) {
    this.completingTasks.add(id);
    this.todoService.completeTodo(id).subscribe({
      next: (updatedTodo) => {
        this.todos.update(current => 
          current.map(t => t.id === id ? updatedTodo : t)
        );
        this.completingTasks.delete(id);
      },
      error: () => {
        this.completingTasks.delete(id);
      }
    });
  }

  deleteTask(id: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.deletingTasks.add(id);
      this.todoService.deleteTodo(id).subscribe({
        next: () => {
          this.todos.update(current => current.filter(t => t.id !== id));
          this.deletingTasks.delete(id);
          this.showToast('Task deleted successfully');
        },
        error: () => {
          this.deletingTasks.delete(id);
        }
      });
    }
  }

  formatDate(dateString: string): { date: string, time: string } | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  }

  private showToast(message: string) {
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
      const toast = document.createElement('div');
      toast.className = 'toast show align-items-center text-white bg-dark border-0 mb-2';
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      toast.setAttribute('aria-atomic', 'true');
      toast.innerHTML = `
        <div class="d-flex">
          <div class="toast-body">
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      `;
      toastContainer.appendChild(toast);
      
      const closeBtn = toast.querySelector('.btn-close');
      if (closeBtn) {
         closeBtn.addEventListener('click', () => {
           toast.remove();
         });
      }

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  }
}
