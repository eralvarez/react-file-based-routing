// https://reactrouter.com/6.30.0/start/overview

import React, { PropsWithChildren, useEffect } from 'react';
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

function DataLoaderComponent({
  Component,
  LoadingComponent,
  // dataFunction,
  dataFunctionImportModule,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>;
  LoadingComponent: React.ComponentType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // dataFunction?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataFunctionImportModule: any;
}) {
  const [data, setData] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const dataFunctionModule = await dataFunctionImportModule;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataFunction = dataFunctionModule.default as any;
      dataFunction()
        .then((data: unknown) => {
          // console.log('Data loaded:', data);
          setData(data);
          setLoading(false);
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((error: any) => {
          setError(error);
          setLoading(false);
        });
    };

    loadData();
  }, []);

  if (loading) {
    return <LoadingComponent />;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (data) {
    return <Component initialData={data} />;
  }

  // If no data, return null or a fallback UI
  // You can also throw an error if you want to handle it in an error boundary
  // throw new Error('No data available');

  return null;
}

const BASE_PAGES_PATH = '/src/pages';

const _pages = import.meta.glob([
  `/src/pages/**/*.tsx`,
  '!/src/pages/**/layout.tsx',
  '!/src/pages/**/loading.tsx',
  '!/src/pages/**/error.tsx',
  '!/src/pages/**/data.ts',
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
const _data = import.meta.glob<{
  default: React.ComponentType<PropsWithChildren>;
}>('/src/pages/**/data.ts');

// console.log(_pages);
// console.log(_layouts);
// console.log(_loading);
// console.log(_data);

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

const routes = () => {
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
    const dataFunctionFilePath = `${BASE_PAGES_PATH}${routeWithoutFile ? `/${routeWithoutFile}` : `${routeWithoutFile}`}/data.ts`;

    const isLoadingComponentCreated = Boolean(_loading[loadingFilePath]);
    const isDataFunctionComponentSet = Boolean(_data[dataFunctionFilePath]);

    // console.log({ isLoadingComponentCreated });

    const LoadingComponent = isLoadingComponentCreated
      ? React.lazy(_loading[loadingFilePath])
      : GenericLoading;
    const dataFunctionImportModule = isDataFunctionComponentSet
      ? _data[dataFunctionFilePath]()
      : null;
    // let dataFunction = null;
    // React.lazy(_data[dataFunctionFilePath])
    // _data[dataFunctionFilePath]()

    if (dataFunctionImportModule !== null) {
      // console.log('dataFunction', _dataFunction);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // const dataFunctionModule = await dataFunctionImportModule;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // dataFunction = dataFunctionModule.default as any;
      // const response = await dataFunction();
      // console.log('Data loaded:', response);
      // _dataFunction.then((data: any) => {
      //   console.log('module:', data);
      //   data.default().then((response: unknown) => {
      //     console.log('Data loaded:', response);
      //   });
      // });
    }

    let currentChildren = _routes[0].children;

    if (splittedRoute.length === 1) {
      // is index.tsx
      if (splittedRoute[0] === 'index.tsx') {
        // is index.tsx, no layout
        currentChildren?.push({
          index: true,
          element: (
            <React.Suspense fallback={<LoadingComponent />}>
              {isDataFunctionComponentSet ? (
                <DataLoaderComponent
                  Component={Component}
                  LoadingComponent={LoadingComponent}
                  // dataFunction={dataFunction}
                  dataFunctionImportModule={dataFunctionImportModule}
                />
              ) : (
                <Component />
              )}
            </React.Suspense>
          ),
        });
      } else {
        currentChildren?.push({
          path: currentRoute,
          element: (
            <React.Suspense fallback={<LoadingComponent />}>
              {isDataFunctionComponentSet ? (
                <DataLoaderComponent
                  Component={Component}
                  LoadingComponent={LoadingComponent}
                  dataFunctionImportModule={dataFunctionImportModule}
                />
              ) : (
                <Component />
              )}
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
};

const browserRouter = createBrowserRouter(routes());

export default function FileBasedRouter() {
  return <RouterProvider router={browserRouter} />;
}
