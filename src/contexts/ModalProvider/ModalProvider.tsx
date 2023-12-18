import React from 'react';
import Modal from '../../components/Modal/Modal';
import { useModal } from '../../hooks/useModal';

export const ModalContext = React.createContext({
  modalTitle: undefined as string | undefined,
  modalContent: null,
  handleModal: (title: string, content?: any) => {},
  closeModal: () => {},
  showModal: undefined,
});

export const ModalProvider = ({ children }: { children: JSX.Element }) => {
  let { showModal, handleModal, closeModal, modalContent, modalTitle } = useModal();
  return (
    <ModalContext.Provider value={{ showModal, handleModal, closeModal, modalContent, modalTitle }}>
      <Modal />
      {children}
    </ModalContext.Provider>
  );
};
