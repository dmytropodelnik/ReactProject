import React from 'react';
import TopBar from './components/TopBar';
import Router from './Router';

const App: React.FC = () => {
  return (
    <>
      <TopBar />
      <Router />
    </>
  );
};

export default App;
