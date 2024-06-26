import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { Expenses } from 'src/app/model/expenses';
import { ExpenseService } from 'src/app/shared/expense.service';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  private unsubscribe$ = new Subject<void>();
  expenses: any[] = [];

  isLoading = false;

  constructor(
    private auth: AuthService,
    private expenseService: ExpenseService,
    private dialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    console.log('DashboardComponent destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadTasks() {
    this.isLoading = true;
    this.expenseService
      .loadExpenses()
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(() => console.log('loadTasks subscription unsubscribed'))
      )
      .subscribe(
        (expenses: any[]) => {
          this.expenses = expenses;
          this.isLoading = false; // Set loading flag to false once tasks are loaded
        },
        (error) => {
          console.error('Error loading tasks:', error);
          this.isLoading = false; // Ensure loading flag is reset on error as well
        }
      );
  }

  logout() {
    this.auth.logout();
  }
}
