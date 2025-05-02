// import {  } from 'react-router-dom';
import {
  BrowserRouter,
  Routes,
  Route,
  // RouterProvider,
  // createBrowserRouter,
  // RouteObject
} from 'react-router-dom';
// import { routes } from './_routes'
// import { lazy } from 'react';
import React from 'react';

const pages = import.meta.glob('./pages/**/*.tsx');

console.log('pages', pages);

function pathToRoute(filePath: string) {
  return (
    filePath
      .replace('./pages', '')
      .replace(/\.tsx$/, '')
      .replace(/\[([^\]]+)\]/g, ':$1') || '/'
  );
}

function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routes = Object.entries(pages).map(([path, loader]: any) => {
    const routePath = pathToRoute(path);
    console.log({
      routePath,
      path,
    });
    const Component = React.lazy(loader);
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
