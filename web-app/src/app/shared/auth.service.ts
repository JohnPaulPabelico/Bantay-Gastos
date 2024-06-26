import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private fireauth: AngularFireAuth, private router: Router) {}

  login(email: string, password: string) {
    this.fireauth.signInWithEmailAndPassword(email, password).then(
      (res) => {
        localStorage.setItem('token', 'true');

        if (res.user?.emailVerified == true) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/verify']);
        }
      },

      (err) => {
        alert('Something went wrong: ' + err.message);
        this.router.navigate(['/login']);
      }
    );
  }

  register(email: string, password: string) {
    this.fireauth.createUserWithEmailAndPassword(email, password).then(
      (res) => {
        alert('Registration successful');
        this.sendEmailVerification(res.user);
        this.router.navigate(['/login']);
      },
      (err) => {
        alert(err.message);
        this.router.navigate(['/register']);
      }
    );
  }

  logout() {
    this.fireauth.signOut().then(
      () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      (err) => {
        alert(err.message);
      }
    );
  }

  forgotPassword(email: string) {
    this.fireauth.sendPasswordResetEmail(email).then(
      () => {
        this.router.navigate(['/forgot/link']);
      },
      (err) => {
        alert(err.message);
      }
    );
  }

  sendEmailVerification(user: any) {
    user.sendEmailVerification().then(
      (res: any) => {
        this.router.navigate(['/verify']);
      },
      (err: any) => {
        alert(err.message);
      }
    );
  }

  googleSignIn() {
    return this.fireauth.signInWithPopup(new GoogleAuthProvider()).then(
      (res) => {
        this.router.navigate(['/dashboard']);
        localStorage.setItem('token', JSON.stringify(res.user?.uid));
      },
      (err) => {
        alert(err.message);
      }
    );
  }

  // facebookSignIn() {
  //   return this.fireauth.signInWithPopup(new FacebookAuthProvider()).then(
  //     (res) => {
  //       this.router.navigate(['/dashboard']);
  //       localStorage.setItem('token', JSON.stringify(res.user?.uid));
  //     },
  //     (err) => {
  //       alert(err.message);
  //     }
  //   );
  // }

  // githubSignIn() {
  //   return this.fireauth.signInWithPopup(new GithubAuthProvider()).then(
  //     (res) => {
  //       this.router.navigate(['/dashboard']);
  //       localStorage.setItem('token', JSON.stringify(res.user?.uid));
  //     },
  //     (err) => {
  //       alert(err.message);
  //     }
  //   );
  // }
}
