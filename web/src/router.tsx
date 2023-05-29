import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Root from './routes/Root';
import Login from './routes/Login';
import NotFound from './routes/NotFound';
import ErrorElement from './components/ErrorElement';

const Home = lazy(() => import('./routes/Home'));
const Apps = lazy(() => import('./routes/Apps'));
const Users = lazy(() => import('./routes/Users'));
const Settings = lazy(() => import('./routes/Settings'));

export default createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorElement message="页面加载失败" />,
    children: [
      {
        path: '/',
        index: true,
        element: <Home />,
        errorElement: <ErrorElement message="页面加载失败" />,
      },
      {
        path: '/apps',
        element: <Apps />,
        errorElement: <ErrorElement message="页面加载失败" />,
      },
      {
        path: '/users',
        element: <Users />,
        errorElement: <ErrorElement message="页面加载失败" />,
      },
      {
        path: '/settings',
        element: <Settings />,
        errorElement: <ErrorElement message="页面加载失败" />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorElement message="页面加载失败" />,
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <ErrorElement message="页面加载失败" />,
  },
]);
