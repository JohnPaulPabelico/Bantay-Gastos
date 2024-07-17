import { Income } from 'src/app/model/income.model';

export interface IncomeState {
  income: Income[];
  loading: boolean;
  error: any;
  status: string;
}

export const initialState: IncomeState = {
  income: [],
  loading: false,
  error: null,
  status: 'pending',
};
