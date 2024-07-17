import { createReducer, on } from '@ngrx/store';
import * as expensesActions from './expenses.actions';
import { initialState } from './expenses.state';

export const expensesReducer = createReducer(
  initialState,
  on(expensesActions.loadExpenses, (state) => ({
    ...state,
    loading: true,
    status: 'loading',
  })),
  on(expensesActions.loadExpensesSuccess, (state, { expenses }) => ({
    ...state,
    expenses,
    loading: false,
    status: 'success',
  })),
  on(expensesActions.loadExpensesFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false,
    status: 'error',
  })),
  on(expensesActions.addExpense, (state, { expense }) => ({
    ...state,
    expenses: [...state.expenses, expense],
  })),
  on(expensesActions.deleteExpense, (state, { id }) => ({
    ...state,
    expenses: state.expenses.filter((expense) => expense.id !== id),
  }))
);
