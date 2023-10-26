//IMPORTACIONES
import React, { useState } from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import Form from 'react-bootstrap/Form'
import { TokenStorage } from "../../../utils/TokenStorage"
import { useForm } from "react-hook-form"

export const AddProduct = ({ show, onHide, fetchProducts }) => {

    const { handleSubmit, register, reset, formState: { errors } } = useForm()
    const [showConfirmationAddProductToast, setShowConfirmationAddProductToast] = useState(false)
    const [showErrorAddProductToast, setShowErrorAddProductToast] = useState(false)
    const store = TokenStorage()

    const handleConfirmationAddProductToastClose = () => {
        setShowConfirmationAddProductToast(false)
    }
    const handleErrorAddProductToastClose = () => {
        setShowErrorAddProductToast(false)
    }

    //FUNCION PARA AGREGAR UN PRODUCTO
    const handleAddProductFormSubmit = async (data) => {
        try {
            const response = await axios.post('/products', { ...data }, {
                headers: {
                    "access-token": store.token
                }
            })
            if (response.status === 201) {
                onHide()
                fetchProducts()
                reset()
                setShowConfirmationAddProductToast(true)
            }
        } catch (error) {
            onHide()
            setShowErrorAddProductToast(true)
            console.error(error)
        }
    }

    return (
        <>
            {/* MODAL */}
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton className='modalHeader'>
                    <Modal.Title className="modalTitle">
                        <strong>Nueva Empanada</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody'>
                    <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleAddProductFormSubmit)}>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicType">
                            <Form.Label className='modalLabel'>Variedad:</Form.Label>
                            <Form.Control
                                type="text"
                                maxLength={30}
                                name="type"
                                placeholder="Ingrese la variedad"
                                {...register("type", { required: true })}
                            />
                            {errors.type && (<span className="authSpan">Este campo es requerido</span>)}
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicUnitPrice">
                            <Form.Label className='modalLabel'>Precio por unidad:</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                step="0.01"
                                name="unitPrice"
                                placeholder="Ingrese el precio"
                                {...register("unitPrice", { required: true, min: 0 })}
                            />
                            {errors.unitPrice && (<span className="authSpan">Este campo es requerido y debe ser un número positivo</span>)}
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicRetailPrice">
                            <Form.Label className='modalLabel'>Precio Minorista:</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                step="0.01"
                                name="retailPrice"
                                placeholder="Ingrese el precio"
                                {...register("retailPrice", { required: true, min: 0 })}
                            />
                            {errors.retailPrice && (<span className="authSpan">Este campo es requerido y debe ser un número positivo</span>)}
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicWholesalePrice">
                            <Form.Label className='modalLabel'>Precio Mayorista:</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                step="0.01"
                                name="wholesalePrice"
                                placeholder="Ingrese el precio"
                                {...register("wholesalePrice", { required: true, min: 0 })}
                            />
                            {errors.wholesalePrice && (<span className="authSpan">Este campo es requerido y debe ser un número positivo</span>)}
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicStock">
                            <Form.Label className='modalLabel'>Stock:</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                name="stock"
                                placeholder="Ingrese el stock"
                                {...register("stock", { required: true, min: 0 })}
                            />
                            {errors.stock && (<span className="authSpan">Este campo es requerido y debe ser un número positivo</span>)}
                        </Form.Group>
                        <Modal.Footer className="mt-3 col-12">
                            <Button className='buttonsFormAddProduct m-2 w-100' variant="secondary" type="submit">
                                Agregar Empanada
                            </Button>
                            <Button className='buttonsFormAddProduct m-2 w-100' variant="secondary" onClick={onHide}>
                                Cancelar
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>
            
            {/* TOASTS*/}
            <ToastContainer className="p-3" style={{ position: 'fixed', zIndex: 1, bottom: '20px', right: '20px', }} >
                <Toast show={showConfirmationAddProductToast} onClose={handleConfirmationAddProductToastClose} className="toastConfirmation" delay={5000} autohide>
                    <Toast.Header className="toastConfirmationHeader">
                        <strong className="me-auto">Registro Exitoso</strong>
                    </Toast.Header>
                    <Toast.Body>El nuevo producto ha sido agregado correctamente.</Toast.Body>
                </Toast>
                <Toast show={showErrorAddProductToast} onClose={handleErrorAddProductToastClose} className="toastError" delay={5000} autohide>
                    <Toast.Header className="toastErrorHeader">
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Hubo un error al agregar el nuevo producto. Por favor, inténtalo nuevamente.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    )
}
