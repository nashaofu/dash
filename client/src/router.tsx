import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Root from './routes/Root';

const Home = lazy(() => import('./routes/Home'));
const Apps = lazy(() => import('./routes/Apps'));
const Users = lazy(() => import('./routes/Users'));
const Settings = lazy(() => import('./routes/Settings'));
const Login = lazy(() => import('./routes/Login'));
const NotFound = lazy(() => import('./routes/NotFound'));

export default createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        index: true,
        element: <Home />,
      },
      {
        path: '/apps',
        element: <Apps />,
      },
      {
        path: '/users',
        element: <Users />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
