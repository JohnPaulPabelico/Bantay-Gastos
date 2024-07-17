import { Component, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Expenses } from 'src/app/model/expenses.model';
import Swal from 'sweetalert2';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { User } from 'src/app/model/user.model';
import { UserService } from 'src/app/shared/user.service';
import * as expensesActions from 'src/app/state/expenses/expenses.actions';
import * as fromExpenses from 'src/app/state/expenses/expenses.selectors';
import { Store } from '@ngrx/store';
import * as fromRoot from 'src/app/state/app.state';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  @ViewChild('expenseForm') expenseForm!: NgForm; // Non-null assertion operator// Reference to the form

  expenses$!: Observable<Expenses[]>;
  status$!: Observable<string>;
  totalAmount$!: Observable<number>;

  constructor(
    private auth: AuthService,
    private breakpointObserver: BreakpointObserver,
    private userService: UserService,
    private store: Store<fromRoot.AppState>
  ) {}

  isSmallScreen = false; // default value
  sideNavMode: 'over' | 'side' = 'side';
  uid: string | undefined;
  userData: User | null = null;

  private unsubscribe$ = new Subject<void>();
  isEditProfile = false;
  isLoading = false;
  isFilled = false;

  selectedValue: string = '';
  categories = [
    { value: 'Food', viewValue: 'Food' },
    { value: 'Entertainment', viewValue: 'Entertainment' },
    { value: 'Grocery', viewValue: 'Grocery' },
    { value: 'Shopping', viewValue: 'Shopping' },
    { value: 'Bills', viewValue: 'Bills' },
    { value: 'Transportation', viewValue: 'Transportation' },
  ];

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

    this.isFilled = true;
    this.getUserInfo();
    this.getExpense();
  }
  getUserInfo() {
    this.isLoading = true;
    if (!this.uid) {
      console.error('Cannot get user info, not currently signed in');
      return;
    }

    this.userService
      .readUser(this.uid)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (user: User) => {
          console.log('User data:', user);
          if (user) {
            this.userData = user;
            this.isLoading = false;
            console.log('Existing User data:', this.userData);
          } else {
            console.warn('No user data found for UID:', this.uid);
          }
        },
        (error) => {
          console.error('Error fetching user info:', error);
        }
      );
  }
  ngOnDestroy(): void {
    console.log('DashboardComponent destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get imageUrl(): string | undefined {
    return this.userData?.imageUrl;
  }

  get displayName(): string | undefined {
    return this.userData?.displayName;
  }

  get emailAddress(): string | undefined {
    return this.userData?.email;
  }

  logout() {
    this.auth.logout();
  }

  addExpense(form: NgForm) {
    this.isFilled = false;
    if (!this.uid) {
      console.error('Cannot add expense, user ID not found');
      return;
    }

    const dateInt = new Date(form.value.date).getTime();
    const date = new Date(form.value.date);

    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    console.log(formattedDate); // Output: "Jun 06, 2024"

    const expensesData: Expenses = {
      title: form.value.Title,
      amount: form.value.Amount,
      dateString: formattedDate,
      category: this.selectedValue,
      dateInt: dateInt,
      date: date,
      description: form.value.description,
      createdById: this.uid,
    };

    if (
      !expensesData.title ||
      !expensesData.amount ||
      !expensesData.date ||
      !expensesData.description ||
      !expensesData.category
    ) {
      this.isFilled = false;
      console.error('All fields are required');
      return;
    }
    this.isFilled = true;
    console.log('Filled in fields:', expensesData);

    this.store.dispatch(expensesActions.addExpense({ expense: expensesData }));
  }

  getExpense() {
    if (!this.uid) {
      console.error('Cannot get expenses, user ID not found');
      return;
    }

    this.store.dispatch(expensesActions.loadExpenses({ uid: this.uid }));
    this.expenses$ = this.store.select(fromExpenses.selectAllExpenses);
    this.status$ = this.store.select(fromExpenses.selectStatus);

    this.totalAmount$ = this.expenses$.pipe(
      map((expenses: any[]) =>
        expenses.reduce(
          (accumulator, currentValue) => accumulator + currentValue.amount,
          0
        )
      )
    );
  }

  editProfile() {
    this.isEditProfile = !this.isEditProfile;
    console.log('Edit profile:', this.isEditProfile);
  }

  deleteExpense(id: string) {
    if (!id) {
      console.error('Cannot delete expense without ID');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!',
      backdrop: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.dispatch(expensesActions.deleteExpense({ id }));
        Swal.fire({
          title: 'Expense deleted!',
          icon: 'success',
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          },
        });
      }
    });
  }
}
