import { Component, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { ExpenseService } from 'src/app/shared/expense.service';
import { Subject, takeUntil, tap, timestamp } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Timestamp } from 'firebase/firestore';

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
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  expenseData: any[] = [];
  totalAmount: number = 0; // Initialize totalAmount
  uid: string | null = null;

  private unsubscribe$ = new Subject<void>();
  isLoading = false;
  isFilled = false;
  isEmpty = false;

  calculateTotalAmount() {
    this.totalAmount = this.expenseData.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );
  }

  addExpense(form: NgForm) {
    this.isFilled = false;
    console.log('current UID:', this.uid);
    if (!this.uid) {
      console.error('Not currently signed in');
      return;
    }

    const dateInt = new Date(form.value.date).getTime();

    const firestoreTimestamp: Timestamp = Timestamp.fromDate(form.value.date);
    console.log('Firestore Timestamp:', firestoreTimestamp);
    const firestoreTimestampString = firestoreTimestamp.toDate().toString();

    const date = new Date(firestoreTimestampString);

    // Step 2: Format the date into "MMM DD YYYY" format
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    console.log(formattedDate); // Output: "Jun 06, 2024"

    const expensesData: any = {
      title: form.value.Title,
      amount: form.value.Amount,
      dateString: formattedDate,
      dateInt: dateInt,
      date: date,
      description: form.value.description,
      createdById: this.uid,
    };

    if (
      !expensesData.title ||
      !expensesData.amount ||
      !expensesData.date ||
      !expensesData.description
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

        // Update the document in Firestore with the generated ID
        form.reset();
      })
      .catch((error) => {
        console.error('Error writing document: ', error);
      });
  }

  getExpense() {
    this.isLoading = true;
    console.log('User ID: ' + this.uid);
    if (!this.uid) {
      console.error('Not currently signed ins');
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
    this.firestore
      .collection('expenses')
      .doc(id)
      .delete()
      .then(() => {
        console.log('Document successfully deleted!');
      })
      .catch((error) => {
        console.error('Error removing document: ', error);
      });
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
}
