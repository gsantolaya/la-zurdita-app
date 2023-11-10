//IMPORTACIONES
import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Nav from 'react-bootstrap/Nav'
import { TokenStorage } from "../../../utils/TokenStorage"
import { useNavigate } from "react-router-dom"
import InputGroup from "react-bootstrap/InputGroup"
import { BsSearch, BsPrinterFill } from "react-icons/bs"
import { AddOrder } from './AddOrder'
import { DeleteOrder } from './DeleteOrder'
import { EditOrder } from './EditOrder'
import { FinishOrder } from './FinishOrder'
import logoNavbar from '../../components/img/Imagen_de_WhatsApp_2023-10-02_a_las_15.55.47_72f6c6c6-removebg-preview.png'
import { FaEdit, FaTrashAlt, FaCheckCircle } from "react-icons/fa"

export const OrdersScreen = () => {

    //DECLARACION DE CONSTANTES
    const [sales, setSales] = useState([])
    const [products, setProducts] = useState([])
    const [clients, setClients] = useState([])
    const [users, setUsers] = useState([])

    const [searchTerm, setSearchTerm] = useState('')
    const [orderOption, setOrderOption] = useState('date ↓')
    const [searchOption, setSearchOption] = useState('client')

    const [showAddOrderModal, setShowAddOrderModal] = useState(false)
    const [showEditOrderModal, setShowEditOrderModal] = useState(false)

    const handleCloseAddOrderModal = () => setShowAddOrderModal(false)

    const [showDeleteSaleModal, setShowDeleteSaleModal] = useState(false)
    const [selectedSale, setSelectedSale] = useState(null)

    const [showFinishOrderModal, setShowFinishOrderModal] = useState(false)

    const store = TokenStorage()
    const navigate = useNavigate()



    useEffect(() => {
        if (store.tokenValid) {
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
    }, [navigate, store.token, store.tokenValid])


    const pendingSales = sales.filter((sale) => sale.status === 'pending')

    //MANEJO PARA ELIMINAR PRODUCTO
    const handleShowDeletSaleModal = (sale) => {
        setSelectedSale(sale)
        setShowDeleteSaleModal(true)
    }
    const handleCloseDeleteSaleModal = () => {
        setSelectedSale(null)
        setShowDeleteSaleModal(false)
    }
    const handleShowFinishOrderModal = (sale) => {
        setSelectedSale(sale)
        setShowFinishOrderModal(true)
    }
    const handleCloseFinishOrderModal = () => {
        setShowFinishOrderModal(false)
    }

    const handleShowEditOrderModal = (sale) => {
        setSelectedSale(sale)
        setShowEditOrderModal(true)
    }
    const handleCloseEditOrderModal = () => {
        setShowEditOrderModal(false)
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

    //FUNCION PARA FILTRAR LOS PEDIDOS
    const filteredSales = pendingSales.filter((sale) => {
        const client = clients.find((client) => client._id === sale.client)
        const user = users.find((user) => user._id === sale.user)
        const date = formatDate(sale.date)
        const product = products.find((product) => product._id === sale.product)
        switch (searchOption) {
            case 'client':
                return client && `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
            case 'user':
                return user && `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
            case 'date':
                return date.includes(searchTerm.toLowerCase())
            case 'product':
                return product && product.type.toLowerCase().includes(searchTerm.toLowerCase())
            default:
                return client && client.firstName.toLowerCase().includes(searchTerm.toLowerCase())
        }
    })

    //FUNCION PARA ORDENAR LOS PEDIDOS
    function compareSales(a, b) {
        if (orderOption === 'date ↑') {
            return new Date(a.date) - new Date(b.date)
        } else if (orderOption === 'date ↓') {
            return new Date(b.date) - new Date(a.date)
        }
        return 0
    }

    //Funcion para convertir fecha a la zona horaria local
    function formatDate(dateString) {
        const utcDate = new Date(dateString)
        const day = utcDate.getUTCDate()
        const month = utcDate.getUTCMonth() + 1
        const year = utcDate.getUTCFullYear()
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
    }


    //FUNCION PARA IMPRIMIR LA TABLA
    const handlePrintTable = () => {
        const printWindow = window.open('', '', 'width=800,height=600')
        printWindow.document.write('<html><head><title>Tabla de Pedidos</title></head><body>')
        printWindow.document.write('<h1>Nuestros Pedidos</h1>')
        printWindow.document.write('<table border="1">')
        printWindow.document.write('<thead><tr>')
        printWindow.document.write('<th>Número</th>')
        printWindow.document.write('<th>Fecha</th>')
        printWindow.document.write('<th>Vendedor</th>')
        printWindow.document.write('<th>Detalles del cliente</th>')
        printWindow.document.write('<th>Detalles del pedido</th>')
        printWindow.document.write('<th>Total</th>')
        printWindow.document.write('</tr></thead><tbody>')

        // Agrega los datos de los productos a la tabla de la ventana de impresión
        filteredSales.slice().sort(compareSales).forEach((sale) => {
            const product = products.find((product) => product._id === sale.product)
            const client = clients.find((client) => client._id === sale.client)
            const user = users.find((user) => user._id === sale.user)

            printWindow.document.write('<tr>')
            printWindow.document.write(`<td>$${sale.number}</td>`)
            printWindow.document.write(`<td>${formatDate(sale.date)}</td>`)
            printWindow.document.write(`<td>${user ? `${user.firstName} ${user.lastName}` : ''}</td>`)
            printWindow.document.write(`<td>Nombre: ${client ? `${client.lastName}, ${client.firstName}` : ''}<br>Dirección: ${client ? `${client.address}` : ''}<br>Teléfono: ${client ? `${client.phone}` : ''}</td>`)
            printWindow.document.write(`<td>Variedad: ${product ? `${product.type}` : ''}<br>Cantidad: ${sale.amount} - ${sale.amountDescription}<br>Estado: ${sale.productStatus}</td>`)
            printWindow.document.write(`<td>$${sale.unitPrice * sale.amount}</td>`)
            printWindow.document.write('</tr>')
        })

        printWindow.document.write('</tbody></table>')
        printWindow.document.write('</body></html>')

        printWindow.document.close()
        printWindow.print()
        printWindow.close()
    }

    const handlePrintCommand = (sale) => {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write('<html><head><title>Detalle del Pedido</title></head><body>');
        const img = new Image();
        img.src = logoNavbar;
        img.onload = function () {
            printWindow.document.write('<div style="text-align: center; margin-bottom: 20px;">');
            printWindow.document.write(`<p style="text-align: right"><b>${(sale.number)}</b></p>`);
            printWindow.document.write(`<img src="${logoNavbar}" alt="Logo" style="width: 600px;">`);
            printWindow.document.write('</div>');
            printWindow.document.write(`<h3 style="text-align: center; color: #5f3c23; margin-top: 20px;"><b><i>Tel: 3815932845</i></b></h3>`);
            printWindow.document.write(`<p style="text-align: right"><b>${formatDate(sale.date)}</b></p>`);
            const client = clients.find((client) => client._id === sale.client);
            if (client) {
                printWindow.document.write(`<p style="margin: 0px; padding:0px"><b>Cliente: </b>${client.firstName} ${client.lastName}</p>`);
                printWindow.document.write('<p style="margin: 0px; padding:0px"><b>Teléfono: </b>' + client.phone + '</p>');
                printWindow.document.write('<p style="margin-top: 0px; padding:0px"><b>Dirección: </b>' + client.address + '</p>');
            }
            printWindow.document.write('<table style="width: 100%; border-collapse: collapse; border: 1px solid black;">');
            printWindow.document.write('<thead><tr>');
            printWindow.document.write('<th style="padding: 8px; border: 1px solid black; text-align: center; vertical-align: middle;">Variedad</th>');
            printWindow.document.write('<th style="padding: 8px; border: 1px solid black; text-align: center; vertical-align: middle;">Cantidad</th>');
            printWindow.document.write('<th style="padding: 8px; border: 1px solid black; text-align: center; vertical-align: middle;">Estado</th>');
            printWindow.document.write('<th style="padding: 8px; border: 1px solid black; text-align: center; vertical-align: middle;">Precio por unidad</th>');
            printWindow.document.write('<th style="padding: 8px; border: 1px solid black; text-align: center; vertical-align: middle;">Subtotal</th>');
            printWindow.document.write('</tr></thead><tbody>');
            const total = sale.products.reduce((acc, product) => {
                const productItem = products.find((p) => p._id === product.product);
                const subtotal = product.unitPrice * product.amount;
                printWindow.document.write('<tr>');
                printWindow.document.write('<td style="padding: 8px; border: 1px solid black; text-align: center; vertical-align: middle;">');
                printWindow.document.write(`${productItem ? `${productItem.type}` : ''}`);
                printWindow.document.write('</td>');
                printWindow.document.write('<td style="padding: 8px; border: 1px solid black; text-align: center; vertical-align: middle;">');
                printWindow.document.write(`${product.amount} x ${product.amountDescription}`);
                printWindow.document.write('</td>');
                printWindow.document.write('<td style="padding: 8px; border: 1px solid black; text-align: center; vertical-align: middle;">');
                printWindow.document.write(`${product.productStatus}`);
                printWindow.document.write('</td>');
                printWindow.document.write('<td style="padding: 8px; border: 1px solid black; text-align: center; vertical-align: middle;">');
                printWindow.document.write(`$${product.unitPrice}`);
                printWindow.document.write('</td>');
                printWindow.document.write('<td style="padding: 8px; border: 1px solid black; text-align: center; vertical-align: middle;">');
                printWindow.document.write(`<b>$${subtotal}</b>`);
                printWindow.document.write('</td>');
                printWindow.document.write('</tr>');
                return acc + subtotal;
            }, 0);
            printWindow.document.write('</tbody></table>');
            printWindow.document.write(`<h2 style="text-align: right; margin-top: 20px;"><b>Total: $${total}</b></h2>`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
        }
    }

    return (
        <>
            <div className='text-center p-5'>
                <h1 className='mb-5 title clientTitle'><b>Pedidos en Curso</b></h1>

                <div className='row d-md-flex'>
                    <div className='col-12 col-md-4 col-xl-3 my-2 my-md-0'>
                        <InputGroup>
                            <InputGroup.Text id="btnGroupAddon">
                                <BsSearch />
                            </InputGroup.Text>
                            <Form.Control
                                maxLength={30}
                                type="text"
                                placeholder="Buscar pedido"
                                value={searchTerm}
                                onChange={handleSearchInputChange}
                            />
                        </InputGroup>
                    </div>
                    <div className='col-12 col-md-4 col-xl-3 my-2 my-md-0'>
                        <Form.Group className='d-flex' controlId="searchOptionForm">
                            <Form.Label className='w-50' column sm={2}><b className='homeText clientTitle'>Buscar por:</b></Form.Label>
                            <Form.Select className='w-50' as="select" value={searchOption} onChange={handleSearchOptionChange}>
                                <option value="client">Cliente</option>
                                <option value="user">Vendedor</option>
                                <option value="date">Fecha</option>
                                <option value="product">Variedad</option>
                            </Form.Select>
                        </Form.Group>
                    </div>
                    <div className='col-12 col-xl-3 my-2 my-md-0'>
                        <Form.Group className='d-flex' controlId="orderOptionForm">
                            <Form.Label className='w-50' column sm={2}><b className='homeText saleTitle'>Ordenar por:</b></Form.Label>
                            <Form.Select className='w-50' as="select" value={orderOption} onChange={handleOrderOptionChange}>
                                <option value="date ↓">Fecha ↓</option>
                                <option value="date ↑">Fecha ↑</option>
                            </Form.Select>
                        </Form.Group>
                    </div>
                    <div className='col-12 col-xl-2 my-2 my-md-0 ms-auto'>
                        <Nav.Link className="buttonAddClient" onClick={() => setShowAddOrderModal(true)}>Nuevo Pedido</Nav.Link>
                    </div>
                </div>
                <div className='table-container mt-4 scrollable-x-table' >
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th className='homeText text-center align-middle saleTitle'>Número</th>
                                <th className='homeText text-center align-middle saleTitle'>Fecha</th>
                                <th className='homeText text-center align-middle saleTitle'>Vendedor</th>
                                <th className='homeText text-center align-middle saleTitle'>Detalles del cliente</th>
                                <th className='homeText text-center align-middle saleTitle'>Detalles del pedido</th>
                                <th className='homeText text-center align-middle saleTitle'>Total</th>
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
                                        <td className="text-center align-middle">{sale.number}</td>
                                        <td className="text-center align-middle">{formatDate(sale.date)}</td>
                                        <td className="text-center align-middle">
                                            {user ? `${user.lastName}, ${user.firstName}` : ''}
                                        </td>
                                        <td className="text-center align-middle">
                                            <div><b>Nombre:</b> {client ? `${client.lastName}, ${client.firstName}` : ''}</div>
                                            <div><b>Dirección:</b> {client ? `${client.address}` : ''}</div>
                                            <div><b>Teléfono:</b> {client ? `${client.phone}` : ''}</div>
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
                                        <td className="text-center align-middle">

                                            <Button className='m-1 editButton' variant="" onClick={() => handleShowFinishOrderModal(sale)}>
                                                <span className="d-flex align-items-center justify-content-center">
                                                    <FaCheckCircle />
                                                </span>
                                            </Button>
                                            <Button className='m-1' variant="secondary" onClick={() => handleShowEditOrderModal(sale)}>
                                                <span className="d-flex align-items-center justify-content-center">
                                                    <FaEdit />
                                                </span>
                                            </Button>
                                            <Button className='m-1' variant="danger" onClick={() => handleShowDeletSaleModal(sale)}>
                                                <span className="d-flex align-items-center justify-content-center">
                                                    <FaTrashAlt />
                                                </span>
                                            </Button>
                                            <Button className='m-1' variant="dark" onClick={() => handlePrintCommand(sale)}>
                                                <span className="d-flex align-items-center justify-content-center">
                                                    <BsPrinterFill />
                                                </span>
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            </div>
            <AddOrder show={showAddOrderModal} onHide={handleCloseAddOrderModal} fetchSales={fetchSales} />
            <DeleteOrder show={showDeleteSaleModal} onHide={handleCloseDeleteSaleModal} fetchSales={fetchSales} selectedSale={selectedSale} products={products}/>
            <EditOrder show={showEditOrderModal} onHide={handleCloseEditOrderModal} fetchSales={fetchSales} selectedSale={selectedSale} />
            <FinishOrder show={showFinishOrderModal} onHide={handleCloseFinishOrderModal} fetchSales={fetchSales} selectedSale={selectedSale} />
        </>
    )
}
