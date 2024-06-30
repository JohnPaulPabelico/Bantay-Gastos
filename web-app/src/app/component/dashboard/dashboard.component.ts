import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from 'src/app/shared/auth.service';
import { ExpenseService } from 'src/app/shared/expense.service';
import { IncomeService } from 'src/app/shared/income.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  expenseData: any[] = [];
  incomeData: any[] = [];
  uid: string | null = null;
  totalExpenses: number = 0;
  totalIncome: number = 0;

  constructor(
    private auth: AuthService,
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private fireAuth: AngularFireAuth
  ) {}

  calculateTotalExpensesAndIncome() {
    this.totalExpenses = this.expenseData.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );

    this.totalIncome = this.incomeData.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );

    console.log(
      'Expenses: ' + this.totalExpenses,
      'Income: ' + this.totalIncome
    );
  }

  getExpenseIncome() {
    console.log('User ID: ' + this.uid);
    if (!this.uid) {
      console.error('Not currently signed ins');
      return;
    }

    this.expenseService.readExpense(this.uid).subscribe((expenses: any[]) => {
      this.expenseData = expenses;
      console.log('Fetched expenses:', this.expenseData);
    });

    this.incomeService.readIncome(this.uid).subscribe((income: any[]) => {
      this.incomeData = income;
      console.log('Fetched income:', this.incomeData);
      this.calculateTotalExpensesAndIncome();
    });
    // this.incomeService.getIncome();
  }

  async getUserId() {
    try {
      const user = await this.fireAuth.currentUser;
      if (user) {
        this.uid = user.uid;
        console.log('User ID: ' + this.uid);
      } else {
        console.log('No user is currently signed in.');
      }
    } catch (error) {
      console.error('Error getting current user: ', error);
    }
  }

  async ngOnInit(): Promise<void> {
    await this.getUserId();
    this.getExpenseIncome();

    // this.isFilled = true;
  }

  logout() {
    this.auth.logout();
  }
}
