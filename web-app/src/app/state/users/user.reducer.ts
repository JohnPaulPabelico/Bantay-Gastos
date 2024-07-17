import { createReducer, on } from '@ngrx/store';
import * as userActions from './user.actions';
import { initialState } from './user.state';

export const userReducer = createReducer(
  initialState,
  on(userActions.loadUser, (state) => ({
    ...state,
    loading: true,
    status: 'loading',
  })),
  on(userActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    status: 'success',
  })),
  on(userActions.loadUserFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false,
    status: 'error',
  })),
  on(userActions.addUser, (state, { userId, userData }) => ({
    ...state,
    expenses: [...state.user, userId, userData],
  }))
);
