import { useState } from 'react';

export const useModal = () => {
  const [showModal, setShowModal] = useState<any>();
  const [modalContent, setModalContent] = useState<any>();
  const [modalTitle, setModalTitle] = useState<string>();

  const handleModal = (title: string, content: any) => {
    setShowModal(!showModal);
    if (content) {
      setModalContent(content);
    }
    if (title) {
      setModalTitle(title);
    }
  };

  const closeModal = () => {
    setShowModal(null);
  };

  return { showModal, handleModal, closeModal, modalContent, modalTitle };
};
