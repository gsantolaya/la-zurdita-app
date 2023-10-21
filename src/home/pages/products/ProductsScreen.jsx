//IMPORTACIONES
import React, { useEffect, useState } from 'react'
import { FaEdit, FaTrashAlt } from "react-icons/fa"
import Table from 'react-bootstrap/Table'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { TokenStorage } from "../../../utils/TokenStorage"
import { useNavigate } from "react-router-dom"
import InputGroup from "react-bootstrap/InputGroup"
import { BsSearch, BsPrinterFill } from "react-icons/bs"
import { AddProduct } from './AddProduct'
import { DeleteProduct } from './DeleteProduct'
import { EditProduct } from './EditProduct'
import "./ProductsScreen.css"

//COMPONENTE
export const ProductsScreen = () => {

    //DECLARACION DE CONSTANTES
    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [orderOption, setOrderOption] = useState('name')

    const [showAddProductModal, setShowAddProductModal] = useState(false)
    const handleCloseAddProductModal = () => setShowAddProductModal(false)

    const [showDeleteProductModal, setShowDeleteProductModal] = useState(false)

    const [showEditProductModal, setShowEditProductModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)

    const store = TokenStorage()
    const navigate = useNavigate()


    useEffect(() => {
        if (store.tokenValid) {
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
        } else {
            navigate("/login")
        }
    }, [navigate, store.token, store.tokenValid])


    //MANEJO PARA ELIMINAR PRODUCTO
    const handleShowDeletProductModal = (product) => {
        setSelectedProduct(product)
        setShowDeleteProductModal(true)
    }
    const handleCloseDeleteProductModal = () => {
        setSelectedProduct(null)
        setShowDeleteProductModal(false)
    }

    const handleShowEditProductModal = (product) => {
        setSelectedProduct(product)
        setShowEditProductModal(true)
    }

    const handleCloseEditProductModal = () => {
        setShowEditProductModal(false)
    }

    const handleOrderOptionChange = (event) => {
        setOrderOption(event.target.value)
    }
    const handleSearchInputChange = (event) => {
        setSearchTerm(event.target.value)
    }

    //FUNCION PARA FILTRAR PRODUCTOS
    const filteredProducts = products.filter((product) => {
        const productType = product.type.toLowerCase()
        return productType.includes(searchTerm.toLowerCase())
    })

    //FUNCION PARA ORDENAR LOS PRODUCTOS POR VARIEDAD O STOCK
    function compareProducts(a, b) {
        if (orderOption === 'Variedad ↑') {
            return a.type.localeCompare(b.type)
        } else if (orderOption === 'Variedad ↓') {
            return b.type.localeCompare(a.type)
        } else if (orderOption === 'Stock ↑') {
            return a.stock - b.stock
        } else if (orderOption === 'Stock ↓') {
            return b.stock - a.stock
        }
        return 0
    }

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/products', {
                headers: {
                    "access-token": store.token
                }
            })
            setProducts(response.data)
        } catch (error) {
            console.error(error)
        }
    }

    //FUNCION PARA IMPRIMIR LA TABLA
    const handlePrintTable = () => {
        const printWindow = window.open('', '', 'width=800,height=600')
        printWindow.document.write('<html><head><title>Tabla de Productos</title></head><body>')
        printWindow.document.write('<h1>Nuestras Empanadas</h1>')
        printWindow.document.write('<table border="1">')
        printWindow.document.write('<thead><tr>')
        printWindow.document.write('<th>Variedad</th>')
        printWindow.document.write('<th>Precio por unidad</th>')
        printWindow.document.write('<th>Precio Minorista</th>')
        printWindow.document.write('<th>Precio Mayorista</th>')
        printWindow.document.write('<th>Stock</th>')
        printWindow.document.write('</tr></thead><tbody>')

        // Agrega los datos de los productos a la tabla de la ventana de impresión
        filteredProducts.slice().sort(compareProducts).forEach((product) => {
            printWindow.document.write('<tr>')
            printWindow.document.write(`<td>${product.type}</td>`)
            printWindow.document.write(`<td>$${product.unitPrice}</td>`)
            printWindow.document.write(`<td>$${product.retailPrice}</td>`)
            printWindow.document.write(`<td>$${product.wholesalePrice}</td>`)
            printWindow.document.write(`<td>${product.stock}</td>`)
            printWindow.document.write('</tr>')
        })

        printWindow.document.write('</tbody></table>')
        printWindow.document.write('</body></html>')

        printWindow.document.close()
        printWindow.print()
        printWindow.close()
    }

    return (
        <>
            <div className='text-center p-5'>
                <h1 className='mb-5 productTitle'><b>Nuestras Empanadas</b></h1>
                <div className='row d-md-flex'>
                    <div className='col-12 col-md-4 col-xl-3 my-2 my-md-0'>
                        <InputGroup>
                            <InputGroup.Text id="btnGroupAddon">
                                <BsSearch />
                            </InputGroup.Text>
                            <Form.Control
                                maxLength={30}
                                type="text"
                                placeholder="Buscar empanada por variedad"
                                value={searchTerm}
                                onChange={handleSearchInputChange}
                            />
                        </InputGroup>
                    </div>
                    <div className='col-12 col-xl-3 my-2 my-md-0'>
                        <Form.Group className='d-flex' controlId="orderOptionForm">
                            <Form.Label className='w-50' column sm={2}><b className='homeText productTitle'>Ordenar por:</b></Form.Label>
                            <Form.Select className='w-50' as="select" value={orderOption} onChange={handleOrderOptionChange}>
                                <option value="Variedad ↑">Variedad ↑</option>
                                <option value="Variedad ↓">Variedad ↓</option>
                                <option value="Stock ↑">Stock ↑</option>
                                <option value="Stock ↓">Stock ↓</option>
                            </Form.Select>
                        </Form.Group>
                    </div>
                    <div className='col-12 col-xl-2 my-2 my-md-0 ms-auto'>
                        <Button variant='' className="buttonAddProduct" onClick={() => setShowAddProductModal(true)}>Agregar Empanada</Button>
                    </div>
                </div>
                <div className='table-container mt-4 scrollable-x-table' >
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th className='homeText text-center align-middle productTitle'>Variedad</th>
                                <th className='homeText text-center align-middle productTitle'>Precio por unidad</th>
                                <th className='homeText text-center align-middle productTitle'>Precio Minorista</th>
                                <th className='homeText text-center align-middle productTitle'>Precio Mayorista</th>
                                <th className='homeText text-center align-middle productTitle'>Stock</th>
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
                            {filteredProducts.slice().sort(compareProducts).map((product) => (
                                <tr key={product._id}>
                                    <td className="text-center align-middle">{product.type}</td>
                                    <td className="text-center align-middle">${product.unitPrice}</td>
                                    <td className="text-center align-middle">${product.retailPrice}</td>
                                    <td className="text-center align-middle">${product.wholesalePrice}</td>
                                    <td className="text-center align-middle">{product.stock}</td>
                                    <td className="text-center align-middle">
                                        <Button className='m-1 editButton' onClick={() => handleShowEditProductModal(product)} variant="">
                                            <span className="d-flex align-items-center justify-content-center">
                                                <FaEdit />
                                            </span>
                                        </Button>
                                        <Button className='m-1' onClick={() => handleShowDeletProductModal(product)} variant="danger">
                                            <span className="d-flex align-items-center justify-content-center">
                                                <FaTrashAlt />
                                            </span>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            <AddProduct show={showAddProductModal} onHide={handleCloseAddProductModal} fetchProducts={fetchProducts} />
            <DeleteProduct show={showDeleteProductModal} onHide={handleCloseDeleteProductModal} fetchProducts={fetchProducts} selectedProduct={selectedProduct} />
            <EditProduct show={showEditProductModal} onHide={handleCloseEditProductModal} fetchProducts={fetchProducts} selectedProduct={selectedProduct} />
        </>
    )
}
