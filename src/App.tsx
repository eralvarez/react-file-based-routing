import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { PropsWithChildren, useMemo } from 'react';

const _pages = import.meta.glob(['./pages/**/*.tsx', '!./pages/**/layout.tsx']);
const _layouts = import.meta.glob<{
  default: React.ComponentType<PropsWithChildren>;
}>('./pages/**/layout.tsx');

// console.log(_pages);
// console.log(_layouts);

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

function getLayouts(path: string) {
  const layouts: string[] = [];
  const pathSections = path.split('/');
  pathSections.pop();
  const pathWithoutFilename = pathSections.join('/');

  const splittedPathWithoutFilename = pathWithoutFilename.split('/');

  splittedPathWithoutFilename.reduce((acc, pathSection) => {
    const currentPath = acc === '' ? pathSection : `${acc}/${pathSection}`;
    const layoutPath = `${currentPath}/layout.tsx`;
    if (_layouts[layoutPath]) {
      layouts.push(layoutPath);
    }
    return currentPath;
  }, '');

  return layouts;
}

function App() {
  const routes = useMemo(
    () =>
      Object.entries(_pages).map(([path, loader]) => {
        const routePath = pathToRoute(path);
        // console.group('Layouts for path:', path);
        const layouts = getLayouts(path);
        // console.log(layouts);
        // console.groupEnd();
        const Component = React.lazy(
          loader as () => Promise<{ default: React.ComponentType<unknown> }>
        );

        const lazyLayouts = layouts.reverse().map(layout => {
          const Layout = React.lazy(_layouts[layout]);
          return Layout;
        });

        const ElementWithLayouts = lazyLayouts.reduce(
          (wrapped, Layout) => {
            return <Layout>{wrapped}</Layout>;
          },
          <Component />
        );
        console.log('lazyLayouts:', lazyLayouts);
        console.log('path:', path);

        return (
          <Route
            key={routePath}
            path={routePath}
            element={ElementWithLayouts}
          />
        );
      }),
    []
  );

  return (
    <BrowserRouter>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>{routes}</Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
