//IMPORTACIONES
import React, { useEffect, useState } from 'react'
import { FaEdit, FaTrashAlt } from "react-icons/fa"
import Table from 'react-bootstrap/Table'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import { TokenStorage } from "../../../utils/TokenStorage"
import { tokenIsValid } from '../../../utils/TokenIsValid'
import { useNavigate } from "react-router-dom"

import InputGroup from "react-bootstrap/InputGroup"
import { BsPrinterFill } from "react-icons/bs"
import { AddExpense } from './AddExpense'
import { DeleteExpense } from './DeleteExpense'
import { EditExpense } from './EditExpense'

//COMPONENTE
export const ExpensesScreen = () => {

    //DECLARACION DE CONSTANTES
    const [expenses, setExpenses] = useState([])
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
    const handleCloseAddExpenseModal = () => setShowAddExpenseModal(false)
    const [showDeleteExpenseModal, setShowDeleteExpenseModal] = useState(false)
    const [showEditExpenseModal, setShowEditExpenseModal] = useState(false)
    const [selectedExpense, setSelectedExpense] = useState(null)
    const store = TokenStorage()
    const decodedToken = tokenIsValid()
    const navigate = useNavigate()
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    //Funcion para convertir fecha a la zona horaria local
    function formatDate(dateString) {
        const utcDate = new Date(dateString)
        const year = utcDate.getUTCFullYear()
        const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0')
        const day = utcDate.getUTCDate().toString().padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    function formatTableDate(inputDate) {
        const parts = inputDate.split('-')
        if (parts.length === 3) {
            const [year, month, day] = parts
            return `${day}/${month}/${year}`
        } else {
            return inputDate
        }
    }

    useEffect(() => {
        if (store.tokenValid && decodedToken.isAdmin === true) {
            axios.get('/expenses', {
                headers: {
                    "access-token": store.token
                }
            })
                .then((response) => {
                    setExpenses(response.data)
                })
                .catch((error) => {
                    console.error(error)
                })
        } else {
            navigate("/login")
        }
    }, [navigate, store.token, store.tokenValid, decodedToken.isAdmin])


    //MANEJO PARA ELIMINAR PRODUCTO
    const handleShowDeletExpenseModal = (expense) => {
        setSelectedExpense(expense)
        setShowDeleteExpenseModal(true)
    }
    const handleCloseDeleteExpenseModal = () => {
        setSelectedExpense(null)
        setShowDeleteExpenseModal(false)
    }

    const handleShowEditExpenseModal = (expense) => {
        setSelectedExpense(expense)
        setShowEditExpenseModal(true)
    }

    const handleCloseEditExpenseModal = () => {
        setShowEditExpenseModal(false)
    }

    //FUNCION PARA FILTRAR LAS VENTAS
    const filteredExpenses = expenses.filter((expense) => {
        const expenseDate = expense.date.toLowerCase()

        // Comprueba si la fecha está dentro del rango seleccionado
        const isWithinDateRange = (!startDate || expenseDate >= startDate) && (!endDate || expenseDate <= endDate)

        return isWithinDateRange
    })

    const fetchExpenses = async () => {
        try {
            const response = await axios.get('/expenses', {
                headers: {
                    "access-token": store.token
                }
            })
            setExpenses(response.data)
        } catch (error) {
            console.error(error)
        }
    }



    //CALCULANDO TOTALES:
    // Función para calcular la cantidad de ventas por tipo de pago
    function calculateCountByWayToPay(wayToPay) {
        const count = filteredExpenses.filter(expense => expense.wayToPay === wayToPay).length
        return count === 0 ? 0 : count
    }
    // Función para calcular la suma de los valores de expense.payment por tipo de pago
    function calculateSubtotalByWayToPay(wayToPay) {
        const subtotal = filteredExpenses
            .filter(expense => expense.wayToPay === wayToPay)
            .reduce((total, expense) => total + expense.payment, 0)
        return subtotal === 0 ? 0 : subtotal
    }
    // Función para calcular el total de todos los valores expense.payment
    function calculateTotalExpenses() {
        return filteredExpenses.reduce((total, expense) => total + expense.payment, 0)
    }

    //FILTRAR POR FECHAS 
    useEffect(() => {
        // Obtén la fecha actual
        const currentDate = new Date()

        // Establece startDate como el día 15 del mes anterior
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15)
        const currentDay = currentDate.getDate()

        // Verifica si el día actual es igual o posterior al 15 del mes actual
        if (currentDay >= 15) {
            startDate.setMonth(currentDate.getMonth())
        }

        // Establece endDate como el día 14 del mes en curso o del mes siguiente
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 14)

        // Verifica si el día actual es igual o posterior al 14 del mes actual
        if (currentDay >= 14) {
            endDate.setMonth(currentDate.getMonth() + 1)
        }

        // Formatea las fechas en formato ISO (yyyy-MM-dd) para establecerlas en los campos de entrada
        const formattedStartDate = formatDate(startDate)
        const formattedEndDate = formatDate(endDate)

        setStartDate(formattedStartDate)
        setEndDate(formattedEndDate)
    }, [])

