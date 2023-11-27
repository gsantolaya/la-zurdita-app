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

export const FinishOrder = ({ show, onHide, fetchSales, selectedSale }) => {

    const [currentDate, setCurrentDate] = useState('')
    const { handleSubmit, register, reset, formState: { errors } } = useForm()
    const [showEditSaleConfirmationToast, setShowEditSaleConfirmationToast] = useState(false)
    const [showEditSaleErrorToast, setShowEditSaleErrorToast] = useState(false)
    const store = TokenStorage()
    const [additionalPayFields, setAdditionalPayFields] = useState([])
    const [payFieldsData, setPayFieldsData] = useState({})

    const [nextId, setNextId] = useState(1)

    const handleEditSaleConfirmationToastClose = () => {
        setShowEditSaleConfirmationToast(false)
    }
    const handleEditSaleErrorToastClose = () => {
        setShowEditSaleErrorToast(false)
    }
    const handleOnHideModal = () => {
        reset()
        setAdditionalPayFields([])
        setNextId(1)
        setPayFieldsData({})
        onHide()
    }

    const handleAddPayField = () => {
        const newId = nextId
        setAdditionalPayFields([...additionalPayFields, { id: newId, type: "unidad" }]);

        // Crea un objeto vacío para los valores del nuevo campo
        setPayFieldsData(prevData => ({
            ...prevData,
            [newId]: {},
        }))
        setNextId(newId + 1)
    }

    const handleRemovePayField = (id) => {
        const updatedFields = additionalPayFields.filter((field) => field.id !== id);
        setAdditionalPayFields(updatedFields)

        // Eliminar los valores correspondientes al campo eliminado en el objeto de datos de producto
        setPayFieldsData((prevData) => {
            const updatedData = { ...prevData }
            delete updatedData[id]
            return updatedData
        })
    }

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

    // FUNCION PARA FINALIZAR UN PEDIDO
    const handleFinishOrderFormSubmit = async (formData) => {
        try {
            // Update the sale
            const paymentsData = additionalPayFields.map((field) => {
                return {
                    paymentDate: formData[`paymentDate${field.id}`],
                    wayToPay: formData[`wayToPay${field.id}`],
                    payment: formData[`payment${field.id}`],
                    tip: formData[`tip${field.id}`],
                };
            });

            const clientId = selectedSale.client

            // Fetch the client's data to get the previous balance
            const clientResponse = await axios.get(`/clients/${clientId}`, {
                headers: {
                    "access-token": store.token,
                },
            })

            const clientData = clientResponse.data

            const previousBalance = clientData.balance;

            // Calculate the new balance
            const totalProductos = selectedSale.products.reduce((total, product) => {
                const unitPrice = product.unitPrice;
                const amount = product.amount;
                const totalProducto = unitPrice * amount;
                return total + totalProducto;
            }, 0);

            const totalPayment = paymentsData.reduce((total, payment) => total + parseFloat(payment.payment), 0);

            const newBalance = previousBalance + (totalProductos - totalPayment);

            const updatedSale = {
                user: selectedSale.user,
                date: selectedSale.date,
                client: selectedSale.client,
                products: selectedSale.products,
                payments: paymentsData,
                status: "completed"
            }

            // Update the sale using axios
            const saleUpdateConfig = {
                headers: {
                    "access-token": store.token,
                },
            }
            console.log(updatedSale)
            await axios.put(`/sales/${selectedSale._id}`, updatedSale, saleUpdateConfig)

            // Update the client's balance
            const balanceUpdateConfig = {
                headers: {
                    "access-token": store.token,
                },
            }
            await axios.patch(`/clients/${clientId}/balance`, { balance: newBalance }, balanceUpdateConfig)

            setShowEditSaleConfirmationToast(true)
            onHide()
            setNextId(1);
            setPayFieldsData({});
            setAdditionalPayFields([]);
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
            <Modal show={show} onHide={handleOnHideModal} size="xl">
                <Modal.Header className='modalHeader' closeButton>
                    <Modal.Title className="modalTitle">
                        <strong>Finalizar Pedido</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody'>
                    <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleFinishOrderFormSubmit)}>
                        <div className='col-12 row my-2'>
                            {additionalPayFields.map((field, index) => (
                                <div key={field.id} className='col-12 row my-2 align-items-center justify-content-between'>
                                    <Form.Group className="formFields my-2 px-2 col-10 col-md-2" controlId="formBasicDate">
                                        <Form.Label className='modalLabel'>Fecha:</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name={`paymentDate${field.id}`}
                                            {...register(`paymentDate${field.id}`, { required: true })}
                                            defaultValue={currentDate}
                                            value={payFieldsData[field.id]?.item || ''}
                                            onChange={(e) => {
                                                setCurrentDate(e.target.value)
                                                const newValue = e.target.value
                                                setPayFieldsData((prevData) => ({
                                                    ...prevData,
                                                    [field.id]: { ...prevData[field.id], item: newValue },
                                                }))
                                            }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="formFields m-2 col-3" controlId="formBasicWayToPay">
                                        <Form.Label className='modalLabel'>Forma de pago:</Form.Label>
                                        <Form.Select as="select" name={`wayToPay${field.id}`} {...register(`wayToPay${field.id}`, { required: true })}>
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
                                        <Form.Control type="number" maxLength={20} name={`payment${field.id}`} placeholder="0000"
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
                                        <Form.Control type="number" maxLength={20} name={`tip${field.id}`} placeholder="0000"
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
