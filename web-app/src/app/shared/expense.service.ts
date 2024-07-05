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

  createExpense(expense: any): Promise<DocumentReference<any>> {
    return this.firestore.collection('expenses').add({ ...expense });
  }

  readExpense(uid: string): Observable<any[]> {
    return this.firestore
      .collection('expenses', (ref) =>
        ref.where('createdById', '==', uid).orderBy('dateInt', 'desc')
      )
      .valueChanges({ idField: 'id' });
  }

  deleteExpense(id: string): Promise<void> {
    return this.firestore.collection('expenses').doc(id).delete();
  }
}
