import { UserService } from 'src/app/shared/user.service';
import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { ExpenseService } from 'src/app/shared/expense.service';
import { IncomeService } from 'src/app/shared/income.service';
import { Subject, combineLatest, takeUntil, tap } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { groupBy } from 'lodash';
Chart.register(...registerables);
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { User } from 'src/app/model/users';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  expenseData: any[] = [];
  incomeData: any[] = [];
  userData: User | null = null;
  uid: string | undefined;
  totalExpenses: number = 0;
  totalIncome: number = 0;
  totalBalance: number = 0;

  isSmallScreen = false; // default value
  sideNavMode: 'over' | 'side' = 'side';

  isEditProfile = false;
  isLoading = true;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private breakpointObserver: BreakpointObserver,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.uid = this.auth.getUserId();
    console.log('User ID: ' + this.uid);
    if (!this.uid) {
      console.error('Not currently signed in');
      return;
    }

    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.Handset])
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(() => console.log('breakpoint subscription unsubscribed'))
      )
      .subscribe((result) => {
        this.isSmallScreen = result.matches;
        this.sideNavMode = result.matches ? 'over' : 'side';
      });

    this.getExpenseIncome();
    this.getUserInfo();
  }

  logout() {
    this.auth.logout();
  }

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

  getUserInfo() {
    if (!this.uid) {
      console.error('Cannot get user info, not currently signed in');
      return;
    }

    this.userService
      .readUser(this.uid)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (user: User) => {
          // Ensure 'user' is typed as an object, 'any' should be changed to the actual type of your user object
          console.log('User data:', user); // Log user data to verify structure
          if (user) {
            this.userData = user;
            console.log('Existing User data:', this.userData); // Should not show error now
          } else {
            console.warn('No user data found for UID:', this.uid);
          }
        },
        (error) => {
          console.error('Error fetching user info:', error);
        }
      );
  }

  get displayName(): string | undefined {
    return this.userData?.displayName;
  }

  get imageUrl(): string | undefined {
    return this.userData?.imageUrl;
  }

  get emailAddress(): string | undefined {
    return this.userData?.email;
  }

  getExpenseIncome() {
    this.isLoading = true;
    if (!this.uid) {
      console.error('Cannot get expenses or income, not currently signed in');
      return;
    }

    combineLatest([
      this.expenseService.readExpense(this.uid),
      this.incomeService.readIncome(this.uid),
    ])
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(() => console.log('getExpenseIncome subscription unsubscribed'))
      )
      .subscribe({
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
  }

  editProfile() {
    this.isEditProfile = !this.isEditProfile;
    console.log('Edit profile:', this.isEditProfile);
  }

  RenderChart(
    monthlyExpenseTotals: { monthYear: string; totalAmount: number }[],
    monthlyIncomeTotals: { monthYear: string; totalAmount: number }[]
  ) {
    const expensesAmount = monthlyExpenseTotals.map((item) => item.totalAmount);
    const incomeAmount = monthlyIncomeTotals.map((item) => item.totalAmount);
    const expensesLabels = monthlyExpenseTotals.map((item) => item.monthYear);
    const incomeLabels = monthlyIncomeTotals.map((item) => item.monthYear);

    new Chart('expensesChart', {
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

    new Chart('incomeChart', {
      type: 'line',
      data: {
        labels: incomeLabels,
        datasets: [
          {
            label: 'Income',
            data: incomeAmount,
            backgroundColor: 'rgba(96, 160, 0, 0.2)',
            borderColor: 'rgba(96, 160, 0, 1)',
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

  ngOnDestroy(): void {
    console.log('DashboardComponent destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
