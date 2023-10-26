import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import { FaTrashAlt, FaEdit } from "react-icons/fa"
import { tokenIsValid } from '../../utils/TokenIsValid'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import { useForm } from 'react-hook-form'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import './UsersScreen.css'

export const UsersScreen = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [editedUser, setEditedUser] = useState(null)
  const [showEditMyUserModal, setShowEditMyUserModal] = useState(false)
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false)
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false)
  const [showEditUserConfirmationToast, setShowEditUserConfirmationToast] = useState(false)
  const [showEditUserErrorToast, setShowEditUserErrorToast] = useState(false)
  const [showEditPasswordConfirmationToast, setShowEditPasswordConfirmationToast] = useState(false)
  const [showEditPasswordErrorToast, setShowEditPasswordErrorToast] = useState(false)
  const [showDeleteUserConfirmationToast, setShowDeleteUserConfirmationToast] = useState(false)
  const [showDeleteUserErrorToast, setShowDeleteUserErrorToast] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios.get('/users', {
      headers: {
        'access-token': `${token}`
      }
    })
      .then((response) => {
        setUsers(response.data)
      })
      .catch((error) => {
      })
  }, [])
  const handleShowEditMyUserModal = (user) => {
    setEditedUser({
      ...user,
      email: user.email,
      password: ''
    })
    setShowEditMyUserModal(true)
  }
  const handleCloseEditMyUserModal = () => {
    setEditedUser(null)
    setShowEditMyUserModal(false)
  }
  const handleEditMyUserFormSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      const response = await axios.put(`/users/${editedUser._id}`, editedUser, {
        headers: {
          'access-token': token
        }
      })
      if (response.status === 200) {
        const updatedUsers = users.map((user) => {
          if (user._id === editedUser._id) {
            return { ...user, ...editedUser }
          }
          return user
        })
        setUsers(updatedUsers)
        handleCloseEditMyUserModal()
        setShowEditUserConfirmationToast(true)
      }
    } catch (error) {
      console.log(error)
      handleCloseEditMyUserModal()
      setShowEditUserErrorToast(true)
    }
  }

  const handleEditInputChange = (event) => {
    const { name, value, type, checked } = event.target

    if (type === 'checkbox') {
      setEditedUser((prevUser) => ({
        ...prevUser,
        [name]: checked,
      }))
    } else {
      setEditedUser((prevUser) => ({
        ...prevUser,
        [name]: name === 'password' && value === '' ? prevUser.password : value,
      }))
    }
  }
  const handleShowEditPassword = (user) => {
    setEditedUser({
      ...user,
      email: user.email,
      password: ''
    })
    setShowEditPasswordModal(true)
  }

  const handleCloseEditPasswordModal = () => {
    setEditedUser(null)
    setShowEditPasswordModal(false)
  }

  const handleEditUserConfirmationToastClose = () => {
    setShowEditUserConfirmationToast(false)
  }
  const handleEditUserErrorToastClose = () => {
    setShowEditUserErrorToast(false)
  }
  const handleEditPasswordConfirmationToastClose = () => {
    setShowEditPasswordConfirmationToast(false)
  }
  const handleEditPasswordErrorToastClose = () => {
    setShowEditPasswordErrorToast(false)
  }
  const handleDeleteUserConfirmationToastClose = () => {
    setShowDeleteUserConfirmationToast(false)
  }
  const handleDeleteUserErrorToastClose = () => {
    setShowDeleteUserErrorToast(false)
  }
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const handleEditPasswordFormSubmit = handleSubmit(async (data) => {
    const token = localStorage.getItem('token')
    try {
      const response = await axios.put(
        '/users/reset/password',
        { email: editedUser.email, password: data.password },
        {
          headers: {
            'access-token': token,
          },
        }
      )
      if (response.status === 200) {
        const updatedUsers = users.map((user) => {
          if (user._id === editedUser._id) {
            return { ...user, ...editedUser }
          }
          return user
        })
        setUsers(updatedUsers)
        handleCloseEditPasswordModal()
        setShowEditPasswordConfirmationToast(true)
      }
    } catch (error) {
      console.log(error)
      handleCloseEditPasswordModal()
      setShowEditPasswordErrorToast(true)
    }
  })
  const handleShowDeleteUserModal = (user) => {
    setSelectedUser(user)
    setShowDeleteUserModal(true)
  }
  const handleCloseDeleteUserModal = () => {
    setSelectedUser(null)
    setShowDeleteUserModal(false)
  }
  const deleteUser = async (id) => {
    const token = localStorage.getItem('token')
    try {
      const response = await axios.delete(`/users/${id}`, {
        headers: {
          'access-token': `${token}`
        }
      })
      if (response.status === 200) {
        handleCloseDeleteUserModal()
        setShowDeleteUserConfirmationToast(true)
        const { data } = await axios.get('/users')
        setUsers(data)
      }
    } catch (error) {
      setShowDeleteUserErrorToast(true)
      handleCloseDeleteUserModal()
    }
  }
  const decodedToken = tokenIsValid()
  return (
    <>
      <div className='text-center p-5 table-container'>
        <h1 className="title mb-3 productTitle"><b>Bienvenid@ {decodedToken.firstName}</b></h1>
        <h4 className="text-start title mb-3 productTitle"><b>Mi usuario:</b></h4>
        <div className='scrollable-x-table'>
          <Table striped bordered hover>
            <tbody>
              {
                users.map((user) => {
                  const isCurrentUser = user.email === decodedToken.email
                  if (!isCurrentUser) {
                    return null
                  }
                  return (
                    <tr key={user._id}>
                      <td className='py-4'>{user.email}</td>
                      <td className='pt-3'>
                        {isCurrentUser && (
                          <>
                            <Button className='m-1' variant="secondary" onClick={() => handleShowEditPassword(user)}>Modificar contraseña</Button>
                            <Button className='m-1' onClick={() => handleShowEditMyUserModal(user)} variant="dark"><FaEdit /></Button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>
        </div>
      </div>
      {decodedToken.isAdmin && (
        <div className='text-center px-5 table-container mt-5 mt-md-0'>
          <h4 className="text-start title mb-3 productTitle"><b>Otros Usuarios:</b></h4>
          <div className='scrollable-x-table'>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className='homeText productTitle'>Usuario</th>
                  <th className='homeText productTitle'>Apellido y Nombre</th>
                  <th className='homeText productTitle'>Tipo de cuenta</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isCurrentUser = user.email === decodedToken.email;
                  const isEmailAdmin = user.email === process.env.REACT_APP_EMAIL_ADMIN;
                  if (isCurrentUser || isEmailAdmin) {
                    return null;
                  }

                  const userClass = user.isActivated ? '' : 'inactive-user';

                  return (
                    <tr key={user._id}>
                      <td className={`py-4 ${userClass}`}>{user.email}</td>
                      <td className={`py-4 ${userClass}`}>{user.lastName} {user.firstName}</td>
                      <td className={`py-4 ${userClass}`}>{user.isAdmin ? 'Administrador' : 'Usuario'}</td>
                      <td className='pt-3'>
                        <Button className='m-1' variant="secondary" onClick={() => handleShowEditPassword(user)}>Modificar contraseña</Button>
                        <Button className='m-1' onClick={() => handleShowEditMyUserModal(user)} variant="dark"><FaEdit /></Button>
                        <Button className='m-1' onClick={() => handleShowDeleteUserModal(user)} variant="danger">
                          <FaTrashAlt />
                        </Button>
                      </td>
                    </tr>
                  );
                })}

              </tbody>
            </Table>
          </div>
        </div>
      )}
      <Modal show={showEditMyUserModal} onHide={handleCloseEditMyUserModal}>
        <Modal.Header className='modalHeader' closeButton>
          <Modal.Title className='modalTitle' ><strong>Editar Usuario</strong></Modal.Title>
        </Modal.Header>
        <Modal.Body className='modalBody'>
          <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleEditMyUserFormSubmit}>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="editFormFirstName">
              <Form.Label className='modalLabel'>Nombre:</Form.Label>
              <Form.Control
                type="text"
                maxLength={20}
                name="firstName"
                value={editedUser?.firstName || ''}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="editFormLasttName">
              <Form.Label className='modalLabel'>Apellido:</Form.Label>
              <Form.Control
                type="text"
                maxLength={20}
                name="lastName"
                value={editedUser?.lastName || ''}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            {decodedToken.isAdmin && (
              <>
                <Form.Group className='formFields m-2 col-10 col-md-5' controlId="editFormIsActivated">
                  <Form.Check className="mt-3 modalLabel"
                    type="checkbox"
                    name="isActivated"
                    checked={editedUser?.isActivated || false}
                    onChange={handleEditInputChange}
                    label="Cuenta activa"
                  />
                </Form.Group>
                <Form.Group className='formFields m-2 col-10 col-md-5' controlId="editFormIsAdmin">
                  <Form.Check className="mt-3 modalLabel"
                    type="checkbox"
                    name="isAdmin"
                    checked={editedUser?.isAdmin || false}
                    onChange={handleEditInputChange}
                    label="Administrador"
                  />
                </Form.Group>
              </>
            )}
            <Modal.Footer className="mt-3 col-12">
              <Button className='buttonsFormAddProduct m-2 w-100' variant="secondary" type="submit">
                Guardar cambios
              </Button>
              <Button className='buttonsFormAddProduct m-2 w-100' variant="secondary" onClick={handleCloseEditMyUserModal}>
                Cancelar
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={showEditPasswordModal} onHide={handleCloseEditPasswordModal}>
        <Modal.Header className='modalHeader' closeButton>
          <Modal.Title className="modalTitle"><strong>Modificar contraseña</strong></Modal.Title>
        </Modal.Header>
        <Modal.Body className='modalBody'>
          <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleEditPasswordFormSubmit}>
            <Form.Group className="formFields m-2 col-10" controlId="editFormFirstName">
              <Form.Label className='modalLabel'>Email:</Form.Label>
              <Form.Control
                type="text"
                name="email"
                value={editedUser?.email || ''}
                disabled
              />
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="editFormPassword">
              <Form.Label className='modalLabel'>Nueva contraseña:</Form.Label>
              <Form.Control
                type="password"
                maxLength={35}
                name="password"
                placeholder='xxxxxx'
                {...register('password', { required: true, pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/ })}
              />
              {errors.password && (
                <span className="text-danger">
                  La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y tener al menos 6 caracteres.
                </span>
              )}
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="editFormRepeatPassword">
              <Form.Label className='modalLabel'>Repetir contraseña:</Form.Label>
              <Form.Control
                type="password"
                maxLength={35}
                name="repeatPassword"
                placeholder='xxxxxx'
                {...register('repeatPassword', { required: true, validate: value => value === watch('password') })}
              />
              {errors.repeatPassword && (
                <span className="text-danger">
                  Las contraseñas ingresadas no son iguales.
                </span>
              )}
            </Form.Group>
            <Modal.Footer className='mt-3 col-12'>
              <Button className='buttonsFormAddProduct m-2 w-100' variant="secondary" type="submit">
                Modificar
              </Button>
              <Button className='buttonsFormAddProduct m-2 w-100' variant="secondary" onClick={handleCloseEditPasswordModal}>
                Cancelar
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={showDeleteUserModal} onHide={handleCloseDeleteUserModal}>
        <Modal.Header className='modalHeader' closeButton>
          <Modal.Title className='modalTitle'><strong>Confirmar Eliminación</strong></Modal.Title>
        </Modal.Header>
        <Modal.Body className='modalBody py-4'>
          ¿Estás seguro de que deseas eliminar la cuenta de <b>{selectedUser?.firstName} {selectedUser?.lastName}</b>?</Modal.Body>
        <Modal.Footer className='modalBody'>
          <Button variant="secondary" onClick={handleCloseDeleteUserModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => deleteUser(selectedUser?._id)}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="position-fixed bottom-0 end-0 p-3">
        <Toast show={showEditUserConfirmationToast} onClose={handleEditUserConfirmationToastClose} delay={3000} autohide>
          <Toast.Header>
            <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
            <strong className="me-auto">Confirmación</strong>
            <small>Ahora</small>
          </Toast.Header>
          <Toast.Body>Usuario editado correctamente.</Toast.Body>
        </Toast>
      </div>
      <ToastContainer className="p-3" style={{ position: 'fixed', zIndex: 1, bottom: '20px', right: '20px', }} >
        <Toast show={showEditUserErrorToast} onClose={handleEditUserErrorToastClose} delay={3000} autohide>
          <Toast.Header>
            <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
            <strong className="me-auto">Error</strong>
            <small>Ahora</small>
          </Toast.Header>
          <Toast.Body>No se pudo editar al usuario seleccionado.</Toast.Body>
        </Toast>
        <Toast show={showEditPasswordConfirmationToast} onClose={handleEditPasswordConfirmationToastClose} delay={3000} autohide>
          <Toast.Header>
            <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
            <strong className="me-auto">Confirmación</strong>
            <small>Ahora</small>
          </Toast.Header>
          <Toast.Body>Contraseña modificada correctamente.</Toast.Body>
        </Toast>
        <Toast show={showEditPasswordErrorToast} onClose={handleEditPasswordErrorToastClose} delay={3000} autohide>
          <Toast.Header>
            <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
            <strong className="me-auto">Error</strong>
            <small>Ahora</small>
          </Toast.Header>
          <Toast.Body>No se pudo modificar la contraseña.</Toast.Body>
        </Toast>
        <Toast show={showDeleteUserConfirmationToast} onClose={handleDeleteUserConfirmationToastClose} delay={3000} autohide>
          <Toast.Header>
            <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
            <strong className="me-auto">Confirmación</strong>
            <small>Ahora</small>
          </Toast.Header>
          <Toast.Body>Usuario eliminado correctamente.</Toast.Body>
        </Toast>
        <Toast show={showDeleteUserErrorToast} onClose={handleDeleteUserErrorToastClose} delay={3000} autohide>
          <Toast.Header>
            <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
            <strong className="me-auto">Error</strong>
            <small>Ahora</small>
          </Toast.Header>
          <Toast.Body>No se pudo eliminar al usuario seleccionado.</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}