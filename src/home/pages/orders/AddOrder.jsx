import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { FaTrashAlt } from 'react-icons/fa'
import { Modal, Toast, Form, Button } from 'react-bootstrap'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { TokenStorage } from '../../../utils/TokenStorage'
import { tokenIsValid } from '../../../utils/TokenIsValid'
import logoNavbar from '../../components/img/Imagen_de_WhatsApp_2023-10-02_a_las_15.55.47_72f6c6c6-removebg-preview.png'
export const AddOrder = ({ show, onHide, fetchSales }) => {

  const { handleSubmit, register, reset, formState: { errors }, setValue, watch } = useForm()
  const [showConfirmationAddSaleToast, setShowConfirmationAddSaleToast] = useState(false)
  const [showErrorAddSaleToast, setShowErrorAddSaleToast] = useState(false)
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const store = TokenStorage()
  const [additionalProductFields, setAdditionalProductFields] = useState([])
  const [nextId, setNextId] = useState(1)
  const decodedToken = tokenIsValid()
  const userId = `${decodedToken.id}`
  const [currentDate, setCurrentDate] = useState('')

  const [subtotals, setSubtotals] = useState([0])
  const [total, setTotal] = useState(0)

  const [productFieldsData, setProductFieldsData] = useState({})

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

  // Effect to calculate total
  useEffect(() => {
    const calculatedTotal = subtotals.reduce((accumulator, currentSubtotal) => {
      return accumulator + currentSubtotal
    }, 0)
    setTotal(calculatedTotal)
  }, [subtotals])

  // Effect to fetch clients and products
  useEffect(() => {
    if (store.tokenValid) {
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
    }
  }, [store.tokenValid, store.token])



  //CERRAR EL MODAL CON CANCELAR O X
  const handleOnHideModal = () => {
    reset()
    setAdditionalProductFields([])
    setNextId(1)
    setSubtotals([0])
    setTotal(0)
    setProductFieldsData({})
    onHide()
  }


  const handleConfirmationAddSaleToastClose = () => {
    setShowConfirmationAddSaleToast(false)
  }

  const handleErrorAddSaleToastClose = () => {
    setShowErrorAddSaleToast(false)
  }

  const handleAddProductField = () => {
    const newId = nextId
    setAdditionalProductFields([...additionalProductFields, { id: newId, type: "unidad" }])

    // Añadir un nuevo subtotal inicializado en 0
    setSubtotals(prevSubtotals => [...prevSubtotals, 0])

    // Crea un objeto vacío para los valores del nuevo campo
    setProductFieldsData(prevData => ({
      ...prevData,
      [newId]: {},
    }))

    setNextId(newId + 1)
  }

  const handleRemoveProductField = (id) => {
    const updatedFields = additionalProductFields.filter((field) => field.id !== id)
    setAdditionalProductFields(updatedFields)

    // Establecer el valor correspondiente en el estado de subtotals a 0 en lugar de eliminarlo
    setSubtotals((prevSubtotals) => {
      const updatedSubtotals = [...prevSubtotals]
      updatedSubtotals[id] = 0
      return updatedSubtotals
    })

    // Eliminar los valores correspondientes al campo eliminado en el objeto de datos de producto
    setProductFieldsData((prevData) => {
      const updatedData = { ...prevData }
      delete updatedData[id]
      return updatedData
    })
  }


  // GUARDAR VENTA EN LA BASE DE DATOS
  const handleAddSaleFormSubmit = async (data) => {
    if (additionalProductFields.length === 0) {
      alert("Debes agregar al menos un producto.")
      return
    }

    try {
      const salesPromises = []
      const productIdToAmountMap = {} // Mapa para rastrear las cantidades por productId

      additionalProductFields.forEach((productField, index) => {
        const productId = data[`product${productField.id}`]
        const amount = parseFloat(data[`amount${productField.id}`])
        const amountDescription = data[`amountDescription${productField.id}`]
        const productStatus = data[`productStatus${productField.id}`]

        // Comprobar si ya hemos visto este producto
        if (productId in productIdToAmountMap) {
          // Sumar la cantidad al producto existente
          if (amountDescription === 'docena') {
            productIdToAmountMap[productId] += amount * 12
          } else {
            productIdToAmountMap[productId] += amount
          }
        } else {
          // Crear una nueva entrada para el producto
          if (amountDescription === 'docena') {
            productIdToAmountMap[productId] = amount * 12
          } else {
            productIdToAmountMap[productId] = amount
          }
        }

        const saleToCreate = {
          date: data.date,
          user: userId,
          client: data.client,
          type: data.type,
          product: productId,
          amount: amount,
          amountDescription: amountDescription,
          productStatus: productStatus,
          unitPrice: parseFloat(data[`unitPrice${productField.id}`]),
        }

        salesPromises.push(
          axios.post('/sales/', saleToCreate, {
            headers: {
              "access-token": store.token
            }
          })
        )
      })

      const responses = await Promise.all(salesPromises)
      const isError = responses.some(response => response.status !== 201)

      if (isError) {
        setShowErrorAddSaleToast(true)
      } else {
        // Actualizar el stock de los productos
        for (const productId in productIdToAmountMap) {
          const amount = productIdToAmountMap[productId]

          axios.get(`/products/${productId}`, {
            headers: {
              "access-token": store.token
            }
          })
            .then((response) => {
              const product = response.data
              let newStock = product.stock - amount

              axios.patch(`/products/${productId}/stock`, { stock: newStock }, {
                headers: {
                  "access-token": store.token
                }
              })
                .then(() => {
                  console.log(`Stock updated for product ${productId}`)
                })
                .catch((error) => {
                  console.error(`Error updating stock for product ${productId}: ${error}`)
                })
            })
            .catch((error) => {
              console.error(`Error fetching product ${productId}: ${error}`)
            })
        }

        setShowConfirmationAddSaleToast(true)
        reset()
        setNextId(1)
        setSubtotals([0])
        setTotal(0)
        setProductFieldsData({})
        onHide()
        setAdditionalProductFields([])
        fetchSales()
        printOrder(data, additionalProductFields, subtotals, total)
      }
    } catch (error) {
      console.error(error)
      setShowErrorAddSaleToast(true)
    }
  }



  // MODIFICAR TIPO DE VENTA AL SELECCIONAR UN CLIENTE
  const handleClientChange = (event) => {
    const selectedClientId = event.target.value
    const selectedClient = clients.find((client) => client._id === selectedClientId)

    if (selectedClient) {
      const statusSelect = document.getElementById("formBasicStatus")
      if (statusSelect) {
        statusSelect.value = selectedClient.category
      }
      setValue("type", selectedClient.category === 'mayorista' ? 'mayorista' : 'minorista')
    } else {
      alert('Error, cliente no encontrado')
    }
  }

  const typeValue = watch("type")

  //ESTABLECER EL PRECIO DEL PRODUCTO POR UNIDAD SI ES UNA VENTA MAYORISTA AL SELECCIONAR UNA VARIEDAD
  const handleProductChange = (event, fieldId) => {
    const productId = event.target.value
    const selectedProduct = products.find((product) => product._id === productId)

    if (selectedProduct) {
      const unitPrice = typeValue === 'mayorista' ? selectedProduct.wholesalePrice : selectedProduct.retailPrice
      setValue(`unitPrice${fieldId}`, unitPrice)
    } else {
      setValue(`unitPrice${fieldId}`, '')
    }
  }

  ///ESTABLECER EL PRECIO DEL PRODUCTO POR UNIDAD SI ES UNA VENTA MINORISTA
  const handleAmountDescriptionChange = (event, fieldId) => {
    const selectedAmountDescription = event.target.value

    if (selectedAmountDescription === 'unidad') {
      const selectedProductId = watch(`product${fieldId}`)
      const selectedProduct = products.find((product) => product._id === selectedProductId)
      if (selectedProduct) {
        setValue(`unitPrice${fieldId}`, selectedProduct.unitPrice)
        // Recalculate subtotal and total
        const amount = parseFloat(watch(`amount${fieldId}`))
        const unitPrice = selectedProduct.unitPrice
        const subtotal = isNaN(amount) ? 0 : amount * unitPrice
        setSubtotals((prevSubtotals) => {
          const updatedSubtotals = [...prevSubtotals]
          updatedSubtotals[fieldId] = subtotal
          return updatedSubtotals
        })
        // Recalculate total
        const calculatedTotal = subtotals.reduce((accumulator, currentSubtotal) => {
          return accumulator + currentSubtotal
        }, 0)
        setTotal(calculatedTotal)
      }
    } else {
      const selectedProductId = watch(`product${fieldId}`)
      const selectedProduct = products.find((product) => product._id === selectedProductId)
      if (selectedProduct) {
        setValue(`unitPrice${fieldId}`, selectedProduct.retailPrice)
        // Recalculate subtotal and total
        const amount = parseFloat(watch(`amount${fieldId}`))
        const unitPrice = selectedProduct.retailPrice
        const subtotal = isNaN(amount) ? 0 : amount * unitPrice
        setSubtotals((prevSubtotals) => {
          const updatedSubtotals = [...prevSubtotals]
          updatedSubtotals[fieldId] = subtotal
          return updatedSubtotals
        })
        // Recalculate total
        const calculatedTotal = subtotals.reduce((accumulator, currentSubtotal) => {
          return accumulator + currentSubtotal
        }, 0)
        setTotal(calculatedTotal)
      }
    }
  }


  // IMPRIMIR COMANDA
  const printOrder = (data, additionalProductFields) => {
    const selectedClientId = data.client
    const selectedClient = clients.find((client) => client._id === selectedClientId)
    const clientFullName = selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'Cliente Desconocido'

    const tableHeader = `
    <div style="display: flex justify-content: space-between">
        <div>
          <img src="${logoNavbar}" alt="Logo" style="width: 400px margin-bottom: 20px;">
          <p style="font-size: 16px;"><b>Teléfono:</b> 3815932845</p>
        </div>
        <div>
          <h3><b>Fecha:</b> ${data.date}</h3>
          <h3><b>Cliente:</b> ${clientFullName}</h3>
          <h3><b>Domicilio del Cliente:</b> ${selectedClient.address}</h3>
        </div>
      </div>
    `

    const tableBody = `
      <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2; border: 1px solid #000; text-align: center;">
            <th style="padding: 10px;">Producto</th>
            <th style="padding: 10px;">Cantidad</th>
            <th style="padding: 10px;">Descripción Cantidad</th>
            <th style="padding: 10px;">Estado del Producto</th>
            <th style="padding: 10px;">Precio Unitario</th>
            <th style="padding: 10px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${additionalProductFields.map((field, index) => {
      const selectedProductId = data[`product${field.id}`]
      const selectedProduct = products.find((product) => product._id === selectedProductId)
      const productType = selectedProduct ? selectedProduct.type : 'Producto Desconocido'

      const amount = data[`amount${field.id}`]
      const amountDescription = data[`amountDescription${field.id}`]
      const productStatus = data[`productStatus${field.id}`]
      const unitPrice = data[`unitPrice${field.id}`]
      const subtotal = unitPrice * amount

      return `
              <tr style="border: 1px solid #000; text-align: center;">
                <td style="padding: 10px;">${productType}</td>
                <td style="padding: 10px;">${amount}</td>
                <td style="padding: 10px;">${amountDescription}</td>
                <td style="padding: 10px;">${productStatus}</td>
                <td style="padding: 10px;">$${unitPrice}</td>
                <td style="padding: 10px;">$${subtotal}</td>
              </tr>
            `
    }).join('')}
        </tbody>
      </table>
      <p style="text-align: right; margin-top: 20px;"><b>Total:</b> $${calculateTotal(data, additionalProductFields)}</p>
    `

    // Crear una ventana emergente con la tabla
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.open()
    printWindow.document.write(`
      <html>
        <head>
          <title>Orden de Venta</title>
        </head>
        <body>
          ${tableHeader}
          ${tableBody}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  // FUNCION PARA CALCULAR EL TOTAL
  const calculateTotal = (data, additionalProductFields) => {
    let total = 0
    additionalProductFields.forEach((field) => {
      const unitPrice = data[`unitPrice${field.id}`]
      const amount = data[`amount${field.id}`]
      total += unitPrice * amount
    })
    return total
  }




  return (
    <>
      {/* MODAL */}
      <Modal show={show} onHide={handleOnHideModal} size="xl">
        <Modal.Header closeButton className='modalHeader'>
          <Modal.Title className="modalTitle">
            <strong>Nuevo Pedido</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='modalBody'>

          <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleAddSaleFormSubmit)}>
            <div className='col-12 row my-2'>
              <h6>Información General:</h6>
              <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicDate">
                <Form.Label>Fecha:</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  {...register("date", { required: true })}
                  max={currentDate}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicClient">
                <Form.Label>Cliente:</Form.Label>
                <Form.Select as="select" name="client" {...register("client", { required: true })} onChange={handleClientChange}>
                  <option value="">Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client ? `${client.firstName} ${client.lastName}` : ''}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicType">
                <Form.Label>Tipo de venta:</Form.Label>
                <Form.Select as="select" name="type"  {...register("type", { required: true })}>
                  <option value="">Seleccione una opción</option>
                  <option value="mayorista">Mayorista</option>
                  <option value="minorista">Minorista</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className='col-12 row my-2'>
              <h6>Productos:</h6>
              {additionalProductFields.map((field, index) => (
                <div key={field.id} className='col-12 row my-2 align-items-center justify-content-between'>
                  <Form.Group className="formFields my-2 px-2 col-12 col-md-3" controlId={`formBasicDescription${field.id}`} onChange={handleProductChange}>
                    <Form.Label>Variedad:</Form.Label>
                    <Form.Select
                      as="select"
                      name={`product${field.id}`}
                      {...register(`product${field.id}`, { required: true })}
                      value={productFieldsData[field.id]?.product || ''}
                      onChange={(e) => {
                        const newValue = e.target.value
                        setProductFieldsData((prevData) => ({
                          ...prevData,
                          [field.id]: { ...prevData[field.id], product: newValue },
                        }))
                        handleProductChange(e, field.id)
                      }}
                    >
                      <option value="">Selecciona un producto</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {`${product.type}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="formFields my-2 px-2 col-12 col-md-1" controlId={`formBasicAmount${field.id}`}>
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control
                      type="number"
                      maxLength={5}
                      min="0"
                      name={`amount${field.id}`}
                      placeholder="000"
                      {...register(`amount${field.id}`, {
                        required: true,
                        validate: (value) => parseFloat(value) >= 0,
                      })}
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value)
                        const unitPrice = parseFloat(watch(`unitPrice${field.id}`))
                        const subtotal = isNaN(amount) || isNaN(unitPrice) ? 0 : amount * unitPrice
                        const updatedSubtotals = [...subtotals]
                        updatedSubtotals[field.id] = subtotal
                        setSubtotals(updatedSubtotals)
                      }}
                    />
                    {errors[`amount${field.id}`]?.type === 'required' && (
                      <span className="authSpan">Este campo es requerido</span>
                    )}
                    {errors[`amount${field.id}`]?.type === 'validate' && (
                      <span className="authSpan">Debe ser un número positivo</span>
                    )}
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-12 col-md-3" controlId={`formBasicAmountDescription${field.id}`}>
                    <Form.Label>Descripción Cantidad:</Form.Label>
                    <Form.Select
                      as="select"
                      name={`amountDescription${field.id}`}
                      {...register(`amountDescription${field.id}`, {
                        required: true
                      })}
                      onChange={(e) => handleAmountDescriptionChange(e, field.id)}
                    >
                      <option value="docena">Docena</option>
                      {typeValue === 'minorista' && (
                        <option value="unidad">Unidad</option>
                      )}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-12 col-md-2" controlId={`formBasicStatus${field.id}`}>
                    <Form.Label>Descripción Adicional:</Form.Label>
                    <Form.Select as="select" name={`productStatus${field.id}`} {...register(`productStatus${field.id}`, { required: true })}>
                      <option value="">Seleccione una opción</option>
                      <option value="horneadas">Horneadas</option>
                      <option value="congeladas">Congeladas</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-12 col-md-2" controlId={`formBasicPayment${field.id}`}>
                    <Form.Label>Precio unitario</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name={`unitPrice${field.id}`}
                      placeholder="Precio por unidad"
                      {...register(`unitPrice${field.id}`, { required: true, validate: (value) => parseFloat(value) >= 0 })}
                      onChange={(e) => {
                        const unitPrice = parseFloat(e.target.value)
                        const amount = parseFloat(watch(`amount${field.id}`))
                        const subtotal = isNaN(amount) || isNaN(unitPrice) ? 0 : amount * unitPrice
                        const updatedSubtotals = [...subtotals]
                        updatedSubtotals[field.id] = subtotal
                        setSubtotals(updatedSubtotals)
                      }}
                    />
                    {errors[`unitPrice${field.id}`]?.type === 'required' && (
                      <span className="authSpan">Este campo es requerido</span>
                    )}
                    {errors[`unitPrice${field.id}`]?.type === 'validate' && (
                      <span className="authSpan">Debe ser un número positivo</span>
                    )}
                  </Form.Group>
                  <Button className='buttonsFormAddSale my-2 col-1' variant="danger" type="button" onClick={() => handleRemoveProductField(field.id)} style={{ width: '40px', height: '40px' }}>
                    <FaTrashAlt />
                  </Button>
                  <h6>Subtotal: ${subtotals[field.id]}</h6>
                </div>
              ))}
              <Button className='buttonsFormAddSale w-25' variant="secondary" type="button" onClick={handleAddProductField}>
                Agregar
              </Button>
            </div>
            <h4>Total: ${total}</h4>
            <Modal.Footer className="mt-3 col-12">
              <Button className='buttonsFormAddSale m-2 w-100' variant="secondary" type="submit">
                Agregar Pedido
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
        <Toast show={showConfirmationAddSaleToast} onClose={handleConfirmationAddSaleToastClose} className="toastConfirmation" delay={5000} autohide>
          <Toast.Header className="toastConfirmationHeader">
            <strong className="me-auto">Registro Exitoso</strong>
          </Toast.Header>
          <Toast.Body>Nueva venta registrada.</Toast.Body>
        </Toast>
        <Toast show={showErrorAddSaleToast} onClose={handleErrorAddSaleToastClose} className="toastError" delay={5000} autohide>
          <Toast.Header className="toastErrorHeader">
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body>Hubo un error al registrar la venta. Por favor, inténtalo nuevamente.</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}