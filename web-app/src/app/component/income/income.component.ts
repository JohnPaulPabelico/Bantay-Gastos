import { Component, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Income } from 'src/app/model/income.model';
import Swal from 'sweetalert2';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UserService } from 'src/app/shared/user.service';
import { User } from 'src/app/model/user.model';
import * as incomeActions from 'src/app/state/income/income.actions';
import * as fromIncome from 'src/app/state/income/income.selectors';
import { Store } from '@ngrx/store';
import * as fromRoot from 'src/app/state/app.state';

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss'],
})
export class IncomeComponent {
  @ViewChild('incomeForm') incomeForm!: NgForm; // Non-null assertion operator// Reference to the form

  income$!: Observable<Income[]>;
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
    { value: 'Salary', viewValue: 'Salary' },
    { value: 'Cryptocurrency', viewValue: 'Cryptocurrency' },
    { value: 'Allowance', viewValue: 'Allowance' },
    { value: 'Business', viewValue: 'Business' },
    { value: 'Gifts', viewValue: 'Gifts' },
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
    this.getIncome();
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
          // Ensure 'user' is typed as an object, 'any' should be changed to the actual type of your user object
          console.log('User data:', user); // Log user data to verify structure
          if (user) {
            this.userData = user;
            this.isLoading = false;
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
  ngOnDestroy(): void {
    console.log('DashboardComponent destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  logout() {
    this.auth.logout();
  }

  addIncome(form: NgForm) {
    this.isFilled = false;
    if (!this.uid) {
      console.error('Cannot add income, user ID not found');
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

    const incomeData: any = {
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
      !incomeData.title ||
      !incomeData.amount ||
      !incomeData.date ||
      !incomeData.description ||
      !incomeData.category
    ) {
      this.isFilled = false;
      console.error('All fields are required');
      return;
    }
    this.isFilled = true;
    console.log('Filled in fields:', incomeData);

    this.store.dispatch(incomeActions.addIncome({ income: incomeData }));
  }

  getIncome() {
    if (!this.uid) {
      console.error('Cannot get income, user ID not found');
      return;
    }

    this.store.dispatch(incomeActions.loadIncome({ uid: this.uid }));
    this.income$ = this.store.select(fromIncome.selectAllIncome);
    this.status$ = this.store.select(fromIncome.selectStatus);

    this.totalAmount$ = this.income$.pipe(
      map((income: any[]) =>
        income.reduce(
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

  deleteIncome(id: string) {
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
        this.store.dispatch(incomeActions.deleteIncome({ id }));
        Swal.fire({
          title: 'Income deleted!',
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
