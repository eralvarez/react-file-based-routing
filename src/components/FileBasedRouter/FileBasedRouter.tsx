// https://reactrouter.com/6.30.0/start/overview

import React, { PropsWithChildren } from 'react';
import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  RouteObject,
} from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

function GenericLayout() {
  return <Outlet />;
}

function GenericLoading() {
  return null;
}

function GenericErrorBoundaryPlaceholder() {
  return null;
}

const BASE_PAGES_PATH = '/src/pages';

const _pages = import.meta.glob([
  `/src/pages/**/*.tsx`,
  '!/src/pages/**/layout.tsx',
  '!/src/pages/**/loading.tsx',
  '!/src/pages/**/error.tsx',
]);
const _layouts = import.meta.glob<{
  default: React.ComponentType<PropsWithChildren>;
}>('/src/pages/**/layout.tsx');
const _loading = import.meta.glob<{
  default: React.ComponentType<PropsWithChildren>;
}>('/src/pages/**/loading.tsx');
const _error = import.meta.glob<{
  default: React.ComponentType<PropsWithChildren>;
}>('/src/pages/**/error.tsx');

// console.log(_pages);
// console.log(_layouts);
// console.log(_loading);

function pathToRoute(filePath: string) {
  let route =
    filePath
      .replace(BASE_PAGES_PATH, '')
      .replace(/\.tsx$/, '')
      .replace(/\[([^\]]+)\]/g, ':$1') || '/';

  if (route.endsWith('/index')) {
    route = route.replace(/\/index$/, '');
  }

  if (route === '') {
    route = '/';
  }

  if (route.endsWith('/')) {
    route = route.slice(0, -1);
  }

  if (route === '/index') {
    route = '/';
  }

  return route;
}

type LazyPromise = () => Promise<{ default: React.ComponentType<unknown> }>;

const RootLayout = _layouts[`${BASE_PAGES_PATH}/layout.tsx`]
  ? React.lazy(_layouts[`${BASE_PAGES_PATH}/layout.tsx`])
  : GenericLayout;

const hasRootError = Boolean(_error[`${BASE_PAGES_PATH}/error.tsx`]);
const RootErrorBoundary = hasRootError
  ? React.lazy(_error[`${BASE_PAGES_PATH}/error.tsx`])
  : GenericErrorBoundaryPlaceholder;

// console.log('hasRootError', hasRootError);

const routes = (() => {
  const _routes: RouteObject[] = [
    {
      path: '/',
      element: hasRootError ? (
        <ErrorBoundary fallback={<RootErrorBoundary />}>
          <RootLayout children={<Outlet />} />
        </ErrorBoundary>
      ) : (
        <RootLayout children={<Outlet />} />
      ),
      children: [],
    },
  ];

  for (const pageFile of Object.keys(_pages)) {
    const currentRoute = pathToRoute(pageFile);
    // console.log({ pageFile, currentRoute });

    const Component = React.lazy(_pages[pageFile] as LazyPromise);

    const splittedRoute = pageFile
      .replace(`${BASE_PAGES_PATH}/`, '')
      .split('/');
    // console.log('splittedRoute', splittedRoute);
    // console.log('currentRoute', currentRoute);
    const routeWithoutFile = splittedRoute.slice(0, -1).join('/');
    // console.log('routeWithoutFile', routeWithoutFile);
    // console.log(
    //   'loading currentRoute2',
    //   `${BASE_PAGES_PATH}${routeWithoutFile ? `/${routeWithoutFile}` : `${routeWithoutFile}`}/loading.tsx`
    // );
    const loadingFilePath = `${BASE_PAGES_PATH}${routeWithoutFile ? `/${routeWithoutFile}` : `${routeWithoutFile}`}/loading.tsx`;

    const isLoadingComponentCreated = !!_loading[loadingFilePath];

    // console.log({ isLoadingComponentCreated });

    const LoadingComponent = isLoadingComponentCreated
      ? React.lazy(_loading[loadingFilePath])
      : GenericLoading;

    let currentChildren = _routes[0].children;

    if (splittedRoute.length === 1) {
      // is index.tsx
      if (splittedRoute[0] === 'index.tsx') {
        // is index.tsx, no layout
        currentChildren?.push({
          index: true,
          element: (
            <React.Suspense fallback={<LoadingComponent />}>
              <Component />
            </React.Suspense>
          ),
        });
      } else {
        currentChildren?.push({
          path: currentRoute,
          element: (
            <React.Suspense fallback={<LoadingComponent />}>
              <Component />
            </React.Suspense>
          ),
        });
      }
    } else {
      let carriedPath = '';
      for (const routeOrFile of splittedRoute) {
        // console.group('More: ', pageFile);
        // console.log('route', routeOrFile);
        // console.log('carriedPath', carriedPath);
        if (routeOrFile.endsWith('.tsx')) {
          // is file
          // const fileName = routeOrFile.replace('.tsx', '');
          const CurrentComponent = React.lazy(_pages[pageFile] as LazyPromise);
          if (routeOrFile === 'index.tsx') {
            currentChildren?.push({
              index: true,
              element: (
                <React.Suspense fallback={<LoadingComponent />}>
                  <CurrentComponent />
                </React.Suspense>
              ),
            });
          } else {
            currentChildren?.push({
              path: currentRoute.split('/').pop(),
              element: (
                <React.Suspense fallback={<LoadingComponent />}>
                  <CurrentComponent />
                </React.Suspense>
              ),
            });
          }
        } else {
          carriedPath += `/${routeOrFile}`;
          // console.log(`./pages${carriedPath}/layout.tsx`);

          const isLayoutCreated = currentChildren?.some(child => {
            return child.path === carriedPath;
          });

          // console.log({ isLayoutCreated });

          if (isLayoutCreated) {
            const lastChildren = currentChildren?.find(child => {
              return child.path === carriedPath;
            });
            currentChildren = lastChildren?.children;
          } else {
            const Layout = _layouts[
              `${BASE_PAGES_PATH}${carriedPath}/layout.tsx`
            ]
              ? React.lazy(
                  _layouts[`${BASE_PAGES_PATH}${carriedPath}/layout.tsx`]
                )
              : GenericLayout;
            const hasError = Boolean(
              _error[`${BASE_PAGES_PATH}${carriedPath}/error.tsx`]
            );
            const ErrorBoundaryComponent = hasError
              ? React.lazy(_error[`${BASE_PAGES_PATH}${carriedPath}/error.tsx`])
              : GenericErrorBoundaryPlaceholder;

            const _children = {
              path: routeOrFile,
              element: hasError ? (
                <ErrorBoundary fallback={<ErrorBoundaryComponent />}>
                  <React.Suspense fallback={<LoadingComponent />}>
                    <Layout children={<Outlet />} />
                  </React.Suspense>
                </ErrorBoundary>
              ) : (
                <React.Suspense fallback={<LoadingComponent />}>
                  <Layout children={<Outlet />} />
                </React.Suspense>
              ),
              children: [],
            };
            currentChildren?.push(_children);
            currentChildren = _children.children;
          }
        }

        // console.groupEnd();
      }
    }
  }

  // console.log('All routes:');
  // console.log(_routes);
  return _routes;
})();

const browserRouter = createBrowserRouter(routes);

export default function FileBasedRouter() {
  return <RouterProvider router={browserRouter} />;
}
