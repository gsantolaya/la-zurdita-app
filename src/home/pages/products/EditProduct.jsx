import React, { useState, useEffect } from 'react';
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer';
import { useForm } from "react-hook-form"
import Form from 'react-bootstrap/Form'
import { TokenStorage } from "../../../utils/TokenStorage"

export const EditProduct = ({ show, onHide, fetchProducts, selectedProduct }) => {
    console.log(selectedProduct)
    const [showEditProductConfirmationToast, setShowEditProductConfirmationToast] = useState(false)
    const [showEditProductErrorToast, setShowEditProductErrorToast] = useState(false)
    const { handleSubmit, register, reset, formState: { errors } } = useForm()
    const store = TokenStorage()

    const handleEditProductConfirmationToastClose = () => {
        setShowEditProductConfirmationToast(false)
    }
    const handleEditProductErrorToastClose = () => {
        setShowEditProductErrorToast(false)
    }

    useEffect(() => {
        if (selectedProduct) {
            reset({
                type: selectedProduct.type,
                unitPrice: selectedProduct.unitPrice,
                retailPrice: selectedProduct.retailPrice,
                wholesalePrice: selectedProduct.wholesalePrice,
                stock: selectedProduct.stock,
            });
        }
    }, [selectedProduct, reset]);


    // FUNCION PARA MODIFICAR UN PRODUCTO
    const handleEditProductFormSubmit = async (formData) => {
        try {
            const updatedProduct = {
                type: formData.type,
                unitPrice: formData.unitPrice,
                retailPrice: formData.retailPrice,
                wholesalePrice: formData.wholesalePrice,
                stock: formData.stock,
            }
            const config = {
                headers: {
                    "access-token": store.token,
                },
            }
            await axios.put(`/products/${selectedProduct._id}`, updatedProduct, config)
            onHide()
            setShowEditProductConfirmationToast(true)
            reset()
            fetchProducts()
        } catch (error) {
            console.error("Error al actualizar el producto:", error)
            setShowEditProductErrorToast(true)
        }
    }

    return (
        <>
            {/* MODAL */}
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton className='modalHeader'>
                    <Modal.Title className="modalTitle">
                        <strong>Modificar producto</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody'>
                    {selectedProduct ? (
                        <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleEditProductFormSubmit)}>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicType">
                                <Form.Label>Variedad:</Form.Label>
                                <Form.Control
                                    type="text"
                                    maxLength={30}
                                    name="type"
                                    placeholder="Ingrese la variedad"
                                    {...register('type', { required: true })}
                                    defaultValue={selectedProduct.type}
                                />
                                {errors.type && (<span className="authSpan">Este campo es requerido</span>)}
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicUnitPrice">
                                <Form.Label>Precio por unidad:</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="unitPrice"
                                    placeholder="Ingrese el precio"
                                    {...register('unitPrice', { required: true, min: 0 })}
                                    defaultValue={selectedProduct.unitPrice}
                                />
                                {errors.unitPrice && (<span className="authSpan">Este campo es requerido y debe ser un número positivo</span>)}
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicRetailPrice">
                                <Form.Label>Precio minorista:</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="retailPrice"
                                    placeholder="Ingrese el precio"
                                    {...register('retailPrice', { required: true, min: 0 })}
                                    defaultValue={selectedProduct.retailPrice}
                                />
                                {errors.retailPrice && (<span className="authSpan">Este campo es requerido y debe ser un número positivo</span>)}
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicWholesalePrice">
                                <Form.Label>Precio mayorista:</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="wholesalePrice"
                                    placeholder="Ingrese el precio"
                                    {...register('wholesalePrice', { required: true, min: 0 })}
                                    defaultValue={selectedProduct.wholesalePrice}
                                />
                                {errors.wholesalePrice && (<span className="authSpan">Este campo es requerido y debe ser un número positivo</span>)}
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicStock">
                                <Form.Label>Stock:</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    name="stock"
                                    placeholder="Ingrese el stock"
                                    {...register('stock', { required: true, min: 0 })}
                                    defaultValue={selectedProduct.stock}
                                />
                                {errors.stock && (<span className="authSpan">Este campo es requerido y debe ser un número positivo</span>)}
                            </Form.Group>
                            <Modal.Footer className="mt-3 col-12">
                                <Button className='buttonsFormAddProduct m-2 w-100' variant="secondary" type="submit">
                                    Guardar Cambios
                                </Button>
                                <Button className='buttonsFormAddProduct m-2 w-100' variant="secondary" onClick={onHide}>
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
                <Toast show={showEditProductConfirmationToast} onClose={handleEditProductConfirmationToastClose} className="toastConfirmation" delay={5000} autohide>
                    <Toast.Header className="toastConfirmationHeader">
                        <strong className="me-auto">Actualización Exitosa</strong>
                    </Toast.Header>
                    <Toast.Body>Los cambios en el producto se han guardado correctamente.</Toast.Body>
                </Toast>
                <Toast show={showEditProductErrorToast} onClose={handleEditProductErrorToastClose} className="toastError" delay={5000} autohide>
                    <Toast.Header className="toastErrorHeader">
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Hubo un error al guardar los cambios en el producto. Por favor, inténtalo nuevamente.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    )
}
