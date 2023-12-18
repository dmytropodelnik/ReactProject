import Modal from 'react-bootstrap/Modal';
import { Card } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../../redux/redux';
import { alertMessageSlice } from '../../redux/alert-slice';

export interface ICustomAlert {
  message?: string;
}

export const CustomAlert = ({ message }: { message: string }) => {
  const { showAlert, errorMessage } = useAppSelector((state) => state.alert);
  const { setShowAlert, setAlertMessage } = alertMessageSlice.actions;
  const dispatch = useAppDispatch();
  const handleClose = () => {
    dispatch(setShowAlert(!showAlert));
  };
  return (
    <>
      <Modal show={showAlert} onHide={handleClose}>
        <Card bg="primary" text="white" className="text-center">
          <Card.Body>
            <Card.Text>{errorMessage ? errorMessage : message} </Card.Text>
          </Card.Body>
        </Card>
      </Modal>
    </>
  );
};
