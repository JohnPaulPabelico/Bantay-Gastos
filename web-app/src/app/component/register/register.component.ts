import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  isFilled = true;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {}

  register() {
    if (this.email == '') {
      this.isFilled = false;
      return;
    }

    if (this.password == '') {
      alert('Please enter password');
      this.isFilled = false;
      return;
    }

    this.auth.register(this.email, this.password);

    this.email = '';
    this.password = '';
  }
}
