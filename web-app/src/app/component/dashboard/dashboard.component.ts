import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from 'src/app/shared/auth.service';
import { ExpenseService } from 'src/app/shared/expense.service';
import { IncomeService } from 'src/app/shared/income.service';
import { combineLatest, forkJoin, merge, tap } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { groupBy } from 'lodash';
Chart.register(...registerables);

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
  totalBalance: number = 0;

  isLoading = true;

  constructor(
    private auth: AuthService,
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private fireAuth: AngularFireAuth
  ) {}

  calculateTotal() {
    this.totalExpenses = this.expenseData.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );

    this.totalIncome = this.incomeData.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );

    this.totalBalance = this.totalIncome - this.totalExpenses;

    console.log(
      'Balance: ' + this.totalBalance,
      'Expenses: ' + this.totalExpenses,
      'Income: ' + this.totalIncome
    );
  }

  getExpenseIncome() {
    this.isLoading = true;
    console.log('User ID: ' + this.uid);
    if (!this.uid) {
      console.error('Not currently signed ins');
      return;
    }

    // this.expenseService.readExpense(this.uid).subscribe((expenses: any[]) => {
    //   this.expenseData = expenses;
    //   console.log('Fetched expenses:', this.expenseData);
    // });

    // this.incomeService.readIncome(this.uid).subscribe((income: any[]) => {
    //   this.incomeData = income;
    //   console.log('Fetched income:', this.incomeData);
    //   this.calculateTotalExpensesAndIncome();
    // });

    // merge(
    //   this.expenseService.readExpense(this.uid).pipe(
    //     tap((expenses) => {
    //       this.expenseData = expenses;
    //       console.log('Fetched expenses:', this.expenseData);
    //     })
    //   ),
    //   this.incomeService.readIncome(this.uid).pipe(
    //     tap((income) => {
    //       this.incomeData = income;
    //       console.log('Fetched income:', this.incomeData);
    //     })
    //   )
    // ).subscribe(() => {
    //   this.calculateTotalExpensesAndIncome();
    // });

    combineLatest([
      this.expenseService.readExpense(this.uid),
      this.incomeService.readIncome(this.uid),
    ]).subscribe({
      next: ([expenses, income]) => {
        console.log('Expenses and income fetched successfully.');

        const groupedExpenses = groupBy(expenses, (expense: any) => {
          // Assuming date is in 'Jul 01, 2024' format, extract month and year
          const date = new Date(expense.dateString); // Adjust this based on your date format
          return `${date.getMonth() + 1}-${date.getFullYear()}`;
        });

        const groupedIncome = groupBy(income, (incomeItem: any) => {
          // Assuming date is in 'Jul 01, 2024' format, extract month and year
          const date = new Date(incomeItem.dateString); // Adjust this based on your date format
          return `${date.getMonth() + 1}-${date.getFullYear()}`;
        });

        // Calculate total amounts per month for expenses
        const monthlyExpenseTotals = Object.keys(groupedExpenses).map(
          (monthYear) => {
            const expensesInMonth = groupedExpenses[monthYear];
            const totalAmount = expensesInMonth.reduce(
              (acc: number, expense: any) => acc + expense.amount,
              0
            );
            return { monthYear, totalAmount };
          }
        );

        // Calculate total amounts per month for income
        const monthlyIncomeTotals = Object.keys(groupedIncome).map(
          (monthYear) => {
            const incomeInMonth = groupedIncome[monthYear];
            const totalAmount = incomeInMonth.reduce(
              (acc: number, incomeItem: any) => acc + incomeItem.amount,
              0
            );
            return { monthYear, totalAmount };
          }
        );

        console.log('Monthly expense totals:', monthlyExpenseTotals);
        console.log('Monthly income totals:', monthlyIncomeTotals);

        this.expenseData = expenses;
        console.log('Fetched expenses:', this.expenseData);

        this.incomeData = income;
        console.log('Fetched income:', this.incomeData);
        this.isLoading = false;
        this.calculateTotal();
        this.RenderChart(monthlyExpenseTotals, monthlyIncomeTotals);
      },
      error: (err) => {
        console.error('Error fetching expenses or income:', err);
      },
      complete: () => {
        console.log('Fetching expenses and income completed.');
      },
    });

    // forkJoin({
    //   expenses: this.expenseService.readExpense(this.uid),
    //   income: this.incomeService.readIncome(this.uid),
    // }).subscribe(({ expenses, income }) => {
    //   this.expenseData = expenses;
    //   console.log('Fetched expenses:', this.expenseData);

    //   this.incomeData = income;
    //   console.log('Fetched income:', this.incomeData);

    //   this.calculateTotalExpensesAndIncome();
    // });
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

  RenderChart(
    monthlyExpenseTotals: { monthYear: string; totalAmount: number }[],
    monthlyIncomeTotals: { monthYear: string; totalAmount: number }[]
  ) {
    const expensesAmount = monthlyExpenseTotals.map((item) => item.totalAmount);
    const incomeAmount = monthlyIncomeTotals.map((item) => item.totalAmount);
    const expensesLabels = monthlyExpenseTotals.map((item) => item.monthYear);

    new Chart('myChart', {
      type: 'line',
      data: {
        labels: expensesLabels,
        datasets: [
          {
            label: 'Expenses',
            data: expensesAmount,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
          {
            label: 'Income',
            data: incomeAmount,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
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
