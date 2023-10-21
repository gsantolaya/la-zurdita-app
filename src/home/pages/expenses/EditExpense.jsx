import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { useForm } from "react-hook-form"
import Form from 'react-bootstrap/Form'
import { TokenStorage } from "../../../utils/TokenStorage"

export const EditExpense = ({ show, onHide, fetchExpenses, selectedExpense }) => {
    console.log(selectedExpense)
    const [showEditExpenseConfirmationToast, setShowEditExpenseConfirmationToast] = useState(false)
    const [showEditExpenseErrorToast, setShowEditExpenseErrorToast] = useState(false)
    const { handleSubmit, register, reset, formState: { errors } } = useForm()
    const store = TokenStorage()

    const handleEditExpenseConfirmationToastClose = () => {
        setShowEditExpenseConfirmationToast(false)
    }
    const handleEditExpenseErrorToastClose = () => {
        setShowEditExpenseErrorToast(false)
    }

    useEffect(() => {
        if (selectedExpense) {
            reset({
                date: selectedExpense.date,
                voucherNumber: selectedExpense.voucherNumber,
                provider: selectedExpense.provider,
                amount: selectedExpense.amount,
                description: selectedExpense.description,
                additionalDescription: selectedExpense.additionalDescription,
                unitPrice: selectedExpense.unitPrice,
                wayToPay: selectedExpense.wayToPay,
                payment: selectedExpense.payment
            })
        }
    }, [selectedExpense, reset])

    // FUNCION PARA MODIFICAR UN GASTO
    const handleEditExpenseFormSubmit = async (formData) => {
        try {
            const updatedExpense = {
                date: selectedExpense.date,
                voucherNumber: formData.voucherNumber,
                provider: formData.provider,
                amount: formData.amount,
                description: formData.description,
                additionalDescription: formData.additionalDescription,
                unitPrice: formData.unitPrice,
                wayToPay: formData.wayToPay,
                payment: formData.payment,
            }
            const config = {
                headers: {
                    "access-token": store.token,
                },
            }
            await axios.put(`/expenses/${selectedExpense._id}`, updatedExpense, config)
            onHide()
            setShowEditExpenseConfirmationToast(true)
            reset()
            fetchExpenses()
        } catch (error) {
            console.error("Error al actualizar el gasto:", error)
            setShowEditExpenseErrorToast(true)
        }
    }

    return (
        <>
            {/* MODAL */}
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton className='modalHeader'>
                    <Modal.Title className="modalTitle">
                        <strong>Modificar gasto</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody'>
                    {selectedExpense ? (
                        <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleEditExpenseFormSubmit)}>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicVoucherNumber">
                                <Form.Label>Número de comprobante</Form.Label>
                                <Form.Control type="number" name="voucherNumber" placeholder="Ingrese el número" defaultValue={selectedExpense.voucherNumber}
                                    {...register("voucherNumber", { required: true })}
                                />
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicProvider">
                                <Form.Label>Proveedor</Form.Label>
                                <Form.Control type="text" name="provider" placeholder="Ingrese el proveedor" defaultValue={selectedExpense.date}
                                    {...register("provider", { required: true })}
                                />
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicAmount">
                                <Form.Label>Cantidad</Form.Label>
                                <Form.Control type="number" name="amount" placeholder="Ingrese la cantidad" defaultValue={selectedExpense.amount}
                                    {...register("amount", { required: true })}
                                />
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicDescription">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control type="text" name="description" placeholder="Ingrese la descripción" defaultValue={selectedExpense.description}
                                    {...register("description", { required: true })}
                                />
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicAdditionalDescription">
                                <Form.Label>Descripción Adicional</Form.Label>
                                <Form.Control type="text" name="additionalDescription" placeholder="Ingrese la descripción adicional" defaultValue={selectedExpense.additionalDescription}
                                    {...register("additionalDescription", { required: true })}
                                />
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicUnitPrice">
                                <Form.Label>Precio Unitario</Form.Label>
                                <Form.Control type="number" name="unitPrice" placeholder="Ingrese el precio" defaultValue={selectedExpense.unitPrice}
                                    {...register("unitPrice", { required: true })}
                                />
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicWayToPay">
                                <Form.Label>Forma de pago:</Form.Label>
                                <Form.Select as="select" name="wayToPay" defaultValue={selectedExpense.wayToPay} {...register("wayToPay", { required: true })}>
                                    <option value="">Seleccione una opción</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">MercadoPago</option>
                                    <option value="transferencia">Transferencia</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicPayment">
                                <Form.Label>Pago</Form.Label>
                                <Form.Control type="number" maxLength={10} name="payment" placeholder="Ingrese la cantidad" defaultValue={selectedExpense.payment}
                                    {...register("payment", { required: true })}
                                />
                                {errors?.payment && (<span className="authSpan">Este campo es requerido</span>)}
                            </Form.Group>
                            <Modal.Footer className="mt-3 col-12">
                                <Button className='buttonsFormAddExpense m-2 w-100' variant="secondary" type="submit">
                                    Guardar Cambios
                                </Button>
                                <Button className='buttonsFormAddExpense m-2 w-100' variant="secondary" onClick={onHide}>
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
                <Toast show={showEditExpenseConfirmationToast} onClose={handleEditExpenseConfirmationToastClose} className="toastConfirmation" delay={5000} autohide>
                    <Toast.Header className="toastConfirmationHeader">
                        <strong className="me-auto">Actualización Exitosa</strong>
                    </Toast.Header>
                    <Toast.Body>Los cambios en el gasto se han guardado correctamente.</Toast.Body>
                </Toast>
                <Toast show={showEditExpenseErrorToast} onClose={handleEditExpenseErrorToastClose} className="toastError" delay={5000} autohide>
                    <Toast.Header className="toastErrorHeader">
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Hubo un error al guardar los cambios en el gasto. Por favor, inténtalo nuevamente.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    )
}
