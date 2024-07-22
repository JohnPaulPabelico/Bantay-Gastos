import { ExpensesState } from './expenses/expenses.state';
import { UserState } from './users/user.state';
import { IncomeState } from './income/income.state';
import { RouterReducerState } from '@ngrx/router-store';

export interface AppState {
  Expenses: ExpensesState;
  User: UserState;
  Income: IncomeState;
  Router: RouterReducerState;
}
