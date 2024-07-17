import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.state';

export const selectUserState =
  createFeatureSelector<UserState>('expenses');

export const selectAllUser = createSelector(
  selectUserState,
  (state: UserState) => state.user
);
export const selectLoading = createSelector(
  selectUserState,
  (state: UserState) => state.loading
);

export const selectStatus = createSelector(
  selectUserState,
  (state: UserState) => state.status
);

export const selectError = createSelector(
  selectUserState,
  (state: UserState) => state.error
);
