import React from 'react';
import { ReactNode } from 'react';

export interface IButton {
  children: string | ReactNode;
  styleBtn: string;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<IButton> = ({ children, styleBtn, onClick, disabled }) => {
  return (
    <button className={`${styleBtn}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
