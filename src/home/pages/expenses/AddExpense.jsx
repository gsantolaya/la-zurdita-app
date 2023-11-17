//IMPORTACIONES
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import Form from 'react-bootstrap/Form'
import { TokenStorage } from "../../../utils/TokenStorage"
import { useForm } from "react-hook-form"
import { FaTrashAlt } from 'react-icons/fa'

export const AddExpense = ({ show, onHide, fetchExpenses }) => {
    const [currentDate, setCurrentDate] = useState('')
    const [defaultPaymentDate, setDefaultPaymentDate] = useState(currentDate);
    const { handleSubmit, register, reset, formState: { errors } } = useForm()
    const [showConfirmationAddExpenseToast, setShowConfirmationAddExpenseToast] = useState(false)
    const [showErrorAddExpenseToast, setShowErrorAddExpenseToast] = useState(false)
    const store = TokenStorage()

    const [additionalItemFields, setAdditionalItemFields] = useState([1])
    const [itemFieldsData, setItemFieldsData] = useState({})
    const [nextId, setNextId] = useState(1)

    const [additionalPayFields, setAdditionalPayFields] = useState([1])
    const [nextIdPay, setNextIdPay] = useState(1)

    const [subtotals, setSubtotals] = useState([0])
    const [total, setTotal] = useState(0)

    const handleConfirmationAddExpenseToastClose = () => {
        setShowConfirmationAddExpenseToast(false)
    }
    const handleErrorAddExpenseToastClose = () => {
        setShowErrorAddExpenseToast(false)
    }
    const handleOnHideModal = () => {
        onHide()
        reset()
        setAdditionalItemFields([1])
        setAdditionalPayFields([1])
        setItemFieldsData({})
        setNextId(1)
        setSubtotals([0])
        setTotal(0)
    }

    useEffect(() => {
        const calculatedTotal = subtotals.reduce((accumulator, currentSubtotal) => {
            return accumulator + currentSubtotal
        }, 0)
        setTotal(calculatedTotal)
    }, [subtotals])

    const handleAddItemField = () => {
        const newId = nextId
        setAdditionalItemFields([...additionalItemFields, { id: newId, type: "unidad" }])
        setItemFieldsData(prevData => ({
            ...prevData,
            [newId]: {},
        }))
        setNextId(newId + 1)
    }

    const handleRemoveItemField = (id) => {
        const updatedFields = additionalItemFields.filter((field) => field.id !== id)
        setAdditionalItemFields(updatedFields)
        setItemFieldsData((prevData) => {
            const updatedData = { ...prevData }
            delete updatedData[id]
            return updatedData
        })

        setSubtotals((prevSubtotals) => {
            const updatedSubtotals = [...prevSubtotals]
            updatedSubtotals[id] = 0
            return updatedSubtotals
        })
    }

    const handleAddPayField = () => {
        const newId = nextIdPay
        setAdditionalPayFields([...additionalPayFields, { id: newId, type: "unidad" }]);
        setNextIdPay(newId + 1)
    }

    const handleRemovePayField = (id) => {
        const updatedFields = additionalPayFields.filter((field) => field.id !== id);
        setAdditionalPayFields(updatedFields)
    }

    // GUARDAR GASTO EN LA BASE DE DATOS
    const handleAddExpenseFormSubmit = async (data) => {
        if (additionalItemFields.length === 0) {
            alert("Debes agregar al menos un item.");
            return;
        }
        try {
            const items = additionalItemFields.map((field) => {
                return {
                    amount: data[`amount${field.id}`],
                    description: data[`description${field.id}`],
                    additionalDescription: data[`additionalDescription${field.id}`],
                    unitPrice: data[`unitPrice${field.id}`],
                };
            });
            const paymentsData = additionalPayFields.map((field) => {
                return {
                    date: data[`paymentDate${field.id}`],
                    wayToPay: data[`wayToPay${field.id}`],
                    payment: data[`payment${field.id}`],
                };
            });
            const expenseToCreate = {
                date: data.date,
                voucherNumber: data.voucherNumber,
                provider: data.provider,
                items: items,
                payments: paymentsData
            };
            console.log(expenseToCreate)
            const response = await axios.post('/expenses/', expenseToCreate, {
                headers: {
                    "access-token": store.token
                }
            });
            if (response.status === 201) {
                onHide()
                reset()
                setShowConfirmationAddExpenseToast(true);
                setNextId(1)
                setItemFieldsData({})
                setAdditionalItemFields([1])
                setAdditionalPayFields([1])
                fetchExpenses()
                setSubtotals([0])
                setTotal(0)
            } else {
                setShowErrorAddExpenseToast(true);
            }
        } catch (error) {
            console.error(error);
            onHide();
            setShowErrorAddExpenseToast(true);
        }
    }


    // MANEJO LA FECHA
    const getCurrentDateInArgentina = () => {
        const now = new Date()
        now.setHours(now.getHours() - 3)
        const formattedDate = now.toISOString().split('T')[0]
        setCurrentDate(formattedDate)
        setDefaultPaymentDate(formattedDate)
    }
    useEffect(() => {
        getCurrentDateInArgentina()
    }, [])



    return (
        <>
            {/* MODAL */}
            <Modal show={show} onHide={handleOnHideModal} size="xl">
                <Modal.Header closeButton className='modalHeader'>
                    <Modal.Title className="modalTitle">
                        <strong>Nuevo Gasto</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody'>
                    <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleAddExpenseFormSubmit)}>
                        <div className='col-12 row my-2'>
                            <h5 className='modalLabel'>Información General:</h5>
                            <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicDate">
                                <Form.Label className='modalLabel'>Fecha:</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date"
                                    onChange={(e) => setCurrentDate(e.target.value)}
                                    {...register("date", { required: true })}
                                    max={currentDate}
                                    defaultValue={currentDate}
                                />
                            </Form.Group>
                            <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicVoucherNumber">
                                <Form.Label className='modalLabel'>Nro. de comprobante:</Form.Label>
                                <Form.Control type="number" name="voucherNumber" placeholder="Ingrese el número"
                                    {...register("voucherNumber", {
                                        required: true,
                                        pattern: /^\d+(\.\d{1,2})?$/
                                    })}
                                />
                                {errors.voucherNumber && (
                                    <span className="validateSpan">Ingrese un número válido.</span>
                                )}
                            </Form.Group>
                            <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicProvider">
                                <Form.Label className='modalLabel'>Proveedor:</Form.Label>
                                <Form.Control type="text" name="provider" placeholder="Ingrese el proveedor"
                                    {...register("provider", {
                                        required: true,
                                    })}
                                />
                                {errors.provider && errors.provider.type === "required" && (
                                    <span className="validateSpan">Este campo es requerido.</span>
                                )}
                            </Form.Group>
                        </div>
                        <div className='col-12 row my-2'>
                            <h5 className='modalLabel'>Items:</h5>
                            {additionalItemFields.map((field, index) => (
                                <div key={field.id} className='col-12 row my-2 align-items-center justify-content-between'>
                                    <Form.Group className="formFields my-2 px-2 col-12 col-md-3" controlId="formBasicDescription">
                                        <Form.Label className='modalLabel'>Descripción:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name={`description${field.id}`}
                                            placeholder="Ingrese la descripción"
                                            {...register(`description${field.id}`, { required: true })}
                                            value={itemFieldsData[field.id]?.item || ''}
                                            onChange={(e) => {
                                                const newValue = e.target.value
                                                setItemFieldsData((prevData) => ({
                                                    ...prevData,
                                                    [field.id]: { ...prevData[field.id], item: newValue },
                                                }))
                                            }}
                                        />
                                        {errors.description && errors.provider.type === "required" && (
                                            <span className="validateSpan">Este campo es requerido.</span>
                                        )}
                                    </Form.Group>
                                    <Form.Group className="formFields my-2 px-2 col-10 col-md-2" controlId="formBasicAmount">
                                        <Form.Label className='modalLabel'>Cantidad:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name={`amount${field.id}`}
                                            placeholder="00"
                                            {...register(`amount${field.id}`, {
                                                required: true,
                                                pattern: /^\d+(\.\d{1,2})?$|^\d+\.\d$/
                                            })}
                                        />
                                        {errors.amount && (
                                            <span className="validateSpan">Ingrese un número válido.</span>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="formFields my-2 px-2 col-12 col-md-3" controlId="formBasicAdditionalDescription">
                                        <Form.Label className='modalLabel'>Cantidad por:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name={`additionalDescription${field.id}`}
                                            placeholder="Ingrese la descripción adicional"
                                            {...register(`additionalDescription${field.id}`, { required: true })}
                                        />
                                        {errors.additionalDescription && errors.provider.type === "required" && (
                                            <span className="validateSpan">Este campo es requerido.</span>
                                        )}
                                    </Form.Group>
                                    <Form.Group className="formFields my-2 px-2 col-12 col-md-3" controlId="formBasicUnitPrice">
                                        <Form.Label className='modalLabel'>Precio:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name={`unitPrice${field.id}`}
                                            placeholder="Ingrese el precio"
                                            {...register(`unitPrice${field.id}`, {
                                                required: false,
                                                pattern: /^\d+(\.\d{1,2})?$|^\d+\.\d$/
                                            })}
                                            onChange={(e) => {
                                                const unitPrice = parseFloat(e.target.value)
                                                const subtotal = unitPrice
                                                const updatedSubtotals = [...subtotals]
                                                updatedSubtotals[field.id] = subtotal
                                                setSubtotals(updatedSubtotals)
                                            }}
                                        />
                                        {errors.unitPrice && (
                                            <span className="validateSpan">Ingrese un número válido.</span>
                                        )}
                                    </Form.Group>
                                    <Button className='buttonsFormAddSale my-2 mt-4 col-1' variant="danger" type="button" onClick={() => handleRemoveItemField(field.id)} style={{ width: '40px', height: '40px' }}>
                                        <FaTrashAlt />
                                    </Button>
                                </div>
                            ))}
                            <Button className='buttonsFormAddSale w-25' variant="secondary" type="button" onClick={handleAddItemField}>
                                Agregar
                            </Button>
                        </div>
                        <h2 className='modalLabel col-12 m-3 text-center'>Total: ${total}</h2>
                        <div className='col-12 row my-2'>
                            <h5 className='modalLabel'>Pagos:</h5>
                            {additionalPayFields.map((field, index) => (
                                <div key={field.id} className='col-12 row my-2 align-items-center justify-content-between'>
                                    <Form.Group className="formFields my-2 px-2 col-10 col-md-2" controlId="formBasicDate">
                                        <Form.Label className='modalLabel'>Fecha:</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name={`paymentDate${field.id}`}
                                            {...register(`paymentDate${field.id}`, { required: true })}
                                            defaultValue={defaultPaymentDate}
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                setDefaultPaymentDate(newValue);
                                                // setPayFieldsData((prevData) => ({
                                                //     ...prevData,
                                                //     [field.id]: { ...prevData[field.id], item: newValue },
                                                // }));
                                            }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="formFields m-2 col-3" controlId="formBasicWayToPay">
                                        <Form.Label className='modalLabel'>Forma de pago:</Form.Label>
                                        <Form.Select
                                            as="select"
                                            name={`wayToPay${field.id}`}

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
                                Agregar Gasto
                            </Button>
                            <Button className='buttonsFormAddSale m-2 w-100' variant="secondary" onClick={handleOnHideModal}>
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