//FUNCION PARA IMPRIMIR LA PRIMERA TABLA
const handlePrintTable = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write('<html><head><title>Gastos Realizados</title></head><body>')
    printWindow.document.write('<h1 style="text-align: center;"><b>Gastos Realizados</b></h1>')
    printWindow.document.write('<table border="1" style="border-collapse: collapse; width: 100%;">')
    printWindow.document.write('<thead style="background-color: #f2f2f2;">')
    printWindow.document.write('<tr>')
    printWindow.document.write('<th style="text-align: center; padding: 8px;">Fecha</th>')
    printWindow.document.write('<th style="text-align: center; padding: 8px;">Nro. de comprobante</th>')
    printWindow.document.write('<th style="text-align: center; padding: 8px;">Proveedor</th>')
    printWindow.document.write('<th style="text-align: center; padding: 8px;">Items</th>')
    printWindow.document.write('<th style="text-align: center; padding: 8px;">Total</th>')
    printWindow.document.write('<th style="text-align: center; padding: 8px;">Pagos</th>')
    printWindow.document.write('<th style="text-align: center; padding: 8px;">Saldo</th>')
    printWindow.document.write('<th style="text-align: center; padding: 8px;">Estado</th>')
    printWindow.document.write('</tr></thead><tbody>')

    filteredExpenses.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((expense) => {
        printWindow.document.write('<tr>')
        printWindow.document.write(`<td style="text-align: center; padding: 8px;">${formatTableDate(formatDate(expense.date))}</td>`)
        printWindow.document.write(`<td style="text-align: center; padding: 8px;">${expense.voucherNumber}</td>`)
        printWindow.document.write(`<td style="text-align: center; padding: 8px;">${expense.provider}</td>`)
        printWindow.document.write('<td style="text-align: center; padding: 8px;">')
        expense.items.forEach((item, index) => {
            printWindow.document.write(`<div style="padding: 2px;">${item.description} x ${item.amount} ${item.additionalDescription} - $${item.unitPrice}</div>`)
            if (index < expense.items.length - 1) {
                printWindow.document.write('<hr>')
            }
        })
        printWindow.document.write('</td>')
        printWindow.document.write(`<td style="text-align: center; padding: 8px;">$${expense.items.reduce((total, item) => total + item.unitPrice, 0)}</td>`)
        printWindow.document.write('<td style="text-align: center; padding: 8px;">')
        expense.payments.forEach((payment, paymentIndex) => {
            printWindow.document.write('<div>')
            printWindow.document.write(`<div style="padding: 2px;"><b>Fecha:</b> ${formatTableDate(formatDate(payment.date))}</div>`)
            printWindow.document.write(`<div style="padding: 2px;"><b>Pago:</b> $${payment.payment}</div>`)
            printWindow.document.write(`<div style="padding: 2px;"><b>Forma de pago:</b> ${payment.wayToPay}</div>`)
            printWindow.document.write('</div>')
            if (paymentIndex < expense.payments.length - 1) {
                printWindow.document.write('<hr>')
            }
        })
        printWindow.document.write('</td>')
        printWindow.document.write(`<td style="text-align: center; padding: 8px;">$${expense.items.reduce((total, item) => total + item.unitPrice, 0) - expense.payments.reduce((acc, payment) => acc + payment.payment, 0)}</td>`)
        printWindow.document.write(`<td style="text-align: center; padding: 8px;" class="${expense.payments.reduce((acc, payment) => acc + payment.payment, 0) > expense.items.reduce((total, item) => total + item.unitPrice, 0) ? 'red-text' : (expense.payments.reduce((acc, payment) => acc + payment.payment, 0) === expense.items.reduce((total, item) => total + item.unitPrice, 0) ? 'green-text' : 'blue-text')}">`)
        printWindow.document.write(`${expense.payments.reduce((acc, payment) => acc + payment.payment, 0) > expense.items.reduce((total, item) => total + item.unitPrice, 0) ? 'Saldo pendiente' : (expense.payments.reduce((acc, payment) => acc + payment.payment, 0) === expense.items.reduce((total, item) => total + item.unitPrice, 0) ? 'Saldado' : 'Saldo a favor')}</td>`)
        printWindow.document.write('</tr>')
    })

    printWindow.document.write('</tbody></table>')
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
}
    



    //FUNCION PARA IMPRIMIR EL ARQUEO
    const handlePrintSummary = () => {
        const printWindow = window.open('', '', 'width=800,height=600')
        printWindow.document.write('<html><head><title>Total Gastos</title></head><body>')
        printWindow.document.write('<h1>Gastos</h1>')
        printWindow.document.write('<table border="1">')
        printWindow.document.write('<thead><tr>')
        printWindow.document.write('<th className="homeText text-center align-middle expenseTitle"></th>')
        printWindow.document.write('<th className="homeText text-center align-middle expenseTitle">Cantidad</th>')
        printWindow.document.write('<th className="homeText text-center align-middle expenseTitle">Subtotal</th>')
        printWindow.document.write('</tr></thead><tbody>')
        const wayToPayData = [
            { wayToPay: 'Efectivo', count: calculateCountByWayToPay("efectivo"), subtotal: calculateSubtotalByWayToPay("efectivo") },
            { wayToPay: 'Mercado Pago', count: calculateCountByWayToPay("mercadoPago"), subtotal: calculateSubtotalByWayToPay("mercadoPago") },
            { wayToPay: 'Transferencias', count: calculateCountByWayToPay("transferencia"), subtotal: calculateSubtotalByWayToPay("transferencia") },
        ]
        wayToPayData.forEach((data) => {
            printWindow.document.write('<tr>')
            printWindow.document.write(`<td>${data.wayToPay}</td>`)
            printWindow.document.write(`<td>${data.count}</td>`)
            printWindow.document.write(`<td>$${data.subtotal}</td>`)
            printWindow.document.write('</tr>')
        })
        printWindow.document.write('<tr>')
        printWindow.document.write('<td colSpan="2"><b>TOTAL</b></td>')
        printWindow.document.write(`<td><b>$${calculateTotalExpenses()}</b></td>`)
        printWindow.document.write('</tr>')
        printWindow.document.write('</tbody></table>')
        printWindow.document.write('</body></html>')
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
    }

    return (
        <>
            <div className='text-center p-5'>
                <h1 className='mb-5 expenseTitle'><b>Gastos Realizados</b></h1>
                <div className='row d-md-flex'>
                    <div className='col-12 col-md-2 my-2 my-md-0'>
                        <InputGroup>
                            <Form.Control
                                type="date"
                                placeholder="Fecha de inicio"
                                value={startDate}
                                onChange={(e) => {
                                    console.log('startDate:', e.target.value)
                                    setStartDate(formatDate(e.target.value))
                                }}
                            />
                        </InputGroup>
                    </div>
                    <div className='col-12 col-md-2 my-2 my-md-0'>
                        <InputGroup>
                            <Form.Control
                                type="date"
                                placeholder="Fecha de finalización"
                                value={endDate}
                                onChange={(e) => {
                                    console.log('endDate:', e.target.value)
                                    setEndDate(formatDate(e.target.value))
                                }} />
                        </InputGroup>
                    </div>
                    <div className='col-12 col-xl-2 my-2 my-md-0 ms-auto'>
                        <Button variant='' className="buttonAddProduct" onClick={() => setShowAddExpenseModal(true)}>Agregar Gasto</Button>
                    </div>
                </div>
                <div className='table-container mt-4 scrollable-x-table scrollable-y-table' >
                    <Table striped bordered hover className=" ">
                        <thead>
                            <tr>
                                <th className='homeText text-center align-middle expenseTitle'>Fecha</th>
                                <th className='homeText text-center align-middle expenseTitle'>Nro. de comprobante</th>
                                <th className='homeText text-center align-middle expenseTitle'>Proveedor</th>
                                <th className='homeText text-center align-middle expenseTitle'>Items</th>
                                <th className='homeText text-center align-middle expenseTitle'>Total</th>
                                <th className='homeText text-center align-middle saleTitle'>Pagos</th>
                                <th className='homeText text-center align-middle expenseTitle'>Saldo</th>
                                <th className='homeText text-center align-middle expenseTitle'>Estado</th>
                                <th>
                                    <Button className='m-1' variant="secondary" onClick={handlePrintTable}>
                                        <span className="d-flex align-items-center justify-content-center">
                                            <BsPrinterFill />
                                        </span>
                                    </Button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).map((expense) => {
                                return (
                                    <tr key={expense._id}>
                                        <td className="text-center align-middle">{formatTableDate(formatDate(expense.date))}</td>
                                        <td className="text-center align-middle">{expense.voucherNumber}</td>
                                        <td className="text-center align-middle">{expense.provider}</td>
                                        <td className="text-center align-middle">
                                            {expense.items.map((item, index) => (
                                                <div key={index} className="item-cell">
                                                    <div className="item-property">
                                                        {item.description} x {item.amount} {item.additionalDescription} - ${item.unitPrice}
                                                    </div>
                                                    {index < expense.items.length - 1 && <hr />}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="text-center align-middle">
                                            ${expense.items.reduce((total, item) => total + item.unitPrice, 0)}
                                        </td>
                                        <td className="text-center align-middle">
                                            {expense.payments.map((payment, paymentIndex) => (
                                                <div key={paymentIndex}>
                                                    <div><b>Fecha:</b> {formatTableDate(formatDate(payment.date))}</div>
                                                    <div><b>Pago:</b> ${payment.payment}</div>
                                                    <div><b>Forma de pago:</b> {payment.wayToPay}</div>
                                                    {paymentIndex < expense.payments.length - 1 && <hr />}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="text-center align-middle">
                                            ${expense.items.reduce((total, item) => total + item.unitPrice, 0) - expense.payments.reduce((acc, payment) => acc + payment.payment, 0)}
                                        </td>
                                        <td className={`text-center align-middle ${expense.payments.reduce((acc, payment) => acc + payment.payment, 0) > expense.items.reduce((total, item) => total + item.unitPrice, 0) ? 'red-text' : (expense.payments.reduce((acc, payment) => acc + payment.payment, 0) === expense.items.reduce((total, item) => total + item.unitPrice, 0) ? 'green-text' : 'blue-text')}`}>
                                            {expense.payments.reduce((acc, payment) => acc + payment.payment, 0) > expense.items.reduce((total, item) => total + item.unitPrice, 0) ? 'Saldo pendiente' : (expense.payments.reduce((acc, payment) => acc + payment.payment, 0) === expense.items.reduce((total, item) => total + item.unitPrice, 0) ? 'Saldado' : 'Saldo a favor')}
                                        </td>
                                        <td className="text-center align-middle">
                                            <Button className='m-1 editButton' onClick={() => handleShowEditExpenseModal(expense)} variant="">
                                                <span className="d-flex align-items-center justify-content-center">
                                                    <FaEdit />
                                                </span>
                                            </Button>
                                            <Button className='m-1' onClick={() => handleShowDeletExpenseModal(expense)} variant="danger">
                                                <span className="d-flex align-items-center justify-content-center">
                                                    <FaTrashAlt />
                                                </span>
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
                <AddExpense show={showAddExpenseModal} onHide={handleCloseAddExpenseModal} fetchExpenses={fetchExpenses} />
                <DeleteExpense show={showDeleteExpenseModal} onHide={handleCloseDeleteExpenseModal} fetchExpenses={fetchExpenses} selectedExpense={selectedExpense} />
                <EditExpense show={showEditExpenseModal} onHide={handleCloseEditExpenseModal} fetchExpenses={fetchExpenses} selectedExpense={selectedExpense} />
                <div className='d-md-flex justify-content-between mt-5'>
                    <h1 className='mx-5 productTitle'><b>Resumen de Gastos:</b></h1>
                    <Button className='m-1' variant="secondary" onClick={handlePrintSummary}>Imprimir Resumen  <BsPrinterFill /></Button>
                </div>
                <div className='table-container mt-4'>
                    <div className='table-container mt-4 scrollable-x-table' >
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th className='homeText text-center align-middle expenseTitle'></th>
                                    <th className='homeText text-center align-middle expenseTitle'>Cantidad</th>
                                    <th className='homeText text-center align-middle expenseTitle'>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Efectivo</td>
                                    <td>{calculateCountByWayToPay("efectivo")}</td>
                                    <td>${calculateSubtotalByWayToPay("efectivo")}</td>
                                </tr>
                                <tr>
                                    <td>Mercado Pago</td>
                                    <td>{calculateCountByWayToPay("mercadoPago")}</td>
                                    <td>${calculateSubtotalByWayToPay("mercadoPago")}</td>
                                </tr>
                                <tr>
                                    <td>Transferencias</td>
                                    <td>{calculateCountByWayToPay("transferencia")}</td>
                                    <td>${calculateSubtotalByWayToPay("transferencia")}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2}><b>TOTAL</b></td>
                                    <td><b>${calculateTotalExpenses()}</b></td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    )
}
