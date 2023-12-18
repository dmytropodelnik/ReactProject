import React, { useContext, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useCreateUserMutation } from '../../../api/api-users';
import { useAppSelector, useAppDispatch } from '../../../redux/redux';
import { alertMessageSlice } from '../../../redux/alert-slice';
import { ModalContext } from '../../../contexts/ModalProvider/ModalProvider';

export interface IAddUserModalProps {
  refetchUsers: () => Promise<void>;
}

const AddNewUserModalNew: React.FC<IAddUserModalProps> = ({ refetchUsers }) => {
  const { showAlert, errorMessage } = useAppSelector((state) => state.alert);
  const { setShowAlert, setAlertMessage } = alertMessageSlice.actions;
  const dispatch = useAppDispatch();
  const { closeModal } = useContext(ModalContext);

  const [name, setName] = useState<string>('');
  const toggleModal = () => {
    resetAddingNameValues();
    closeModal();
  };

  const resetAddingNameValues = () => {
    setName('');
  };

  const [createUser] = useCreateUserMutation();

  const addNewUser = async () => {
    try {
      if (!name) {
        toggleModal();
        dispatch(setAlertMessage('Enter name'));
        dispatch(setShowAlert(!showAlert));
        return;
      }

      const body = {
        Name: name,
      };

      await createUser({
        body,
      }).unwrap();
      refetchUsers();
      toggleModal();

      dispatch(setAlertMessage('New user has been successfully added!'));
      dispatch(setShowAlert(!showAlert));
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <Form.Group controlId="formName">
        <Form.Label>Name</Form.Label>
        <Form.Control type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
      </Form.Group>
      <div className="d-flex justify-content-end mt-4">
        <Button variant="primary" className="mr-2" onClick={addNewUser}>
          Save
        </Button>
        <Button variant="danger" onClick={closeModal}>
          Close
        </Button>
      </div>
    </>
  );
};

export default AddNewUserModalNew;
