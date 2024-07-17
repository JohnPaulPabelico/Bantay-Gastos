import { createAction, props } from '@ngrx/store';
import { User } from 'src/app/model/user.model';

export const loadUser = createAction(
  '[User] Load User',
  props<{ uid: string }>()
);
export const loadUserSuccess = createAction(
  '[Users] Load User Success',
  props<{ user: User[] }>()
);
export const loadUserFailure = createAction(
  '[User] Load User Failure',
  props<{ error: string }>()
);

export const addUser = createAction(
  '[User] Add User',
  props<{ userId: string; userData: any }>()
);
export const addUserSuccess = createAction(
  '[User] Add User Success',
  props<{ user: User }>()
);
export const addUserFailure = createAction(
  '[User] Add User Failure',
  props<{ error: string }>()
);
