// https://reactrouter.com/6.30.0/start/overview

import React, { PropsWithChildren } from 'react';
import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  RouteObject,
} from 'react-router-dom';

// import RootLayout from './pages/layout';
// import AboutPage from './pages/about';
// import HomePage from './pages/index';
// import ContactPage from './pages/contact';
// import ContactLayout from './pages/contact/layout';

function GenericLayout() {
  return <Outlet />;
}

const _pages = import.meta.glob(['./pages/**/*.tsx', '!./pages/**/layout.tsx']);
const _layouts = import.meta.glob<{
  default: React.ComponentType<PropsWithChildren>;
}>('./pages/**/layout.tsx');

// const pageRoutes = Object.keys(_pages).map(page => pathToRoute(page));

console.log(_pages);
console.log(_layouts);
// console.log(Object.keys(_pages));
// console.log(pageRoutes);

function pathToRoute(filePath: string) {
  let route =
    filePath
      .replace('./pages', '')
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

// function getLayouts(path: string) {
//   const layouts: string[] = [];
//   const pathSections = path.split('/');
//   pathSections.pop();
//   const pathWithoutFilename = pathSections.join('/');

//   const splittedPathWithoutFilename = pathWithoutFilename.split('/');

//   splittedPathWithoutFilename.reduce((acc, pathSection) => {
//     const currentPath = acc === '' ? pathSection : `${acc}/${pathSection}`;
//     const layoutPath = `${currentPath}/layout.tsx`;
//     if (_layouts[layoutPath]) {
//       layouts.push(layoutPath);
//     }
//     return currentPath;
//   }, '');

//   return layouts;
// }

// function createRouteObject(
//   path: string,
//   Component: React.LazyExoticComponent<React.ComponentType<unknown>>,
//   layouts: React.LazyExoticComponent<React.ComponentType<PropsWithChildren>>[]
// ): RouteObject {
//   // If there are no layouts, return a simple route
//   if (layouts.length === 0) {
//     return {
//       path: path,
//       element: (
//         <React.Suspense fallback={<div>Loading...</div>}>
//           <Component />
//         </React.Suspense>
//       ),
//     };
//   }

//   // Create nested route structure
//   let currentRoute: RouteObject = {
//     path: path,
//     element: (
//       <React.Suspense fallback={<div>Loading...</div>}>
//         <Component />
//       </React.Suspense>
//     ),
//   };

//   // Wrap the route with layouts from innermost to outermost
//   layouts.forEach(Layout => {
//     currentRoute = {
//       element: (
//         <React.Suspense fallback={<div>Loading...</div>}>
//           <Layout>
//             <Outlet />
//           </Layout>
//         </React.Suspense>
//       ),
//       children: [currentRoute],
//     };
//   });

//   return currentRoute;
// }

type LazyPromise = () => Promise<{ default: React.ComponentType<unknown> }>;

const RootLayout = _layouts['./pages/layout.tsx']
  ? React.lazy(_layouts['./pages/layout.tsx'])
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

    const splittedRoute = pageFile.replace('./pages/', '').split('/');
    console.log('splittedRoute', splittedRoute);

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
        console.group('More: ', pageFile);
        console.log('route', routeOrFile);
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
          console.log(`./pages${carriedPath}/layout.tsx`);

          const isLayoutCreated = currentChildren?.some(child => {
            // console.log({
            //   childPath: child.path,
            //   currentRoute,
            //   routeOrFile,
            //   carriedPath,
            // });
            return child.path === carriedPath;
          });

          console.log({ isLayoutCreated });

          if (isLayoutCreated) {
            const lastChildren = currentChildren?.find(child => {
              // console.log({
              //   childPath: child.path,
              //   currentRoute,
              //   routeOrFile,
              //   carriedPath,
              // });
              return child.path === carriedPath;
            });
            currentChildren = lastChildren?.children;
          } else {
            const Layout = _layouts[`./pages${carriedPath}/layout.tsx`]
              ? React.lazy(_layouts[`./pages${carriedPath}/layout.tsx`])
              : GenericLayout;
            const _children = {
              path: carriedPath,
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

    // if (pageFile.endsWith('index.tsx')) {
    //   // is index, doesn't have a layout
    // } else {
    // }
  }
  // const example = [
  //   {
  //     path: '/',
  //     element: <RootLayout children={<Outlet />} />,
  //     children: [
  //       {
  //         index: true,
  //         element: <HomePage />,
  //       },
  //       {
  //         path: 'about',
  //         element: <AboutPage />,
  //       },
  //       {
  //         path: 'contact',
  //         element: <ContactLayout children={<Outlet />} />,
  //         children: [
  //           {
  //             index: true,
  //             element: <ContactPage />,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // ];

  console.log('All routes:');
  console.log(_routes);
  return _routes;
})();

function App() {
  // const routes = useMemo(() => {
  // const routeMap = new Map<string, RouteObject>();

  // // Create routes for all pages
  // Object.entries(_pages).forEach(([path, loader]) => {
  //   const routePath = pathToRoute(path);
  //   const layouts = getLayouts(path);
  //   const Component = React.lazy(
  //     loader as () => Promise<{ default: React.ComponentType<unknown> }>
  //   );

  //   const lazyLayouts = layouts.reverse().map(layout => {
  //     return React.lazy(_layouts[layout]);
  //   });

  //   const routeObject = createRouteObject(routePath, Component, lazyLayouts);
  //   routeMap.set(routePath, routeObject);
  // });

  // // Merge routes that share common layouts
  // const mergedRoutes: RouteObject[] = Array.from(routeMap.values());

  // return mergedRoutes;
  // }, []);

  // const routes = useMemo<RouteObject[]>(() => {
  //   const _routes: RouteObject[] = [
  //     {
  //       path: '/',
  //       element: <RootLayout children={<Outlet />} />,
  //     },
  //   ];
  //   // const example = [
  //   //   {
  //   //     path: '/',
  //   //     element: <RootLayout children={<Outlet />} />,
  //   //     children: [
  //   //       {
  //   //         index: true,
  //   //         element: <HomePage />,
  //   //       },
  //   //       {
  //   //         path: 'about',
  //   //         element: <AboutPage />,
  //   //       },
  //   //       {
  //   //         path: 'contact',
  //   //         element: <ContactLayout children={<Outlet />} />,
  //   //         children: [
  //   //           {
  //   //             index: true,
  //   //             element: <ContactPage />,
  //   //           },
  //   //         ],
  //   //       },
  //   //     ],
  //   //   },
  //   // ];

  //   console.log({ _routes });
  //   return _routes;
  // }, []);

  const router = createBrowserRouter(routes ?? []);

  return (
    <RouterProvider router={router} fallbackElement={<div>Loading...</div>} />
  );
}

export default App;
