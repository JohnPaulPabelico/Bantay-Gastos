import { createAction, props } from '@ngrx/store';
import { Expenses } from 'src/app/model/expenses.model';

export const loadExpenses = createAction(
  '[Expenses] Load Expenses',
  props<{ uid: string }>()
);
export const loadExpensesSuccess = createAction(
  '[Expenses] Load Expenses Success',
  props<{ expenses: Expenses[] }>()
);
export const loadExpensesFailure = createAction(
  '[Expenses] Load Expenses Failure',
  props<{ error: string }>()
);

export const addExpense = createAction(
  '[Expenses] Add Expense',
  props<{ expense: Expenses }>()
);
export const addExpenseSuccess = createAction(
  '[Expenses] Add Expense Success',
  props<{ expense: Expenses }>()
);
export const addExpenseFailure = createAction(
  '[Expenses] Add Expense Failure',
  props<{ error: string }>()
);

export const deleteExpense = createAction(
  '[Expenses] Delete Expense',
  props<{ id: string }>()
);
export const deleteExpenseSuccess = createAction(
  '[Expenses] Delete Expense Success',
  props<{ id: string }>()
);
export const deleteExpenseFailure = createAction(
  '[Expenses] Delete Expense Failure',
  props<{ error: string }>()
);
