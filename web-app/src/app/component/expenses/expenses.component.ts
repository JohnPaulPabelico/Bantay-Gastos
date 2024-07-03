import { Component, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { ExpenseService } from 'src/app/shared/expense.service';
import { Subject, takeUntil, tap, timestamp } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Expenses } from 'src/app/model/expenses';

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
    private firestore: AngularFirestore
  ) {}

  expenseData: Expenses[] = [];
  totalAmount: number = 0;
  uid: string | undefined;

  private unsubscribe$ = new Subject<void>();
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

  ngOnInit() {
    this.uid = this.auth.getUserId();
    console.log('User ID: ' + this.uid);
    if (!this.uid) {
      console.error('Not currently signed in');
      return;
    }
    this.isFilled = true;
    this.getExpense();
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

  deleteExpense(id: string) {
    if (!id) {
      console.error('Cannot delete expense without ID');
      return;
    }

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
  }
}
