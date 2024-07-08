import { Component, ViewChild, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { ExpenseService } from 'src/app/shared/expense.service';
import { Subject, takeUntil, tap, timestamp } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Expenses } from 'src/app/model/expenses';
import Swal from 'sweetalert2';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { User } from 'src/app/model/users';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  @ViewChild('expenseForm') expenseForm!: NgForm; // Non-null assertion operator// Reference to the form
  constructor(
    private auth: AuthService,
    private expenseService: ExpenseService,
    private firestore: AngularFirestore,
    private breakpointObserver: BreakpointObserver,
    private userService: UserService
  ) {}

  isSmallScreen = false; // default value
  sideNavMode: 'over' | 'side' = 'side';
  expenseData: Expenses[] = [];
  totalAmount: number = 0;
  uid: string | undefined;
  userData: User | null = null;

  private unsubscribe$ = new Subject<void>();
  isEditProfile = false;
  isLoading = false;
  isFilled = false;
  isEmpty = false;

  selectedValue: string = '';
  categories = [
    { value: 'Food', viewValue: 'Food' },
    { value: 'Entertainment', viewValue: 'Entertainment' },
    { value: 'Grocery', viewValue: 'Grocery' },
    { value: 'Shopping', viewValue: 'Shopping' },
    { value: 'Bills', viewValue: 'Bills' },
    { value: 'Transportation', viewValue: 'Transportation' },
  ];

  get imageUrl(): string | undefined {
    return this.userData?.imageUrl;
  }

  get displayName(): string | undefined {
    return this.userData?.displayName;
  }

  get emailAddress(): string | undefined {
    return this.userData?.email;
  }

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
    this.getExpense();
    this.getUserInfo();
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
  ngOnDestroy(): void {
    console.log('DashboardComponent destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  logout() {
    this.auth.logout();
  }

  calculateTotalAmount() {
    this.totalAmount = this.expenseData.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );
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

    this.expenseService
      .createExpense(expensesData)
      .then((docRef) => {
        // Update the document with the generated ID
        expensesData.id = docRef.id;
        form.reset();
      })
      .catch((error) => {
        console.error('Error writing document: ', error);
      });
  }

  getExpense() {
    this.isLoading = true;
    if (!this.uid) {
      console.error('Cannot get expenses, user ID not found');
      return;
    }

    this.expenseService
      .readExpense(this.uid)
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(() => console.log('expenses subscription unsubscribed'))
      )
      .subscribe(
        (expenses: any[]) => {
          this.isLoading = false;
          this.expenseData = expenses;
          this.isEmpty = expenses.length === 0;
          console.log('Fetched expenses:', this.expenseData);
          this.calculateTotalAmount();
        },
        (error) => {
          console.error('Error fetching expenses:', error);
        }
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
        this.firestore
          .collection('expenses')
          .doc(id)
          .delete()
          .then(() => {
            console.log('Document successfully deleted!');
            // Remove from local array
            this.expenseData = this.expenseData.filter(
              (expense) => expense.id !== id
            );
            this.calculateTotalAmount(); // Recalculate total amount
          })
          .catch((error) => {
            console.error('Error removing document: ', error);
          });
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
