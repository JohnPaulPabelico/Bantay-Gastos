import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  constructor(private firestore: AngularFirestore) {}

  loadExpenses(): Observable<any[]> {
    return this.firestore
      .collection('Expenses')
      .valueChanges({ idField: 'id' });
  }

  addExpense(expense: any): Promise<DocumentReference<any>> {
    return this.firestore.collection('Expenses').add({ ...expense });
  }

  updateExpense(expensesId: string, expense: any): Promise<void> {
    return this.firestore
      .collection('Expenses')
      .doc(expensesId)
      .update(expense);
  }

  deleteExpense(expensesId: string): Promise<void> {
    return this.firestore.collection('Expenses').doc(expensesId).delete();
  }
}
