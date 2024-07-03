// src/app/services/firebase-init.service.ts

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseInitService {
  private initialized = false;

  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  initializeApp() {
    if (this.initialized) return;

    if (!environment.production && environment.useEmulators) {
      this.firestore.firestore.settings({
        host: 'localhost:8080',
        ssl: false,
      });

      this.auth.useEmulator('http://localhost:9099');
    }

    this.initialized = true;
  }
}
