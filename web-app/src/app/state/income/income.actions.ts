import { createAction, props } from '@ngrx/store';
import { Income } from 'src/app/model/income.model';

export const loadIncome = createAction(
  '[Income] Load Income',
  props<{ uid: string }>()
);
export const loadIncomeSuccess = createAction(
  '[Income] Load Income Success',
  props<{ income: Income[] }>()
);
export const loadIncomeFailure = createAction(
  '[Income] Load Income Failure',
  props<{ error: string }>()
);

export const addIncome = createAction(
  '[Income] Add Income',
  props<{ income: Income }>()
);
export const addIncomeSuccess = createAction(
  '[Income] Add Income Success',
  props<{ income: Income }>()
);
export const addIncomeFailure = createAction(
  '[Income] Add Income Failure',
  props<{ error: string }>()
);

export const deleteIncome = createAction(
  '[Income] Delete Income',
  props<{ id: string }>()
);
export const deleteIncomeSuccess = createAction(
  '[Income] Delete Income Success',
  props<{ id: string }>()
);
export const deleteIncomeFailure = createAction(
  '[Income] Delete Income Failure',
  props<{ error: string }>()
);
