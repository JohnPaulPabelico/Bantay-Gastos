import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExpensesState } from './expenses.state';

export const selectExpensesState =
  createFeatureSelector<ExpensesState>('expenses');

export const selectAllExpenses = createSelector(
  selectExpensesState,
  (state: ExpensesState) => state.expenses
);
export const selectLoading = createSelector(
  selectExpensesState,
  (state: ExpensesState) => state.loading
);

export const selectError = createSelector(
  selectExpensesState,
  (state: ExpensesState) => state.error
);
