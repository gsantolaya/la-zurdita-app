import React, { useState } from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { useForm } from "react-hook-form"
import Form from 'react-bootstrap/Form'
import { TokenStorage } from "../../../utils/TokenStorage"

export const FinishOrder = ({ show, onHide, fetchSales, selectedSale }) => {

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
    const handleOnHideModal = () => {
        reset()
        onHide()
      }
    // FUNCION PARA MODIFICAR UN PRODUCTO
    const handleFinishOrderFormSubmit = async (formData) => {
        try {
            const clientId = selectedSale.client

            // Fetch the client's data to get the previous balance
            const clientResponse = await axios.get(`/clients/${clientId}`, {
                headers: {
                    "access-token": store.token,
                },
            })

            const clientData = clientResponse.data

            // Calculate the new balance
            const unitPrice = selectedSale.unitPrice
            const amount = selectedSale.amount
            const payment = formData.payment
            const previousBalance = clientData.balance
            const newBalance = previousBalance + (unitPrice * amount) - payment

            // Update the sale
            const updatedSale = {
                user: selectedSale.user,
                date: selectedSale.date,
                client: selectedSale.client,
                type: selectedSale.type,
                amount: selectedSale.amount,
                amountDescription: selectedSale.amountDescription,
                product: selectedSale.product,
                productStatus: selectedSale.productStatus,
                unitPrice: selectedSale.unitPrice,
                wayToPay: formData.wayToPay,
                payment: formData.payment,
                tip: formData.tip || 0,
                status: "completed"
            }

            // Update the sale using axios
            const saleUpdateConfig = {
                headers: {
                    "access-token": store.token,
                },
            }
            await axios.put(`/sales/${selectedSale._id}`, updatedSale, saleUpdateConfig)

            // Update the client's balance
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
            console.error("Error al actualizar finalizar el pedido:", error)
            setShowEditSaleErrorToast(true)
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

                    <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleFinishOrderFormSubmit)}>
                        <Form.Group className="formFields m-2 col-10" controlId="formBasicWayToPay">
                            <Form.Label className='modalLabel'>Forma de pago:</Form.Label>
                            <Form.Select as="select" name="wayToPay" {...register("wayToPay", { required: true })}>
                                <option value="">Selecciona una categoría</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="mercadoPago">Mercado pago</option>
                                <option value="transferencia">Transferencia</option>
                            </Form.Select>
                            {errors.wayToPay && (
                                <span className="validateSpan">Seleccione una opción.</span>
                            )}
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicPayment">
                            <Form.Label className='modalLabel'>Pagado:</Form.Label>
                            <Form.Control type="number" maxLength={20} name="payment" placeholder="0000"
                                {...register("payment", {
                                    required: true,
                                    pattern: /^\d+(\.\d{1,2})?$/
                                })}
                            />
                            {errors.payment && (
                                <span className="validateSpan">Ingrese un número válido.</span>
                            )}
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicPayment">
                            <Form.Label className='modalLabel'>Propina:</Form.Label>
                            <Form.Control type="number" maxLength={20} name="tip" placeholder="0000"
                                {...register("tip", {
                                    required: false,
                                    pattern: /^\d+(\.\d{1,2})?$/
                                })}
                            />
                            {errors.tip && (
                                <span className="validateSpan">Ingrese un número válido.</span>
                            )}
                        </Form.Group>
                        <Modal.Footer className="mt-3 col-12">
                            <Button className='buttonsFormAddSale m-2 w-100' variant="secondary" type="submit">
                                Guardar Cambios
                            </Button>
                            <Button className='buttonsFormAddSale m-2 w-100' variant="secondary" onClick={handleOnHideModal}>
                                Cancelar
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* TOASTS */}
            <ToastContainer className="p-3" style={{ position: 'fixed', zIndex: 1, bottom: '20px', right: '20px', }} >
                <Toast show={showEditSaleConfirmationToast} onClose={handleEditSaleConfirmationToastClose} className="toastConfirmation" delay={5000} autohide>
                    <Toast.Header className="toastConfirmationHeader">
                        <strong className="me-auto">Operación Exitosa</strong>
                    </Toast.Header>
                    <Toast.Body>El pedido se finalizadó correctamente.</Toast.Body>
                </Toast>
                <Toast show={showEditSaleErrorToast} onClose={handleEditSaleErrorToastClose} className="toastError" delay={5000} autohide>
                    <Toast.Header className="toastErrorHeader">
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Hubo un error al finalizar el pedido. Por favor, inténtalo nuevamente.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    )
}
