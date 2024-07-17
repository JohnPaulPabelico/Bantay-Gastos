import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IncomeState } from './income.state';

export const selectIncomeState = createFeatureSelector<IncomeState>('income');

export const selectAllIncome = createSelector(
  selectIncomeState,
  (state: IncomeState) => state.income
);
export const selectLoading = createSelector(
  selectIncomeState,
  (state: IncomeState) => state.loading
);

export const selectStatus = createSelector(
  selectIncomeState,
  (state: IncomeState) => state.status
);

export const selectError = createSelector(
  selectIncomeState,
  (state: IncomeState) => state.error
);
