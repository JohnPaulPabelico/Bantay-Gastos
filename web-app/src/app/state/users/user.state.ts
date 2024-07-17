import { User } from 'src/app/model/user.model';

export interface UserState {
  user: User[];
  loading: boolean;
  error: any;
  status: string;
}

export const initialState: UserState = {
  user: [],
  loading: false,
  error: null,
  status: 'pending',
};
