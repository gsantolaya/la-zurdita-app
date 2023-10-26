//IMPORTACIONES
import React, { useState } from 'react'
import axios from 'axios'
import { Button } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import Form from 'react-bootstrap/Form'
import { TokenStorage } from "../../../utils/TokenStorage"
import { useForm } from "react-hook-form"

export const AddClient = ({ show, onHide, fetchClients }) => {

    const { handleSubmit, register, reset, formState: { errors } } = useForm()
    const [showConfirmationAddClientToast, setShowConfirmationAddClientToast] = useState(false)
    const [showErrorAddClientToast, setShowErrorAddClientToast] = useState(false)
    const store = TokenStorage()

    const handleConfirmationAddClientToastClose = () => {
        setShowConfirmationAddClientToast(false)
    }
    const handleErrorAddClientToastClose = () => {
        setShowErrorAddClientToast(false)
    }
    const handleOnHideModal = () => {
        reset()
        onHide()
      }
    //FUNCION PARA AGREGAR UN CLIENTE
    const handleAddClientFormSubmit = async (data) => {
        const isPaymentUpToDate = true
        const newData = { ...data, isPaymentUpToDate }
        console.log(newData)
        try {
            const response = await axios.post('/clients', { ...newData }, {
                headers: {
                    "access-token": store.token
                }
            })
            if (response.status === 201) {
                onHide()
                fetchClients()
                reset()
                setShowConfirmationAddClientToast(true)
            }
        } catch (error) {
            onHide()
            setShowErrorAddClientToast(true)
            console.error(error)
        }
    }

    return (
        <>
            {/* MODAL */}
            <Modal show={show} onHide={handleOnHideModal}>
                <Modal.Header closeButton className='modalHeader'>
                    <Modal.Title className="modalTitle">
                        <strong>Nuevo Cliente</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody'>
                    <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleAddClientFormSubmit)}>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicFirstName">
                            <Form.Label className='modalLabel'>Nombre:</Form.Label>
                            <Form.Control type="text" maxLength={30} name="firstName" placeholder="Ingrese el nombre"
                                {...register("firstName", { required: true })}
                            />
                            {errors?.firstName && (<span className="authSpan">Este campo es requerido</span>)}
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicLastName">
                            <Form.Label className='modalLabel'>Apellido:</Form.Label>
                            <Form.Control type="text" maxLength={30} name="lastName" placeholder="Ingrese el apellido"
                                {...register("lastName", { required: true })}
                            />
                            {errors?.lastName && (<span className="authSpan">Este campo es requerido</span>)}
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicDescription">
                            <Form.Label className='modalLabel'>Teléfono:</Form.Label>
                            <Form.Control type="number" maxLength={30} name="phone" placeholder="Ingrese un teléfono"
                                {...register("phone", { required: true })}
                            />
                            {errors?.phone && (<span className="authSpan">Este campo es requerido</span>)}
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicValue">
                            <Form.Label className='modalLabel'>Dirección:</Form.Label>
                            <Form.Control type="text" maxLength={20} name="address" placeholder="Ingrese una dirección"
                                {...register("address", { required: true })}
                            />
                            {errors?.address && (<span className="authSpan">Este campo es requerido</span>)}
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10" controlId="formBasicGender">
                            <Form.Label className='modalLabel'>Categoría:</Form.Label>
                            <Form.Select as="select" name="category" {...register("category", { required: true })}>
                                <option value="">Selecciona una categoría</option>
                                <option value="minorista">Minorista</option>
                                <option value="mayorista">Mayorista</option>
                            </Form.Select>
                        </Form.Group>
                        <Modal.Footer className="mt-3 col-12">
                            <Button className='buttonsFormAddClient m-2 w-100' variant="secondary" type="submit">
                                Agregar Cliente
                            </Button>
                            <Button className='buttonsFormAddClient m-2 w-100' variant="secondary" onClick={handleOnHideModal}>
                                Cancelar
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* TOASTS*/}
            <ToastContainer className="p-3" style={{ position: 'fixed', zIndex: 1, bottom: '20px', right: '20px', }} >
                <Toast show={showConfirmationAddClientToast} onClose={handleConfirmationAddClientToastClose} className="toastConfirmation" delay={5000} autohide>
                    <Toast.Header className="toastConfirmationHeader">
                        <strong className="me-auto">Registro Exitoso</strong>
                    </Toast.Header>
                    <Toast.Body>El nuevo cliente ha sido agregado correctamente.</Toast.Body>
                </Toast>
                <Toast show={showErrorAddClientToast} onClose={handleErrorAddClientToastClose} className="toastError" delay={5000} autohide>
                    <Toast.Header className="toastErrorHeader">
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Hubo un error al agregar el nuevo cliente. Por favor, inténtalo nuevamente.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    )
}
