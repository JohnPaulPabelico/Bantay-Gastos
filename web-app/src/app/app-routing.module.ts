import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { RegisterComponent } from './component/register/register.component';
import { ExpensesComponent } from './component/expenses/expenses.component';
import { IncomeComponent } from './component/income/income.component';
import { ForgotPasswordComponent } from './component/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './component/verify-email/verify-email.component';
import { ForgotPasswordEmailComponent } from './component/forgot-password-email/forgot-password-email.component';
import {
  AngularFireAuthGuard,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
} from '@angular/fire/compat/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AngularFireAuthGuard],
    title: 'Bantay Gastos - Login',
    data: { authGuardPipe: redirectLoggedInToDashboard },
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AngularFireAuthGuard],
    title: 'Bantay Gastos - Register',
    data: { authGuardPipe: redirectLoggedInToDashboard },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AngularFireAuthGuard],
    title: 'Bantay Gastos - Dashboard',
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'expenses',
    component: ExpensesComponent,
    canActivate: [AngularFireAuthGuard],
    title: 'Bantay Gastos - Expenses',
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'income',
    component: IncomeComponent,
    canActivate: [AngularFireAuthGuard],
    title: 'Bantay Gastos - Income',
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'forgot',
    component: ForgotPasswordComponent,
    canActivate: [AngularFireAuthGuard],
    title: 'Forgot Password',
    data: { authGuardPipe: redirectLoggedInToDashboard },
  },
  {
    path: 'verify',
    component: VerifyEmailComponent,
    canActivate: [AngularFireAuthGuard],
    title: 'Verify Email',
    data: { authGuardPipe: redirectLoggedInToDashboard },
  },
  {
    path: 'forgot/link',
    component: ForgotPasswordEmailComponent,
    canActivate: [AngularFireAuthGuard],
    title: 'Forgot Password',
    data: { authGuardPipe: redirectLoggedInToDashboard },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
