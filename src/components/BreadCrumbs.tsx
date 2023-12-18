import { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import useBreadcrumbs from 'use-react-router-breadcrumbs';
import { routes } from '../Router';
import type { BreadcrumbComponentType } from 'use-react-router-breadcrumbs';
import { useGetUsersQuery } from '../api/api-users';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { Web3Context } from '../contexts/Web3/Web3Provider';
import IUsers from '../models/interfaces/IUsers';

export interface ICrumb {
  [key: number | string]: string;
}

export const BreadCrumbs = () => {
  const { auth } = useContext(Web3Context);
  const { data } = useGetUsersQuery(!auth && skipToken);
  const [userNamesById, setUserNamesById] = useState<ICrumb>();

  useEffect(() => {
    let newUserNamesById: ICrumb = {};
    if (data && data.users) {
      data.users.map((item: IUsers) => (newUserNamesById[item.Id] = item.Name));
      setUserNamesById(newUserNamesById);
    }
  }, [data]);

  const DynamicUserBreadcrumb: BreadcrumbComponentType<'userId'> = ({ match }) => {
    if (userNamesById && match.params.userId) {
      const crumb = userNamesById[match.params.userId];
      return <span>{crumb}</span>;
    }
    return null;
  };

  const DynamicStrategyBreadcrumb: BreadcrumbComponentType = ({ match }) => {
    if (match.params.activeStrategyId) {
      return (
        <span>
          {match.params.activeStrategyId === '1'
            ? 'Book Strategy'
            : match.params.activeStrategyId === '2'
            ? 'Trade Strategy'
            : match.params.activeStrategyId === '3'
            ? 'Pump Strategy'
            : 'null'}
        </span>
      );
    }
    return null;
  };
  const routesWithBreadcrumbs = routes.map((route) => {
    return route.path === '/user/:userId'
      ? { ...route, breadcrumb: DynamicUserBreadcrumb }
      : { ...route, breadcrumb: DynamicStrategyBreadcrumb };
  });

  const breadcrumbs = useBreadcrumbs(routesWithBreadcrumbs, {
    excludePaths: ['/', '/user', '/user/:userId/active-strategy'],
  });

  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol className="flex overflow-hidden rounded-lg border border-gray-200 text-gray-600">
        <li className="flex items-center">
          <NavLink to={'/'} className="flex h-10 items-center bg-gray-100 px-4 transition hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="ml-1.5 text-xs font-medium"> Home </span>
          </NavLink>
        </li>
        {breadcrumbs.map(({ match, breadcrumb, location }, index) => (
          <li className="relative flex items-center" key={index}>
            <span className="absolute inset-y-0 -left-px h-10 w-4 bg-gray-100 [clip-path:_polygon(0_0,_0%_100%,_100%_50%)]"></span>
            {index ? (
              <span className="flex h-10 items-center bg-white pl-8 pr-4 text-xs font-medium transition">
                {location.pathname === '/user/1/active-strategy/1' ? (
                  index === 1 ? (
                    breadcrumb
                  ) : (
                    ''
                  )
                ) : (
                  <>
                    {index === 1
                      ? location.pathname
                          .split('/')
                          .reverse()[1]
                          .split('-')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')
                      : breadcrumb}
                    {index === 2
                      ? location.pathname
                          .split('/')
                          .reverse()[0]
                          .split('-')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')
                      : breadcrumb}
                  </>
                )}
              </span>
            ) : (
              <NavLink
                key={match.pathname}
                to={match.pathname}
                state={localStorage.getItem(match.pathname) ? JSON.parse(localStorage.getItem(match.pathname) ?? '') : {}}
                className="flex h-10 items-center bg-white pl-8 pr-4 text-xs font-medium transition hover:text-gray-90">
                {breadcrumb}
              </NavLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
