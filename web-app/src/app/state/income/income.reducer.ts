import { createReducer, on } from '@ngrx/store';
import * as incomeActions from './income.actions';
import { initialState } from './income.state';

export const incomeReducer = createReducer(
  initialState,
  on(incomeActions.loadIncome, (state) => ({
    ...state,
    loading: true,
    status: 'loading',
  })),
  on(incomeActions.loadIncomeSuccess, (state, { income }) => ({
    ...state,
    income,
    loading: false,
    status: 'success',
  })),
  on(incomeActions.loadIncomeFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false,
    status: 'error',
  })),
  on(incomeActions.addIncome, (state, { income }) => ({
    ...state,
    income: [...state.income, income],
  })),
  on(incomeActions.deleteIncome, (state, { id }) => ({
    ...state,
    income: state.income.filter((income) => income.id !== id),
  }))
);
