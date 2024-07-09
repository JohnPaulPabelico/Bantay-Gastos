import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private firestore: AngularFirestore) {}

  createUser(userId: string | undefined, userData: any): Promise<void> {
    if (!userId) {
      throw new Error('userId must be defined to create user document');
    }
    return this.firestore.collection('users').doc(userId).update(userData);
  }

  readUser(uid: string): Observable<any> {
    return this.firestore
      .collection('users')
      .doc(uid)
      .valueChanges({ idField: 'id' });
  }
}
