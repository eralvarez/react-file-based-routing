// https://reactrouter.com/6.30.0/start/overview

import React, { PropsWithChildren } from 'react';
import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  RouteObject,
} from 'react-router-dom';

function GenericLayout() {
  return <Outlet />;
}

const BASE_PAGES_PATH = '/src/pages';

const _pages = import.meta.glob([
  `/src/pages/**/*.tsx`,
  '!/src/pages/**/layout.tsx',
]);
const _layouts = import.meta.glob<{
  default: React.ComponentType<PropsWithChildren>;
}>('/src/pages/**/layout.tsx');

// console.log(_pages);
// console.log(_layouts);

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

const routes = (() => {
  const _routes: RouteObject[] = [
    {
      path: '/',
      element: <RootLayout children={<Outlet />} />,
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

    let currentChildren = _routes[0].children;

    if (splittedRoute.length === 1) {
      // is index.tsx
      if (splittedRoute[0] === 'index.tsx') {
        // is index.tsx, no layout
        currentChildren?.push({
          index: true,
          element: (
            <React.Suspense fallback={<div>Loading...</div>}>
              <Component />
            </React.Suspense>
          ),
        });
      } else {
        currentChildren?.push({
          path: currentRoute,
          element: (
            <React.Suspense fallback={<div>Loading...</div>}>
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
                <React.Suspense fallback={<div>Loading...</div>}>
                  <CurrentComponent />
                </React.Suspense>
              ),
            });
          } else {
            currentChildren?.push({
              path: currentRoute.split('/').pop(),
              element: (
                <React.Suspense fallback={<div>Loading...</div>}>
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
            const _children = {
              path: routeOrFile,
              element: <Layout children={<Outlet />} />,
              children: [],
            };
            currentChildren?.push(_children);
            currentChildren = _children.children;
          }
        }

        console.groupEnd();
      }
    }
  }

  // console.log('All routes:');
  // console.log(_routes);
  return _routes;
})();

export default function FileBasedRouter() {
  const router = createBrowserRouter(routes ?? []);

  // console.log('router', routes);

  return (
    <RouterProvider router={router} fallbackElement={<div>Loading...</div>} />
  );
}
