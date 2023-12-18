import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from '../../redux/store';
import { ModalContext } from '../../contexts/ModalProvider/ModalProvider';
import { Modal } from 'react-bootstrap';

const CustomModal = () => {
  let { modalContent, modalTitle, closeModal, showModal } = useContext(ModalContext);
  if (showModal) {
    return ReactDOM.createPortal(
      <Provider store={store}>
        <Modal show={showModal} onHide={closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>{modalContent}</div>
          </Modal.Body>
        </Modal>
      </Provider>,
      document.querySelector('#root') as HTMLElement,
    );
  } else return null;
};

export default CustomModal;
