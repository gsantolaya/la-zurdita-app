import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { useForm } from "react-hook-form"
import Form from 'react-bootstrap/Form'
import { TokenStorage } from "../../../utils/TokenStorage"

export const EditClient = ({ show, onHide, fetchClients, selectedClient }) => {

    const [showEditClientConfirmationToast, setShowEditClientConfirmationToast] = useState(false)
    const [showEditClientErrorToast, setShowEditClientErrorToast] = useState(false)
    const { handleSubmit, register, reset, formState: { errors } } = useForm()
    const store = TokenStorage()

    const handleEditClientConfirmationToastClose = () => {
        setShowEditClientConfirmationToast(false)
    }
    const handleEditClientErrorToastClose = () => {
        setShowEditClientErrorToast(false)
    }
    const handleOnHideModal = () => {
        reset()
        onHide()
      }
    useEffect(() => {
        if (selectedClient) {
            reset({
                firstName: selectedClient.firstName,
                lastName: selectedClient.lastName,
                phone: selectedClient.phone,
                address: selectedClient.address,
                category: selectedClient.category
            })
        }
    }, [selectedClient, reset])


    // FUNCION PARA MODIFICAR UN PRODUCTO
    const handleEditClientFormSubmit = async (formData) => {
        try {
            const updatedClient = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                address: formData.address,
                category: formData.category
            }

            const config = {
                headers: {
                    "access-token": store.token,
                },
            }

            await axios.put(`/clients/${selectedClient._id}`, updatedClient, config)

            onHide()
            setShowEditClientConfirmationToast(true)
            reset()
            fetchClients()
        } catch (error) {
            console.error("Error al actualizar el cliente:", error)
            setShowEditClientErrorToast(true)
        }
    }

    return (
        <>
            {/* MODAL */}
            <Modal show={show} onHide={handleOnHideModal}>
                <Modal.Header className='modalHeader' closeButton>
                    <Modal.Title className="modalTitle">
                        <strong>Modificar información</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody'>
                    {selectedClient ? (
                        <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleEditClientFormSubmit)}>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicFirstName">
                                <Form.Label className='modalLabel'>Nombre:</Form.Label>
                                <Form.Control type="text" maxLength={30} name="firstName" placeholder="Ingrese el nombre"
                                    {...register("firstName", { required: true })}
                                    defaultValue={selectedClient.firstName}
                                />
                                {errors?.firstName && (<span className="authSpan">Este campo es requerido</span>)}
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicLastName">
                                <Form.Label className='modalLabel'>Apellido:</Form.Label>
                                <Form.Control type="text" maxLength={30} name="lastName" placeholder="Ingrese el apellido"
                                    {...register("lastName", { required: true })}
                                    defaultValue={selectedClient.lastName}
                                />
                                {errors?.lastName && (<span className="authSpan">Este campo es requerido</span>)}
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicDescription">
                                <Form.Label className='modalLabel'>Teléfono:</Form.Label>
                                <Form.Control type="number" maxLength={30} name="phone" placeholder="Ingrese un teléfono"
                                    {...register("phone", { required: true })}
                                    defaultValue={selectedClient.phone}
                                />
                                {errors?.phone && (<span className="authSpan">Este campo es requerido</span>)}
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicValue">
                                <Form.Label className='modalLabel'>Dirección:</Form.Label>
                                <Form.Control type="text" maxLength={20} name="address" placeholder="Ingrese una dirección"
                                    {...register("address", { required: true })}
                                    defaultValue={selectedClient.address}
                                />
                                {errors?.address && (<span className="authSpan">Este campo es requerido</span>)}
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10" controlId="formBasicGender">
                                <Form.Label className='modalLabel'>Categoría:</Form.Label>
                                <Form.Select as="select" name="category" defaultValue={selectedClient.category} {...register("category", { required: true })} >
                                    <option value="">Selecciona una categoría</option>
                                    <option value="minorista">Minorista</option>
                                    <option value="mayorista">Mayorista</option>
                                </Form.Select>
                            </Form.Group>
                            <Modal.Footer className="mt-3 col-12">
                                <Button className='buttonsFormAddClient m-2 w-100' variant="secondary" type="submit">
                                    Guardar Cambios
                                </Button>
                                <Button className='buttonsFormAddClient m-2 w-100' variant="secondary" onClick={handleOnHideModal}>
                                    Cancelar
                                </Button>
                            </Modal.Footer>
                        </Form>
                    ) : (
                        <p>Cargando...</p>
                    )}
                </Modal.Body>
            </Modal>

            {/* TOASTS */}
            <ToastContainer className="p-3" style={{ position: 'fixed', zIndex: 1, bottom: '20px', right: '20px', }} >
                <Toast show={showEditClientConfirmationToast} onClose={handleEditClientConfirmationToastClose} className="toastConfirmation" delay={5000} autohide>
                    <Toast.Header className="toastConfirmationHeader">
                        <strong className="me-auto">Actualización Exitosa</strong>
                    </Toast.Header>
                    <Toast.Body>Los cambios en el cliente se han guardado correctamente.</Toast.Body>
                </Toast>
                <Toast show={showEditClientErrorToast} onClose={handleEditClientErrorToastClose} className="toastError" delay={5000} autohide>
                    <Toast.Header className="toastErrorHeader">
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Hubo un error al guardar los cambios en el cliente. Por favor, inténtalo nuevamente.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    )
}
