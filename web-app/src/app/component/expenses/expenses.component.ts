import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { Expenses } from 'src/app/model/expenses';
import { ExpenseService } from 'src/app/shared/expense.service';
import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  constructor(
    private auth: AuthService,
    private expenseService: ExpenseService,
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  expenseData: any[] = [];
  totalAmount: number = 0; // Initialize totalAmount

  private unsubscribe$ = new Subject<void>();
  private currentUser: firebase.User | null = null;
  isLoading = false;

  calculateTotalAmount() {
    this.totalAmount = this.expenseData.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );
  }

  addExpense(form: NgForm) {
    const expensesData: any = {
      title: form.value.Title,
      amount: form.value.Amount,
      date: form.value.date,
      description: form.value.description,
      id: '', // Initialize id field
    };

    this.firestore
      .collection('expenses')
      .add(expensesData)
      .then((docRef) => {
        // Update the document with the generated ID
        expensesData.id = docRef.id;

        // Update the document in Firestore with the generated ID
        this.firestore
          .collection('expenses')
          .doc(docRef.id)
          .set(expensesData)
          .then(() => {
            console.log('Document successfully written with ID: ', docRef.id);

            // Optionally, update your expenseData array or any other logic
            this.expenseData.push(expensesData); // Example: Pushing new expense to array

            // Reset the form or perform any other necessary operations
            form.resetForm();
          })
          .catch((error) => {
            console.error(
              'Error updating document with ID: ',
              docRef.id,
              error
            );
          });
      })
      .catch((error) => {
        console.error('Error writing document: ', error);
      });
  }

  getExpense() {
    this.firestore
      .collection('expenses')
      .valueChanges()
      .subscribe(
        (expenses: any[]) => {
          this.expenseData = expenses;
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

  getUserId() {
    this.fireAuth.currentUser
      .then((user) => {
        if (user) {
          console.log('User ID: ' + user.uid);
          // You can use the user ID here
        } else {
          console.log('No user is currently signed in.');
        }
      })
      .catch((error) => {
        console.error('Error getting current user: ', error);
      });
  }

  ngOnInit() {
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
