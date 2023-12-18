import React from 'react';
import { useAppSelector } from '../../redux/redux';
import Modal from 'react-bootstrap/Modal';
import { Card, Button } from 'react-bootstrap';

interface ICustomConfirmProps {
  onConfirm: () => void;
  setShowModal: (value: boolean) => void;
  showConfirm: boolean;
  deleteButtonText: string;
  cancelButtonText: string;
}

const CustomConfirm: React.FC<ICustomConfirmProps> = ({
  onConfirm,
  setShowModal,
  showConfirm,
  deleteButtonText,
  cancelButtonText,
}) => {
  const { message } = useAppSelector((state) => state.confirm);
  const handleCancel = () => {
    setShowModal(false);
  };

  const handleOk = () => {
    setShowModal(false);
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Modal show={showConfirm} onHide={handleCancel} centered>
      <Card bg="primary" text="white" className="text-center">
        <Card.Body>
          <Card.Text>{message}</Card.Text>
          <Button variant="outline-light" onClick={handleOk} className="mr-2">
            {deleteButtonText}
          </Button>
          <Button variant="outline-light" onClick={handleCancel}>
            {cancelButtonText}
          </Button>
        </Card.Body>
      </Card>
    </Modal>
  );
};

export default CustomConfirm;
