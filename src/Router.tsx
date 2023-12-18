import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './views/Homes/Home';
import ActiveStrategy from './views/ActiveStrategy/ActiveStrategy';
import PlaningOrders from './views/PlaningOrders/PlaningOrders';
import { Web3Context } from './contexts/Web3/Web3Provider';
import { useContext } from 'react';
import ControlPanel from './views/ControlPanel/ControlPanel';

export type Params = 'userId' | 'activeStrategyId';

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/user/:userId', element: <ActiveStrategy /> },
  {
    path: '/user/:userId/active-strategy/:activeStrategyId',
    element: <PlaningOrders />,
  },
  {
    path: '/user/:userId/control-panel/:pairSymbol',
    element: <ControlPanel />,
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
];

function Router() {
  const { account, auth } = useContext(Web3Context);

  return (
    <>
      {account ? (
        <Routes>
          {auth ? (
            routes.map((route, i) => <Route key={i} path={route.path} element={route.element} />)
          ) : (
            <Route path={'/'} element={<Home />} />
          )}
        </Routes>
      ) : (
        <div className="max-w-[1180px] m-auto px-2">
          <div className="rounded border border-sky-900/10 bg-sky-50 p-6 text-sky-700 mx-auto w-fit flex flex-col items-center">
            <strong className="text-sm font-medium">Please connect wallet</strong>
          </div>
        </div>
      )}
    </>
  );
}

export default Router;
