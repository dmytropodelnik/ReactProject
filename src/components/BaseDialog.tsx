import { FC, useEffect } from 'react';
import Button from '../views/Button/Button';

type Props = {
  isOpen: boolean;
  closeDialog: () => void;
  children: JSX.Element;
};

const BaseDialog: FC<Props> = ({ isOpen, closeDialog, children }) => {
  useEffect(() => {
    if (!closeDialog) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeDialog]);

  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white rounded-md shadow-lg p-4 relative">
        <Button
          styleBtn={'absolute top-0 right-0 m-2 text-gray-700 hover:text-gray-900 focus:outline-none'}
          onClick={closeDialog}>
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              className="heroicon-ui"
              d="M6.7 5.3a1 1 0 011.4 0L12 10.6l3.9-5.3a1 1 0 111.4 1.5l-3.9 5.3 3.9 5.3a1 1 0 01-1.4 1.5L12 13.4l-3.9 5.3a1 1 0 01-1.4-1.5l3.9-5.3-3.9-5.3a1 1 0 010-1.5z"
            />
          </svg>
        </Button>
        {children}
      </div>
    </div>
  );
};

export default BaseDialog;
