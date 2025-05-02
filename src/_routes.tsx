import { RouteObject } from 'react-router-dom';
import { ReactNode } from 'react';
import Layout from './pages/layout';
import Home from './pages/index';
import About from './pages/about';
import BlogPost from './pages/blog/[id]';

type RouteWithJSX = Omit<RouteObject, 'element' | 'children'> & {
  element?: ReactNode;
  children?: RouteWithJSX[];
};

export const routes: RouteWithJSX[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'blog/:id',
        element: <BlogPost />,
      },
    ],
  },
];
