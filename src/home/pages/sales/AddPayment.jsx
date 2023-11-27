import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { useForm } from "react-hook-form"
import Form from 'react-bootstrap/Form'
import { TokenStorage } from "../../../utils/TokenStorage"
import { FaTrashAlt } from 'react-icons/fa'

export const AddPayment = ({ show, onHide, fetchSales, selectedSale }) => {
    const [currentDate, setCurrentDate] = useState('')
    const { handleSubmit, register, reset, formState: { errors } } = useForm()
    const [showConfirmationEditPaymentsToast, setShowConfirmationEditPaymentsToast] = useState(false)
    const [showErrorEditPaymentsToast, setShowErrorEditPaymentsToast] = useState(false)
    const store = TokenStorage()
    const [additionalPaymentFields, setAdditionalPaymentFields] = useState([])
    const [nextId, setNextId] = useState(1)
    // const [paymentFieldsData, setPaymentFieldsData] = useState({})

    //MANEJO DE TOASTS
    const handleEditSaleConfirmationToastClose = () => {
        setShowConfirmationEditPaymentsToast(false)
    }
    const handleEditSaleErrorToastClose = () => {
        setShowErrorEditPaymentsToast(false)
    }

    //CERRAR EL MODAL CON CANCELAR O X
    const handleOnHideModal = () => {
        reset()
        setAdditionalPaymentFields([])
        setNextId(1)
        // setPaymentFieldsData({})
        onHide()
    }

    useEffect(() => {
        if (show && selectedSale) {
            const newPaymentFields = selectedSale.payments.map((pay, index) => ({
                id: index,
            }))
            setAdditionalPaymentFields(newPaymentFields);
            reset()
            const defaultPaymentsValues = {};
            newPaymentFields.forEach((paymentField, index) => {
                const selectedPay = selectedSale.payments[index];
                defaultPaymentsValues[`paymentDate${paymentField.id}`] = selectedPay.paymentDate.substring(0, 10) || '';
                defaultPaymentsValues[`wayToPay${paymentField.id}`] = selectedPay.wayToPay || '';
                defaultPaymentsValues[`payment${paymentField.id}`] = selectedPay.payment || '';
                defaultPaymentsValues[`tip${paymentField.id}`] = selectedPay.tip || '';
            });
            reset({ ...defaultPaymentsValues });
        }
    }, [show, selectedSale, reset]);

    // MANEJO LA FECHA
    const getCurrentDateInArgentina = () => {
        const now = new Date()
        now.setHours(now.getHours() - 3)
        const formattedDate = now.toISOString().split('T')[0]
        setCurrentDate(formattedDate)
    }
    useEffect(() => {
        getCurrentDateInArgentina()
    }, []);


    //FUNCIONES PARA AGREGAR O QUITAR UN ITEM:
    const handleAddPayField = () => {
        const newId = nextId
        setAdditionalPaymentFields([...additionalPaymentFields, { id: newId, type: "unidad" }])
        setNextId(newId + 1)
    }

    const handleRemovePayField = (id) => {
        const updatedFields = additionalPaymentFields.filter((field) => field.id !== id)
        setAdditionalPaymentFields(updatedFields)
    }



    // FUNCION PARA MODIFICAR UN PAGO
    const handleFinishOrderFormSubmit = async (formData) => {
        try {
            // Update the sale
            const paymentsData = additionalPaymentFields.map((field) => {
                return {
                    paymentDate: formData[`paymentDate${field.id}`],
                    wayToPay: formData[`wayToPay${field.id}`],
                    payment: formData[`payment${field.id}`],
                    tip: formData[`tip${field.id}`]
                };
        });

            const clientId = selectedSale.client
            const clientResponse = await axios.get(`/clients/${clientId}`, {
                headers: {
                    "access-token": store.token,
                },
            })

            const clientData = clientResponse.data
            const previousBalance = clientData.balance;
            const totalPreviousPayments = selectedSale.payments.reduce((total, payment) => total + parseFloat(payment.payment), 0);
            const totalPayment = paymentsData.reduce((total, payment) => total + parseFloat(payment.payment), 0) 
            // + totalPreviousPayments;
            const newBalance =  previousBalance + totalPreviousPayments - totalPayment

            // const newPayments = additionalPaymentFields.map((field) => {
            //     const paymentDate = formData[`paymentDate${field.id}`];
            //     const wayToPay = formData[`wayToPay${field.id}`];
            //     const payment = formData[`payment${field.id}`];
            //     const tip = formData[`tip${field.id}`];
            //     return {
            //         paymentDate: paymentDate,
            //         wayToPay,
            //         payment,
            //         tip
            //     };
            // });

            // const updatedPayments = [...selectedSale.payments];


            const updatedSale = {
                user: selectedSale.user,
                date: selectedSale.date,
                client: selectedSale.client,
                products: selectedSale.products,
                payments: paymentsData,
                status: "completed"
            }

            const saleUpdateConfig = {
                headers: {
                    "access-token": store.token,
                },
            }
            console.log(updatedSale)
            await axios.put(`/sales/${selectedSale._id}`, updatedSale, saleUpdateConfig)

            const balanceUpdateConfig = {
                headers: {
                    "access-token": store.token,
                },
            }
            await axios.patch(`/clients/${clientId}/balance`, { balance: newBalance }, balanceUpdateConfig)
            setShowConfirmationEditPaymentsToast(true)
            onHide()
            setNextId(1);
            // setPaymentFieldsData({});
            setAdditionalPaymentFields([]);
            reset()
            fetchSales()
        } catch (error) {
            console.error("Error al actualizar finalizar el pedido:", error)
            setShowErrorEditPaymentsToast(true)
        }
    }

    return (
        <>
            {/* MODAL */}
            <Modal show={show} onHide={handleOnHideModal} size="xl">
                <Modal.Header className='modalHeader' closeButton>
                    <Modal.Title className="modalTitle">
                        <strong>Finalizar Pedido</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody'>
                    <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleFinishOrderFormSubmit)}>
                        <div className='col-12 row my-2'>
                            {additionalPaymentFields.map((field, index) => (
                                <div key={field.id} className='col-12 row my-2 align-items-center justify-content-between'>
                                    <Form.Group className="formFields my-2 px-2 col-10 col-md-2" controlId="formBasicDate">
                                        <Form.Label className='modalLabel'>Fecha:</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name={`paymentDate${field.id}`}
                                            {...register(`paymentDate${field.id}`, { required: true })}
                                            defaultValue={currentDate}
                                        // value={paymentFieldsData[field.id]?.item || ''}
                                        // onChange={(e) => {
                                        //     setCurrentDate(e.target.value)
                                        //     const newValue = e.target.value
                                        //     setPaymentFieldsData((prevData) => ({
                                        //         ...prevData,
                                        //         [field.id]: { ...prevData[field.id], item: newValue },
                                        //     }))
                                        // }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="formFields m-2 col-3" controlId="formBasicWayToPay">
                                        <Form.Label className='modalLabel'>Forma de pago:</Form.Label>
                                        <Form.Select
                                            as="select"
                                            name="wayToPay"
                                            defaultValue=''
                                            {...register(`wayToPay${field.id}`, { required: true })}>
                                            <option value="">Selecciona una categoría</option>
                                            <option value="efectivo">Efectivo</option>
                                            <option value="mercadoPago">Mercado pago</option>
                                            <option value="transferencia">Transferencia</option>
                                        </Form.Select>
                                        {errors.wayToPay && (
                                            <span className="validateSpan">Seleccione una opción.</span>
                                        )}
                                    </Form.Group>
                                    <Form.Group className="formFields m-2 col-10 col-md-2" controlId="formBasicPayment">
                                        <Form.Label className='modalLabel'>Pagado:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            maxLength={20}
                                            name="payment"
                                            placeholder="0000"
                                            defaultValue=''
                                            {...register(`payment${field.id}`, {
                                                required: true,
                                                pattern: /^\d+(\.\d{1,2})?$/
                                            })}
                                        />
                                        {errors.payment && (
                                            <span className="validateSpan">Ingrese un número válido.</span>
                                        )}
                                    </Form.Group>
                                    <Form.Group className="formFields m-2 col-10 col-md-2" controlId="formBasicPayment">
                                        <Form.Label className='modalLabel'>Propina:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            maxLength={20}
                                            name="tip"
                                            placeholder="0000"
                                            defaultValue=''
                                            {...register(`tip${field.id}`, {
                                                required: false,
                                                pattern: /^\d+(\.\d{1,2})?$/
                                            })}
                                        />
                                        {errors.tip && (
                                            <span className="validateSpan">Ingrese un número válido.</span>
                                        )}
                                    </Form.Group>
                                    <Button className='buttonsFormAddSale my-2 mt-4 col-1' variant="danger" type="button" onClick={() => handleRemovePayField(field.id)} style={{ width: '40px', height: '40px' }}>
                                        <FaTrashAlt />
                                    </Button>
                                </div>
                            ))}
                            <Button className='buttonsFormAddSale w-25' variant="secondary" type="button" onClick={handleAddPayField}>
                                Agregar
                            </Button>
                        </div>

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
            < ToastContainer className="p-3" style={{ position: 'fixed', zIndex: 1, bottom: '20px', right: '20px', }} >
                <Toast show={showConfirmationEditPaymentsToast} onClose={handleEditSaleConfirmationToastClose} className="toastConfirmation" delay={5000} autohide>
                    <Toast.Header className="toastConfirmationHeader">
                        <strong className="me-auto">Operación Exitosa</strong>
                    </Toast.Header>
                    <Toast.Body>Los pagos se actualizaron correctamente.</Toast.Body>
                </Toast>
                <Toast show={showErrorEditPaymentsToast} onClose={handleEditSaleErrorToastClose} className="toastError" delay={5000} autohide>
                    <Toast.Header className="toastErrorHeader">
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Hubo un error al actualizar los pagos. Por favor, inténtalo nuevamente.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    )
}
