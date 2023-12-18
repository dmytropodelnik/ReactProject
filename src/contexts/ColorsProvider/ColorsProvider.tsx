import React, { createContext, useState, useContext, ReactNode } from 'react';

type Colors = {
  primary: string;
  secondary: string;
};

type ColorsContextType = {
  colors: Colors;
  setColors: React.Dispatch<React.SetStateAction<Colors>>;
};

const ColorsContext = createContext<ColorsContextType | undefined>(undefined);

type ColorsProviderProps = {
  children: ReactNode;
};

const ColorsProvider: React.FC<ColorsProviderProps> = ({ children }) => {
  const [colors, setColors] = useState<Colors>({
    primary: '#FF0000',
    secondary: '#00FF00',
  });

  return <ColorsContext.Provider value={{ colors, setColors }}>{children}</ColorsContext.Provider>;
};

const useColors = (): ColorsContextType => {
  const context = useContext(ColorsContext);
  if (!context) {
    throw new Error('useColors must be used within a ColorsProvider');
  }
  return context;
};

export { ColorsProvider, useColors };
