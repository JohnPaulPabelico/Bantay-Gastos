import { Expenses } from 'src/app/model/expenses.model';

export interface ExpensesState {
  expenses: Expenses[];
  loading: boolean;
  error: any;
  status: string;
}

export const initialState: ExpensesState = {
  expenses: [],
  loading: false,
  error: null,
  status: 'pending',
};
