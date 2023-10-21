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

export const AddExpense = ({ show, onHide, fetchExpenses }) => {

    const { handleSubmit, register, reset, formState: { errors } } = useForm()
    const [showConfirmationAddExpenseToast, setShowConfirmationAddExpenseToast] = useState(false)
    const [showErrorAddExpenseToast, setShowErrorAddExpenseToast] = useState(false)
    const store = TokenStorage()

    const handleConfirmationAddExpenseToastClose = () => {
        setShowConfirmationAddExpenseToast(false)
    }
    const handleErrorAddExpenseToastClose = () => {
        setShowErrorAddExpenseToast(false)
    }

    //FUNCION PARA AGREGAR UN PRODUCTO
    const handleAddExpenseFormSubmit = async (data) => {
        try {
            const response = await axios.post('/expenses', { ...data }, {
                headers: {
                    "access-token": store.token
                }
            })
            if (response.status === 201) {
                onHide()
                fetchExpenses()
                reset()
                setShowConfirmationAddExpenseToast(true)
            }
        } catch (error) {
            onHide()
            setShowErrorAddExpenseToast(true)
            console.error(error)
        }
    }

    return (
        <>
            {/* MODAL */}
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton className='modalHeader'>
                    <Modal.Title className="modalTitle">
                        <strong>Nuevo Gasto</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody'>
                    <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleAddExpenseFormSubmit)}>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicDate">
                            <Form.Label>Fecha:</Form.Label>
                            <Form.Control type="date" name="date"
                                {...register("date", { required: true })} max={new Date().toISOString().split('T')[0]} />
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicVoucherNumber">
                            <Form.Label>Número de comprobante</Form.Label>
                            <Form.Control type="number" name="voucherNumber" placeholder="Ingrese el número"
                                {...register("voucherNumber", { required: true })}
                            />
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicProvider">
                            <Form.Label>Proveedor</Form.Label>
                            <Form.Control type="text" name="provider" placeholder="Ingrese el proveedor"
                                {...register("provider", { required: true })}
                            />
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicAmount">
                            <Form.Label>Cantidad</Form.Label>
                            <Form.Control type="number" name="amount" placeholder="Ingrese la cantidad"
                                {...register("amount", { required: true })}
                            />
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicDescription">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control type="text" name="description" placeholder="Ingrese la descripción"
                                {...register("description", { required: true })}
                            />
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicAdditionalDescription">
                            <Form.Label>Descripción Adicional</Form.Label>
                            <Form.Control type="text" name="additionalDescription" placeholder="Ingrese la descripción adicional"
                                {...register("additionalDescription", { required: true })}
                            />
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicUnitPrice">
                            <Form.Label>Precio Unitario</Form.Label>
                            <Form.Control type="number" name="unitPrice" placeholder="Ingrese el precio"
                                {...register("unitPrice", { required: true })}
                            />
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicWayToPay">
                            <Form.Label>Forma de pago:</Form.Label>
                            <Form.Select as="select" name="wayToPay" {...register("wayToPay", { required: true })}>
                                <option value="">Seleccione una opción</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">MercadoPago</option>
                                <option value="transferencia">Transferencia</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicPayment">
                            <Form.Label>Pago</Form.Label>
                            <Form.Control type="number" maxLength={10} name="payment" placeholder="Ingrese la cantidad"
                                {...register("payment", { required: true })}
                            />
                            {errors?.payment && (<span className="authSpan">Este campo es requerido</span>)}
                        </Form.Group>
                        <Modal.Footer className="mt-3 col-12">
                            <Button className='buttonsFormAddExpense m-2 w-100' variant="secondary" type="submit">
                                Agregar Gasto
                            </Button>
                            <Button className='buttonsFormAddExpense m-2 w-100' variant="secondary" onClick={onHide}>
                                Cancelar
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* TOASTS*/}
            <ToastContainer className="p-3" style={{ position: 'fixed', zIndex: 1, bottom: '20px', right: '20px', }} >
                <Toast show={showConfirmationAddExpenseToast} onClose={handleConfirmationAddExpenseToastClose} className="toastConfirmation" delay={5000} autohide>
                    <Toast.Header className="toastConfirmationHeader">
                        <strong className="me-auto">Registro Exitoso</strong>
                    </Toast.Header>
                    <Toast.Body>El nuevo gasto ha sido agregado correctamente.</Toast.Body>
                </Toast>
                <Toast show={showErrorAddExpenseToast} onClose={handleErrorAddExpenseToastClose} className="toastError" delay={5000} autohide>
                    <Toast.Header className="toastErrorHeader">
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Hubo un error al agregar el nuevo gasto. Por favor, inténtalo nuevamente.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    )
}
