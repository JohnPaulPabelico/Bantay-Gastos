import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RouterReducerState, getSelectors } from '@ngrx/router-store';
import { AppState } from '../app.state';

export const selectRouter = createFeatureSelector<RouterReducerState>('router');

const {
  selectCurrentRoute, // select the current route
  selectQueryParams, // select the current route's query params
  selectRouteParams, // select the current route's params
  selectRouteData, // select the current route's data
  selectUrl, // select the current url
} = getSelectors(selectRouter);

export const selectRouteState = createSelector(
  selectRouter,
  (routerState) => routerState && routerState.state
);

export const selectCurrentUrl = createSelector(
  selectRouter,
  (routerState: RouterReducerState<any>) => routerState.state.url
);

export const selectCurrentRouteData = createSelector(
  selectRouter,
  (routerState: RouterReducerState<any>) => routerState.state.root.data
);
