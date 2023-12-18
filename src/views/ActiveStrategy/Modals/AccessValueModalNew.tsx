import React, { useContext, useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useUpdateAccessValueMutation } from '../../../api/api-access-values';
import { useAppSelector, useAppDispatch } from '../../../redux/redux';
import { alertMessageSlice } from '../../../redux/alert-slice';
import { ModalContext } from '../../../contexts/ModalProvider/ModalProvider';
import IAccessValue from '../../../models/interfaces/IAccessValue';

export interface IEditAccessValue {
  editAccessValue: (value: IAccessValue) => void;
  accessValue: IAccessValue;
  userId: string | number;
}

const AccessValueModalNew: React.FC<IEditAccessValue> = ({ editAccessValue, accessValue, userId }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [accessValueName, setAccessValueName] = useState<string>(accessValue ? accessValue.Name : '');
  const { showAlert, errorMessage } = useAppSelector((state) => state.alert);
  const { setShowAlert, setAlertMessage } = alertMessageSlice.actions;
  const dispatch = useAppDispatch();
  const { closeModal } = useContext(ModalContext);

  useEffect(() => {
    if (accessValue) {
      setAccessValueName(accessValue.Name);
    }
  }, [accessValue]);

  const [updateAccessValueData] = useUpdateAccessValueMutation();

  const updateAccessValue = async () => {
    try {
      if (!accessValueName || accessValueName.length < 3) {
        dispatch(setAlertMessage('Name must have at least 3 characters'));
        dispatch(setShowAlert(!showAlert));
        return;
      } else if (accessValueName === accessValue.Name) {
        dispatch(setAlertMessage('You need to enter a new name'));
        dispatch(setShowAlert(!showAlert));
        return;
      }

      const body = {
        Name: accessValueName,
      };

      await updateAccessValueData({
        accessValueId: accessValue.Id,
        userId,
        body,
      }).unwrap();

      editAccessValue({ ...accessValue, Name: accessValueName });
      closeModal();

      dispatch(setAlertMessage('The access value has been updated!'));
      dispatch(setShowAlert(!showAlert));
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <Form.Group controlId="formName">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter name"
          value={accessValueName}
          onChange={(e) => setAccessValueName(e.target.value)}
        />
      </Form.Group>
      <Modal.Footer>
        <Button variant="primary" onClick={updateAccessValue}>
          Save
        </Button>
        <Button variant="danger" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </>
  );
};

export default AccessValueModalNew;
