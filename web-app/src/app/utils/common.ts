import { User } from '../model/users';

export function loginDetails(): User {
  const token = localStorage.getItem('user');
  const user = token ? JSON.parse(token) : '';
  return user;
}