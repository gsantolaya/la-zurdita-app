import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { useForm } from "react-hook-form"
import Form from 'react-bootstrap/Form'
import { TokenStorage } from "../../../utils/TokenStorage"

export const EditSale = ({ show, onHide, fetchSales, selectedSale }) => {

    const [showEditSaleConfirmationToast, setShowEditSaleConfirmationToast] = useState(false)
    const [showEditSaleErrorToast, setShowEditSaleErrorToast] = useState(false)
    const { handleSubmit, register, reset, formState: { errors } } = useForm()
    const store = TokenStorage()

    const handleEditSaleConfirmationToastClose = () => {
        setShowEditSaleConfirmationToast(false)
    }
    const handleEditSaleErrorToastClose = () => {
        setShowEditSaleErrorToast(false)
    }

    useEffect(() => {
        if (selectedSale) {
            reset({
                user: selectedSale.user,
                date: selectedSale.date,
                client: selectedSale.client,
                type: selectedSale.type,
                amount: selectedSale.amount,
                amountDescription: selectedSale.amountDescription,
                product: selectedSale.product,
                productStatus: selectedSale.productStatus,
                unitPrice: selectedSale.unitPrice,
                wayToPay: selectedSale.wayToPay,
                payment: selectedSale.payment,
                tip: selectedSale.tip,
                status: selectedSale.status
            })
        }
    }, [selectedSale, reset])


    // FUNCION PARA MODIFICAR UN PRODUCTO
    const handleEditSaleFormSubmit = async (formData) => {
        const clientId = selectedSale.client
        const clientResponse = await axios.get(`/clients/${clientId}`, {
            headers: {
                "access-token": store.token,
            },
        })
        const clientData = clientResponse.data
        const lastPayment = selectedSale.payment
        const newPayment = formData.payment
        const previousBalance = clientData.balance
        const newBalance = previousBalance - (newPayment - lastPayment)
        try {
            const updatedSale = {
                firstName: selectedSale.firstName,
                user: selectedSale.user,
                date: selectedSale.date,
                client: selectedSale.client,
                type: selectedSale.type,
                amount: selectedSale.amount,
                amountDescription: selectedSale.amountDescription,
                product: selectedSale.product,
                productStatus: selectedSale.productStatus,
                unitPrice: selectedSale.unitPrice,
                wayToPay: selectedSale.wayToPay,
                payment: formData.payment,
                tip: formData.tip,
                status: selectedSale.status
            }

            const config = {
                headers: {
                    "access-token": store.token,
                },
            }

            await axios.put(`/sales/${selectedSale._id}`, updatedSale, config)

            const balanceUpdateConfig = {
                headers: {
                    "access-token": store.token,
                },
            }
            await axios.patch(`/clients/${clientId}/balance`, { balance: newBalance }, balanceUpdateConfig)

            onHide()
            setShowEditSaleConfirmationToast(true)
            reset()
            fetchSales()
        } catch (error) {
            console.error("Error al actualizar la venta:", error)
            setShowEditSaleErrorToast(true)
        }
    }

    return (
        <>
            {/* MODAL */}
            <Modal show={show} onHide={onHide}>
                <Modal.Header className='modalHeader' closeButton>
                    <Modal.Title className="modalTitle">
                        <strong>Modificar información</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody'>
                    {selectedSale ? (
                        <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleEditSaleFormSubmit)}>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicPayment">
                                <Form.Label className='modalLabel'>Pagado:</Form.Label>
                                <Form.Control type="number" maxLength={20} name="payment" placeholder="0000"
                                    {...register("payment", { required: true })}
                                    defaultValue={selectedSale.payment}
                                />
                                {errors?.payment && (<span className="authSpan">Este campo es requerido</span>)}
                            </Form.Group>
                            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicPayment">
                                <Form.Label className='modalLabel'>Propina:</Form.Label>
                                <Form.Control type="number" maxLength={20} name="tip" placeholder="0000"
                                    {...register("tip", { required: false })}
                                    defaultValue={selectedSale.tip}
                                />
                            </Form.Group>
                            <Modal.Footer className="mt-3 col-12">
                                <Button className='buttonsFormAddSale m-2 w-100' variant="secondary" type="submit">
                                    Guardar Cambios
                                </Button>
                                <Button className='buttonsFormAddSale m-2 w-100' variant="secondary" onClick={onHide}>
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
                <Toast show={showEditSaleConfirmationToast} onClose={handleEditSaleConfirmationToastClose} className="toastConfirmation" delay={5000} autohide>
                    <Toast.Header className="toastConfirmationHeader">
                        <strong className="me-auto">Actualización Exitosa</strong>
                    </Toast.Header>
                    <Toast.Body>Los cambios en la venta se han guardado correctamente.</Toast.Body>
                </Toast>
                <Toast show={showEditSaleErrorToast} onClose={handleEditSaleErrorToastClose} className="toastError" delay={5000} autohide>
                    <Toast.Header className="toastErrorHeader">
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Hubo un error al guardar los cambios en la venta. Por favor, inténtalo nuevamente.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    )
}
