import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';

// const pages = import.meta.glob('./pages/**/*.tsx');
const _pages = import.meta.glob(['./pages/**/*.tsx', '!./pages/**/layout.tsx']);
const _layouts = import.meta.glob('./pages/**/layout.tsx');

console.log('pages', _pages);
console.log('layouts', _layouts);

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
  console.log('getLayouts', path);

  return null;
}

function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routes = Object.entries(_pages).map(([path, loader]) => {
    const routePath = pathToRoute(path);
    const layouts = getLayouts(path);
    console.log({
      routePath,
      path,
      layouts,
    });
    const Component = React.lazy(
      loader as () => Promise<{ default: React.ComponentType<unknown> }>
    );

    return <Route key={routePath} path={routePath} element={<Component />} />;
  });

  return (
    <BrowserRouter>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>{routes}</Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
