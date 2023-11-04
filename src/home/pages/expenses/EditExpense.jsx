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

export const EditExpense = ({ show, onHide, fetchExpenses, selectedExpense }) => {
    console.log(selectedExpense)
    const [showEditExpenseConfirmationToast, setShowEditExpenseConfirmationToast] = useState(false)
    const [showEditExpenseErrorToast, setShowEditExpenseErrorToast] = useState(false)
    const { handleSubmit, register, reset, formState: { errors } } = useForm()
    const store = TokenStorage()
    const [subtotals, setSubtotals] = useState([0]);
    const [total, setTotal] = useState(0)
    const [currentDate, setCurrentDate] = useState('')
    const [additionalItemFields, setAdditionalItemFields] = useState([])
    const [nextId, setNextId] = useState(1)
    const [itemFieldsData, setItemFieldsData] = useState({})



    useEffect(() => {
        if (selectedExpense) {
            // Resto del código que configura el formulario

            // Calcular el total al inicio
            const initialTotal = selectedExpense.items.reduce((acc, item) => {
                return acc + item.unitPrice;
            }, 0);

            setTotal(initialTotal);
        }
    }, [selectedExpense]);

    useEffect(() => {
        if (selectedExpense) {
            const newFields = selectedExpense?.items?.map((item, index) => ({
                id: index,
                amount: item.amount,
                description: item.description,
                additionalDescription: item.additionalDescription,
                unitPrice: item.unitPrice,
            }));
    
            setAdditionalItemFields(newFields);
    
            const updatedItemFieldsData = {};
            selectedExpense?.items?.forEach((item, index) => {
                updatedItemFieldsData[index] = {
                    item: item.description,
                    amount: item.amount,
                    additionalDescription: item.additionalDescription,
                    unitPrice: item.unitPrice,
                };
            });
            setItemFieldsData(updatedItemFieldsData);
    
            reset({
                date: selectedExpense.date ? new Date(selectedExpense.date).toISOString().split('T')[0] : '',
                voucherNumber: selectedExpense.voucherNumber,
                provider: selectedExpense.provider,
                wayToPay: selectedExpense.wayToPay,
                payment: selectedExpense.payment
            });
        }
    }, [selectedExpense, reset]);

    useEffect(() => {
        const calculatedTotal = subtotals.reduce((accumulator, currentSubtotal) => {
            return accumulator + currentSubtotal
        }, 0)
        setTotal(calculatedTotal)
    }, [subtotals])

    const handleEditExpenseConfirmationToastClose = () => {
        setShowEditExpenseConfirmationToast(false)
    }
    const handleEditExpenseErrorToastClose = () => {
        setShowEditExpenseErrorToast(false)
    }
    const handleOnHideModal = () => {
        reset()
        setAdditionalItemFields([])
        setNextId(1)
        setItemFieldsData({})
        onHide()
        setSubtotals([0])
        setTotal(0)
    }




    // FUNCION PARA MODIFICAR UN GASTO
    // const handleEditExpenseFormSubmit = async (formData) => {
    //     try {
    //         const updatedExpense = {
    //             date: selectedExpense.date,
    //             voucherNumber: formData.voucherNumber,
    //             provider: formData.provider,
    //             amount: formData.amount,
    //             description: formData.description,
    //             additionalDescription: formData.additionalDescription,
    //             unitPrice: formData.unitPrice,
    //             wayToPay: formData.wayToPay,
    //             payment: formData.payment,
    //         }
    //         const config = {
    //             headers: {
    //                 "access-token": store.token,
    //             },
    //         }
    //         await axios.put(`/expenses/${selectedExpense._id}`, updatedExpense, config)
    //         onHide()
    //         setShowEditExpenseConfirmationToast(true)
    //         reset()
    //         fetchExpenses()
    //     } catch (error) {
    //         console.error("Error al actualizar el gasto:", error)
    //         setShowEditExpenseErrorToast(true)
    //     }
    // }
    const handleEditExpenseFormSubmit = async (data) => {
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
            const expenseToEdit = {
                date: data.date,
                voucherNumber: data.voucherNumber,
                provider: data.provider,
                items: items,
                wayToPay: data.wayToPay,
                payment: data.payment
            };
            const response = await axios.put(`/expenses/${selectedExpense._id}`, expenseToEdit, {
                headers: {
                    "access-token": store.token
                }
            });
            if (response.status === 200) {
                setShowEditExpenseConfirmationToast(true)
                reset();
                setNextId(1);
                setItemFieldsData({});
                onHide();
                setAdditionalItemFields([]);
                fetchExpenses();
                setSubtotals([0])
                setTotal(0)
            } else {
                setShowEditExpenseErrorToast(true)
            }
        } catch (error) {
            console.error(error);
            onHide();
            setShowEditExpenseErrorToast(true)
        }
    }


    const handleAddItemField = () => {
        const newId = nextId
        setAdditionalItemFields([...additionalItemFields, { id: newId, type: "unidad" }])

        // Crea un objeto vacío para los valores del nuevo campo
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


    
    // MANEJO LA FECHA
    const getCurrentDateInArgentina = () => {
        const now = new Date()
        // Ajusta la fecha al huso horario de Argentina (GMT-3)
        now.setHours(now.getHours() - 3)
        // Formatea la fecha como "YYYY-MM-DD" para el input date
        const formattedDate = now.toISOString().split('T')[0]
        setCurrentDate(formattedDate)
    }
        // Effect to get current date
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
                    <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleEditExpenseFormSubmit)}>
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
                                        pattern: /^[A-Za-zÁáÉéÍíÓóÚú\s]+$/
                                    })}
                                />
                                {errors.provider && errors.provider.type === "required" && (
                                    <span className="validateSpan">Este campo es requerido.</span>
                                )}
                                {errors.provider && errors.provider.type === "pattern" && (
                                    <span className="validateSpan">Nombre inválido. Solo se permiten letras y espacios.</span>
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
                                            value={itemFieldsData[field.id]?.amount || ''}
                                            onChange={(e) => {
                                                const newValue = e.target.value
                                                setItemFieldsData((prevData) => ({
                                                    ...prevData,
                                                    [field.id]: { ...prevData[field.id], amount: newValue },
                                                }))
                                            }}
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
                                            value={itemFieldsData[field.id]?.additionalDescription || ''}
                                            onChange={(e) => {
                                                const newValue = e.target.value
                                                setItemFieldsData((prevData) => ({
                                                    ...prevData,
                                                    [field.id]: { ...prevData[field.id], additionalDescription: newValue },
                                                }))
                                            }}
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
                                            value={itemFieldsData[field.id]?.unitPrice || ''}
                                            onChange={(e) => {
                                                const newValue = e.target.value
                                                setItemFieldsData((prevData) => ({
                                                    ...prevData,
                                                    [field.id]: { ...prevData[field.id], unitPrice: newValue },
                                                }))
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
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicPayment">
                            <Form.Label className='modalLabel'>Pago:</Form.Label>
                            <Form.Control
                                type="number"
                                maxLength={10}
                                name="payment"
                                placeholder="Ingrese la cantidad"
                                {...register("payment", {
                                    required: false,
                                    pattern: /^\d+(\.\d{1,2})?$/
                                })}
                            />
                            {errors.payment && (
                                <span className="validateSpan">Ingrese un número válido.</span>
                            )}
                        </Form.Group>
                        <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicWayToPay">
                            <Form.Label className='modalLabel'>Forma de pago:</Form.Label>
                            <Form.Select as="select" name="wayToPay" {...register("wayToPay", { required: true })}>
                                <option value="">Seleccione una opción</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">MercadoPago</option>
                                <option value="transferencia">Transferencia</option>
                            </Form.Select>
                            {errors.wayToPay && (
                                <span className="validateSpan">Seleccione una opción.</span>
                            )}
                        </Form.Group>
                        <Modal.Footer className="mt-3 col-12">
                            <Button className='buttonsFormAddSale m-2 w-100' variant="secondary" type="submit">
                                Modificar Gasto
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
