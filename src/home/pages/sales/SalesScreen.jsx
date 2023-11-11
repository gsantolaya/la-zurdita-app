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
import { BsSearch, BsPrinterFill } from "react-icons/bs"
import { AddSale } from './AddSale'
import { DeleteSale } from './DeleteSale'
import { EditSale } from './EditSale'
import "./SalesScreen.css"

//COMPONENTE
export const SalesScreen = () => {

    //DECLARACION DE CONSTANTES
    const [sales, setSales] = useState([])
    const [products, setProducts] = useState([])
    const [clients, setClients] = useState([])
    const [users, setUsers] = useState([])

    const [searchTerm, setSearchTerm] = useState('')
    const [orderOption, setOrderOption] = useState('date ↓')
    const [searchOption, setSearchOption] = useState('client')

    const [showAddSaleModal, setShowAddSaleModal] = useState(false)
    const handleCloseAddSaleModal = () => setShowAddSaleModal(false)

    const [showDeleteSaleModal, setShowDeleteSaleModal] = useState(false)

    const [showEditSaleModal, setShowEditSaleModal] = useState(false)
    const [selectedSale, setSelectedSale] = useState(null)


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
            axios.get('/sales', {
                headers: {
                    "access-token": store.token
                }
            })
                .then((response) => {
                    setSales(response.data)
                })
                .catch((error) => {
                    console.error(error)
                })
            axios.get('/products', {
                headers: {
                    "access-token": store.token
                }
            })
                .then((response) => {
                    setProducts(response.data)
                })
                .catch((error) => {
                    console.error(error)
                })
            axios.get('/clients', {
                headers: {
                    "access-token": store.token
                }
            })
                .then((response) => {
                    setClients(response.data)
                })
                .catch((error) => {
                    console.error(error)
                })
            axios.get('/users', {
                headers: {
                    "access-token": store.token
                }
            })
                .then((response) => {
                    setUsers(response.data)
                })
                .catch((error) => {
                    console.error(error)
                })
        } else {
            navigate("/login")
        }
    }, [navigate, store.token, store.tokenValid, decodedToken.isAdmin])


    //MANEJO PARA ELIMINAR PRODUCTO
    const handleShowDeletSaleModal = (sale) => {
        setSelectedSale(sale)
        setShowDeleteSaleModal(true)
    }
    const handleCloseDeleteSaleModal = () => {
        setSelectedSale(null)
        setShowDeleteSaleModal(false)
    }

    const handleShowEditSaleModal = (sale) => {
        setSelectedSale(sale)
        setShowEditSaleModal(true)
    }

    const handleCloseEditSaleModal = () => {
        setShowEditSaleModal(false)
    }

    //MANEJO PARA BUSQUEDA Y FILTRO
    const handleSearchInputChange = (event) => {
        setSearchTerm(event.target.value)
    }
    const handleSearchOptionChange = (event) => {
        setSearchOption(event.target.value)
    }
    const handleOrderOptionChange = (event) => {
        setOrderOption(event.target.value)
    }

    //FUNCION PARA FILTRAR LAS VENTAS
    const filteredSales = sales.filter((sale) => {
        const saleDate = sale.date.toLowerCase()
        const saleStatus = sale.status === 'completed'

        // Comprueba si la fecha está dentro del rango seleccionado
        const isWithinDateRange = (!startDate || saleDate >= startDate) && (!endDate || saleDate <= endDate)

        const client = clients.find((client) => client._id === sale.client)
        const user = users.find((user) => user._id === sale.user)
        const product = products.find((product) => product._id === sale.product)

        switch (searchOption) {
            case 'client':
                return isWithinDateRange && saleStatus && client && `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
            case 'user':
                return isWithinDateRange && saleStatus && user && `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
            case 'product':
                return isWithinDateRange && saleStatus && product && product.type.toLowerCase().includes(searchTerm.toLowerCase())
            default:
                return isWithinDateRange && saleStatus && client && client.firstName.toLowerCase().includes(searchTerm.toLowerCase())
        }
    })


    //FUNCION PARA ORDENAR LAS VENTAS
    function compareSales(a, b) {
        if (orderOption === 'date ↑') {
            return new Date(a.date) - new Date(b.date)
        } else if (orderOption === 'date ↓') {
            return new Date(b.date) - new Date(a.date)
        }
        return 0
    }

    const fetchSales = async () => {
        try {
            const response = await axios.get('/sales', {
                headers: {
                    "access-token": store.token
                }
            })
            setSales(response.data)
        } catch (error) {
            console.error(error)
        }
    }

    //CALCULANDO TOTALES:
    // Función para calcular la cantidad de ventas por tipo de pago
    // Función para calcular la cantidad de ventas por tipo de pago
    function calculateCountByWayToPay(wayToPay) {
        const count = filteredSales.filter(sale => sale.payments.some(payment => payment.wayToPay === wayToPay)).length;
        return count === 0 ? 0 : count;
    }

    // Función para calcular la suma de los valores de sale.payment por tipo de pago
    function calculateSubtotalByWayToPay(wayToPay) {
        const subtotal = filteredSales
            .filter(sale => sale.payments.some(payment => payment.wayToPay === wayToPay))
            .reduce((total, sale) => {
                const payments = sale.payments.filter(payment => payment.wayToPay === wayToPay);
                return total + payments.reduce((paymentTotal, payment) => paymentTotal + payment.payment, 0);
            }, 0);
        return subtotal === 0 ? 0 : subtotal;
    }

    // Función para calcular el total de todos los valores sale.payment
    function calculateSubtotal() {
        return filteredSales.reduce((total, sale) => {
            return total + sale.payments.reduce((paymentTotal, payment) => paymentTotal + payment.payment, 0);
        }, 0);
    }

    // Función para calcular el total de propinas
    // function calculateTotalTips() {
    //     return filteredSales.reduce((total, sale) => {
    //         return total + sale.payments.reduce((tipTotal, payment) => tipTotal + (payment.tip || 0), 0);
    //     }, 0);
    // }

    // // Función para calcular la cantidad total de propinas
    // function calculateTotalTipCount() {
    //     return filteredSales.reduce((total, sale) => {
    //         return total + (sale.payments.some(payment => payment.tip !== undefined) ? 1 : 0);
    //     }, 0);
    // }

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

    //FUNCION PARA IMPRIMIR LA TABLA
    const handlePrintTable = () => {
        const printWindow = window.open('', '', 'width=800,height=600')
    
        // Crear el contenido de la tabla que deseas imprimir
        const tableContent = `
            <table border="1" style="width: 100%; text-align: center;">
                <thead>
                    <tr>
                        <th class="homeText saleTitle">Fecha</th>
                        <th class="homeText saleTitle">Vendedor</th>
                        <th class="homeText saleTitle">Cliente</th>
                        <th class="homeText saleTitle">Detalle de la venta</th>
                        <th class="homeText saleTitle">Total</th>
                        <th class="homeText saleTitle">Pagos</th>
                        <th class="homeText saleTitle">Saldo</th>
                        <th class="homeText saleTitle">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredSales.slice().sort(compareSales).map((sale) => {
                        const client = clients.find((client) => client._id === sale.client);
                        const user = users.find((user) => user._id === sale.user);
                        let total = 0;
                        return `
                            <tr>
                                <td class="homeText">${formatTableDate(formatDate(sale.date))}</td>
                                <td class="homeText">${user ? `${user.lastName}, ${user.firstName}` : ''}</td>
                                <td class="homeText">${client ? `${client.lastName}, ${client.firstName}` : ''}</td>
                                <td class="homeText" style="text-align: left;">
                                    ${sale.products.map((product, index) => {
                                        const productItem = products.find((p) => p._id === product.product);
                                        let subtotal = product.unitPrice * product.amount;
                                        total += subtotal;
    
                                        return `
                                            <div>
                                                <div><b>Variedad:</b> ${productItem ? productItem.type : ''} <b>Estado:</b> ${product.productStatus}</div>
                                                <div><b>Cantidad:</b> ${product.amount} x ${product.amountDescription}</div>
                                                <div><b>Precio:</b> $${product.unitPrice} <b>Subtotal:</b> $${subtotal}</div>
                                                ${index < sale.products.length - 1 ? '<hr />' : ''}
                                            </div>
                                        `;
                                    }).join('')}
                                </td>
                                <td class="homeText"><b>$${total}</b></td>
                                <td class="homeText">${sale.payments.map((payment, paymentIndex) => (
                                    `<div key=${paymentIndex}>
                                        <div><b>Fecha:</b> ${formatTableDate(formatDate(payment.date))}</div>
                                        <div><b>Pago:</b> $${payment.payment}</div>
                                        <div><b>Forma de pago:</b> ${payment.wayToPay}</div>
                                        <div><b>Propina:</b> $${payment.tip || 0}</div>
                                        ${paymentIndex < sale.payments.length - 1 ? '<hr />' : ''}
                                    </div>`
                                )).join('')}</td>
                                <td class="homeText">$${total - sale.payments.reduce((acc, payment) => acc + payment.payment, 0)}</td>
                                <td class="homeText ${total - sale.payment > 0 ? 'red-text' : (total - sale.payment === 0 ? 'green-text' : 'blue-text')}">
                                    ${total - sale.payment > 0 ? 'Saldo pendiente' : (total - sale.payment === 0 ? 'Saldado' : 'Saldo a favor')}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    
        // Agregar el contenido de la tabla al documento de la ventana emergente
        printWindow.document.write(tableContent);
    
        // Cerrar la estructura HTML y mostrar la ventana emergente para imprimir
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    }
    

    //FUNCION PARA IMPRIMIR EL RESUMEN
    const handlePrintSummary = () => {
        const printWindow = window.open('', '', 'width=800,height=600')
        printWindow.document.write('<html><head><title>Resumen de Ventas</title></head><body>')
        printWindow.document.write('<h1>Resumen de Ventas</h1>')

        // Print the first table
        printWindow.document.write('<h2>Resumen de Formas de Pago</h2>')
        printWindow.document.write('<table border="1">')
        printWindow.document.write('<thead><tr>')
        printWindow.document.write('<th></th>')
        printWindow.document.write('<th>Cantidad</th>')
        printWindow.document.write('<th>Subtotal</th>')
        printWindow.document.write('</tr></thead><tbody>')
        printWindow.document.write('<tr>')
        printWindow.document.write('<td>Efectivo</td>')
        printWindow.document.write(`<td>${calculateCountByWayToPay("efectivo")}</td>`)
        printWindow.document.write(`<td>$${calculateSubtotalByWayToPay("efectivo")}</td>`)
        printWindow.document.write('</tr>')
        printWindow.document.write('<tr>')
        printWindow.document.write('<td>Mercado Pago</td>')
        printWindow.document.write(`<td>${calculateCountByWayToPay("mercadoPago")}</td>`)
        printWindow.document.write(`<td>$${calculateSubtotalByWayToPay("mercadoPago")}</td>`)
        printWindow.document.write('</tr>')
        printWindow.document.write('<tr>')
        printWindow.document.write('<td>Transferencias</td>')
        printWindow.document.write(`<td>${calculateCountByWayToPay("transferencia")}</td>`)
        printWindow.document.write(`<td>$${calculateSubtotalByWayToPay("transferencia")}</td>`)
        printWindow.document.write('</tr>')
        printWindow.document.write('<tr>')
        printWindow.document.write('<td colSpan="2"><b>SUBTOTAL</b></td>')
        printWindow.document.write(`<td><b>$${calculateSubtotal()}</b></td>`)
        printWindow.document.write('</tr>')
        printWindow.document.write('<tr>')
        printWindow.document.write('<td>Propinas</td>')
        printWindow.document.write(`<td>${filteredSales.filter(sale => sale.tip !== null && sale.tip !== 0).length || 0}</td>`)
        printWindow.document.write(`<td>$${calculateTotalTips()}</td>`)
        printWindow.document.write('</tr>')
        printWindow.document.write('<tr>')
        printWindow.document.write('<td colSpan="2"><b>TOTAL</b></td>')
        printWindow.document.write(`<td><b>$${calculateSubtotal() + calculateTotalTips()}</b></td>`)
        printWindow.document.write('</tr>')
        printWindow.document.write('</tbody></table>')

        // Print the second table
        printWindow.document.write('<h2>Resumen de Ventas por Estado</h2>')
        printWindow.document.write('<table border="1">')
        printWindow.document.write('<thead><tr>')
        printWindow.document.write('<th>Estado</th>')
        printWindow.document.write('<th>Vendidas x unidad</th>')
        printWindow.document.write('</tr></thead><tbody>')
        printWindow.document.write('<tr>')
        printWindow.document.write('<td>Horneadas</td>')
        printWindow.document.write(`<td>${cantidadHorneadas}</td>`)
        printWindow.document.write('</tr>')
        printWindow.document.write('<tr>')
        printWindow.document.write('<td>Congeladas</td>')
        printWindow.document.write(`<td>${cantidadCongeladas}</td>`)
        printWindow.document.write('</tr>')
        printWindow.document.write('</tbody></table>')

        // Print the third table
        printWindow.document.write('<h2>Resumen de Ventas por Variedad de Empanadas</h2>')
        printWindow.document.write('<table border="1">')
        printWindow.document.write('<thead><tr>')
        printWindow.document.write('<th>Variedad de Empanadas</th>')
        printWindow.document.write('<th>Vendidas x unidad</th>')
        printWindow.document.write('</tr></thead><tbody>')
        uniqueProductVarieties.forEach(variety => {
            printWindow.document.write('<tr>')
            printWindow.document.write(`<td>${variety}</td>`)
            printWindow.document.write(`<td>${productsSoldByVariety[variety]}</td>`)
            printWindow.document.write('</tr>')
        })
        printWindow.document.write('</tbody></table>')

        printWindow.document.write('</body></html>')
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
    }

    // OBTENER EL TOTAL DE EMPANADAS VENDIDAS HORNEADAS O CONGELADAS
    const horneadasSales = filteredSales.filter(sale => sale.products.some(product => product.productStatus === 'horneadas'));
    const congeladasSales = filteredSales.filter(sale => sale.products.some(product => product.productStatus === 'congeladas'));

    const cantidadHorneadas = horneadasSales.reduce((total, sale) => {
        const productAmount = sale.products.reduce((acc, product) => {
            if (product.productStatus === 'horneadas') {
                if (product.amountDescription === 'docena') {
                    return acc + product.amount * 12;
                }
                return acc + product.amount;
            }
            return acc;
        }, 0);
        return total + productAmount;
    }, 0);

    const cantidadCongeladas = congeladasSales.reduce((total, sale) => {
        const productAmount = sale.products.reduce((acc, product) => {
            if (product.productStatus === 'congeladas') {
                if (product.amountDescription === 'docena') {
                    return acc + product.amount * 12;
                }
                return acc + product.amount;
            }
            return acc;
        }, 0);
        return total + productAmount;
    }, 0);


    // OBTENER EL TOTAL DE EMPANADAS VENDIDAS POR VARIEDAD
    const allProductVarieties = products.map(product => product.type)
    const uniqueProductVarieties = [...new Set(allProductVarieties)]
    const productsSoldByVariety = {}
    uniqueProductVarieties.forEach(variety => {
        const salesForVariety = filteredSales.filter(sale => {
            const product = products.find(p => p._id === sale.product)
            return product && product.type === variety
        })

        const totalSoldForVariety = salesForVariety.reduce((total, sale) => {
            if (sale.amountDescription === 'docena') {
                return total + sale.amount * 12
            }
            return total + sale.amount
        }, 0)

        productsSoldByVariety[variety] = totalSoldForVariety
    })

    //PROPINAS
    function calculateTotalTips() {
        let totalTips = 0;

        // Itera sobre cada venta
        filteredSales.forEach(sale => {
            // Itera sobre los pagos de cada venta
            sale.payments.forEach(payment => {
                // Suma la propina si está presente y no es nula
                if (payment.tip !== null && payment.tip !== undefined) {
                    totalTips += payment.tip;
                }
            });
        });

        return totalTips;
    }

    function calculateTotalTipCount() {
        let totalTipCount = 0;

        // Itera sobre cada venta
        filteredSales.forEach(sale => {
            // Itera sobre los pagos de cada venta
            sale.payments.forEach(payment => {
                // Incrementa el contador si la propina está presente y no es nula
                if (payment.tip !== null && payment.tip !== undefined) {
                    totalTipCount += 1;
                }
            });
        });

        return totalTipCount;
    }

    return (
        <>
            <div className='text-center p-5'>
                <h1 className='mb-5 saleTitle'><b>Ventas Realizadas</b></h1>
                <div className='row d-md-flex'>
                    <div className='col-12 col-md-2'>
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
                    <div className='my-2 my-md-0 col-12 col-md-2'>
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
                    <div className='my-2 my-md-0 col-12 col-md-3'>
                        <InputGroup>
                            <InputGroup.Text id="btnGroupAddon">
                                <BsSearch />
                            </InputGroup.Text>
                            <Form.Control
                                maxLength={30}
                                type="text"
                                placeholder="Buscar venta"
                                value={searchTerm}
                                onChange={handleSearchInputChange}
                            />
                        </InputGroup>
                    </div>
                    <div className='my-2 my-md-0 col-12 col-md-2'>
                        <Form.Group className='d-flex' controlId="searchOptionForm">
                            <Form.Label className='w-50' column sm={2}><b className='homeText clientTitle'>Buscar por:</b></Form.Label>
                            <Form.Select className='w-50' as="select" value={searchOption} onChange={handleSearchOptionChange}>
                                <option value="client">Cliente</option>
                                <option value="user">Vendedor</option>
                                <option value="product">Variedad</option>
                            </Form.Select>
                        </Form.Group>
                    </div>
                    <div className='my-2 my-md-0 col-12 col-md-3'>
                        <Form.Group className='d-flex' controlId="orderOptionForm">
                            <Form.Label className='w-50' column sm={2}><b className='homeText saleTitle'>Ordenar por:</b></Form.Label>
                            <Form.Select className='w-50' as="select" value={orderOption} onChange={handleOrderOptionChange}>
                                <option value="date ↓">Fecha ↓</option>
                                <option value="date ↑">Fecha ↑</option>
                            </Form.Select>
                        </Form.Group>
                    </div>
                </div>
                <div className='table-container mt-4' >
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th className='homeText text-center align-middle saleTitle'>Fecha</th>
                                <th className='homeText text-center align-middle saleTitle'>Vendedor</th>
                                <th className='homeText text-center align-middle saleTitle'>Cliente</th>
                                <th className='homeText text-center align-middle saleTitle'>Detalle de la venta</th>
                                <th className='homeText text-center align-middle saleTitle'>Total</th>
                                <th className='homeText text-center align-middle saleTitle'>Pagos</th>
                                {/* <th className='homeText text-center align-middle saleTitle'>Forma de pago</th>
                                <th className='homeText text-center align-middle saleTitle'>Pago</th>
                                <th className='homeText text-center align-middle saleTitle'>Propina</th> */}
                                <th className='homeText text-center align-middle saleTitle'>Saldo</th>
                                <th className='homeText text-center align-middle saleTitle'>Estado</th>
                                <th>
                                    <Button className='m-1' variant="dark" onClick={handlePrintTable}>
                                        <span className="d-flex align-items-center justify-content-center">
                                            <BsPrinterFill />
                                        </span>
                                    </Button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.slice().sort(compareSales).map((sale) => {
                                const client = clients.find((client) => client._id === sale.client);
                                const user = users.find((user) => user._id === sale.user);
                                let total = 0;
                                return (
                                    <tr key={sale._id}>
                                        <td className="text-center align-middle">{formatTableDate(formatDate(sale.date))}</td>
                                        <td className="text-center align-middle">
                                            {user ? `${user.lastName}, ${user.firstName}` : ''}
                                        </td>
                                        <td className="text-center align-middle">
                                            {client ? `${client.lastName}, ${client.firstName}` : ''}
                                        </td>
                                        <td className="text-center align-middle">
                                            {sale.products.map((product, index) => {
                                                const productItem = products.find((p) => p._id === product.product);
                                                let subtotal = product.unitPrice * product.amount;
                                                total += subtotal;

                                                return (
                                                    <div key={index}>
                                                        <div><b>Variedad:</b> {productItem ? productItem.type : ''} <b>Estado:</b> {product.productStatus}</div>
                                                        <div><b>Cantidad:</b> {product.amount} x {product.amountDescription}</div>
                                                        <div><b>Precio:</b> ${product.unitPrice} <b>Subtotal:</b> ${subtotal}</div>
                                                        {index < sale.products.length - 1 && <hr />}
                                                    </div>
                                                );
                                            })}
                                        </td>
                                        <td className="text-center align-middle"><b>${total}</b></td>
                                        <td className="text-center align-middle">{sale.payments.map((payment, paymentIndex) => (
                                            <div key={paymentIndex}>
                                                <div><b>Fecha:</b> {formatTableDate(formatDate(payment.date))}</div>
                                                <div><b>Pago:</b> ${payment.payment}</div>
                                                <div><b>Forma de pago:</b> {payment.wayToPay}</div>
                                                <div><b>Propina:</b> ${payment.tip || 0}</div>
                                                {paymentIndex < sale.payments.length - 1 && <hr />}
                                            </div>
                                        ))}</td>
                                        {/* <td className="text-center align-middle">${sale.payment}</td> */}
                                        {/* <td className="text-center align-middle">${sale.tip || 0}</td> */}
                                        <td className="text-center align-middle">${total - sale.payments.reduce((acc, payment) => acc + payment.payment, 0)}</td>
                                        <td className={`text-center align-middle ${total - sale.payment > 0 ? 'red-text' : (total - sale.payment === 0 ? 'green-text' : 'blue-text')}`}>
                                            {total - sale.payment > 0 ? 'Saldo pendiente' : (total - sale.payment === 0 ? 'Saldado' : 'Saldo a favor')}
                                        </td>
                                        <td className="text-center align-middle">
                                            <td className="text-center align-middle">
                                                <Button className='m-1 editButton' onClick={() => handleShowEditSaleModal(sale)} variant="">
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        <FaEdit />
                                                    </span>
                                                </Button>
                                                <Button className='m-1' onClick={() => handleShowDeletSaleModal(sale)} variant="danger">
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        <FaTrashAlt />
                                                    </span>
                                                </Button>
                                            </td>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
                <AddSale show={showAddSaleModal} onHide={handleCloseAddSaleModal} fetchSales={fetchSales} />
                <DeleteSale show={showDeleteSaleModal} onHide={handleCloseDeleteSaleModal} fetchSales={fetchSales} selectedSale={selectedSale} />
                <EditSale show={showEditSaleModal} onHide={handleCloseEditSaleModal} fetchSales={fetchSales} selectedSale={selectedSale} />
                <div className='d-flex justify-content-between mt-5'>
                    <h1 className='mx-5 productTitle'><b>Resumen de ventas:</b></h1>
                    <Button className='m-1' variant="secondary" onClick={handlePrintSummary}>Imprimir Resumen  <BsPrinterFill /></Button>
                </div>
                <div className='table-container mt-4'>
                    <Table striped bordered hover className='scrollable-x-table'>
                        <thead>
                            <tr>
                                <th className='homeText text-center align-middle saleTitle'></th>
                                <th className='homeText text-center align-middle saleTitle'>Cantidad</th>
                                <th className='homeText text-center align-middle saleTitle'>Subtotal</th>
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
                                <td colSpan={2}><b>SUBTOTAL</b></td>
                                <td><b>${calculateSubtotal()}</b></td>
                            </tr>
                            <tr>
                                <td>Propinas</td>
                                <td>{calculateTotalTipCount()}</td>
                                <td>${calculateTotalTips()}</td>
                            </tr>
                            <tr>
                                <td colSpan={2}><b>TOTAL</b></td>
                                <td><b>${calculateSubtotal() + calculateTotalTips()}</b></td>
                            </tr>
                        </tbody>
                    </Table>
                    <Table striped bordered hover className='scrollable-x-table'>
                        <thead>
                            <tr>
                                <th className='homeText text-center align-middle saleTitle'>Estado</th>
                                <th className='homeText text-center align-middle saleTitle'>Vendidas x unidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Horneadas</td>
                                <td>{cantidadHorneadas}</td>
                            </tr>
                            <tr>
                                <td>Congeladas</td>
                                <td>{cantidadCongeladas}</td>
                            </tr>
                        </tbody>
                    </Table>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th className='homeText text-center align-middle saleTitle'>Variedad de Empanadas</th>
                                <th className='homeText text-center align-middle saleTitle'>Vendidas x unidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uniqueProductVarieties.map(variety => (
                                <tr key={variety}>
                                    <td>{variety}</td>
                                    <td>{productsSoldByVariety[variety]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </>
    )
}
