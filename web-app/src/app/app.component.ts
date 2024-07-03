import { Component } from '@angular/core';
import { FirebaseInitService } from './shared/firebase-init.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private firebaseInitService: FirebaseInitService) {}

  ngOnInit() {
    this.firebaseInitService.initializeApp();
  }
}
