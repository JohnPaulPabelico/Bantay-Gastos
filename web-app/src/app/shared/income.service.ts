import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  constructor(private firestore: AngularFirestore) {}

  createIncome(income: any): Promise<DocumentReference<any>> {
    return this.firestore.collection('income').add({ ...income });
  }

  readIncome(uid: string): Observable<any[]> {
    return this.firestore
      .collection('income', (ref) =>
        ref.where('createdById', '==', uid).orderBy('dateInt', 'desc')
      )
      .valueChanges({ idField: 'id' });
  }

  deleteIncome(id: string): Promise<void> {
    return this.firestore.collection('income').doc(id).delete();
  }
}
