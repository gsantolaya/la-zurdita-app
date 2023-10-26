import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { FaTrashAlt } from 'react-icons/fa'
import { Modal, Toast, Form, Button } from 'react-bootstrap'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { TokenStorage } from '../../../utils/TokenStorage'
import { tokenIsValid } from '../../../utils/TokenIsValid'

export const AddSale = ({ show, onHide, fetchSales }) => {
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
  const [subtotals, setSubtotals] = useState([])
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
    console.log(data)
    if (additionalProductFields.length === 0) {
      alert("Debes agregar al menos un producto.")
      return
    }
    try {
      // Initialize an array to store the promises for individual sales
      const salesPromises = []
      additionalProductFields.forEach((productField, index) => {
        const saleToCreate = {
          date: data.date,
          user: userId,
          client: data.client,
          type: data.type,
          product: data[`product${productField.id}`],
          amount: data[`amount${productField.id}`],
          amountDescription: data[`amountDescription${productField.id}`],
          productStatus: data[`productStatus${productField.id}`],
          unitPrice: data[`unitPrice${productField.id}`],
        }
        console.log("Sale to create:", saleToCreate)
        // Push each promise to the array
        salesPromises.push(
          axios.post('/sales/', saleToCreate, {
            headers: {
              "access-token": store.token
            }
          })
        )
      })

      // Wait for all promises to resolve
      const responses = await Promise.all(salesPromises)

      // Check the responses for errors
      const isError = responses.some(response => response.status !== 201)

      if (isError) {
        // Handle errors as needed
        setShowErrorAddSaleToast(true)
      } else {
        setShowConfirmationAddSaleToast(true)
        reset()
        onHide()
        fetchSales()
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
      // Actualizamos el valor del campo "Tipo de venta" de forma síncrona
      setValue("type", selectedClient.category === 'mayorista' ? 'mayorista' : 'minorista')
    } else {
      // Manejar el caso donde selectedClient es undefined, por ejemplo, limpiar valores o mostrar un mensaje de error.
    }
  }

  const typeValue = watch("type")

  const handleProductChange = (event, fieldId) => {
    const productId = event.target.value

    // Buscar el producto seleccionado en el estado 'products'
    const selectedProduct = products.find((product) => product._id === productId)

    if (selectedProduct) {
      // Obtener el precio unitario del producto seleccionado basado en 'typeValue'
      const unitPrice = typeValue === 'mayorista' ? selectedProduct.wholesalePrice : selectedProduct.retailPrice

      // Actualizar el precio unitario en el campo correspondiente
      setValue(`unitPrice${fieldId}`, unitPrice)
    } else {
      // Manejar el caso donde el producto seleccionado no se encuentra, por ejemplo, limpiar el campo de precio unitario.
      setValue(`unitPrice${fieldId}`, '') // Esto limpia el campo de precio unitario si el producto no se encuentra
    }
  }

  const handleAmountDescriptionChange = (event, fieldId) => {
    const selectedAmountDescription = event.target.value

    if (selectedAmountDescription === 'unidad') {
      // Obtener el producto seleccionado en este campo
      const selectedProductId = watch(`product${fieldId}`)
      const selectedProduct = products.find((product) => product._id === selectedProductId)

      if (selectedProduct) {
        // Obtener el precio unitario del producto y establecerlo en el campo 'unitPrice'
        setValue(`unitPrice${fieldId}`, selectedProduct.unitPrice)
      }
    } else {
      // Manejar otros casos aquí, si es necesario
      // Por ejemplo, puedes borrar el valor de 'unitPrice' si se selecciona "Docena".
      setValue(`unitPrice${fieldId}`, '') // Esto limpia el campo de 'unitPrice' si no es "Unidad".
    }
  }


  // MOSTRAR O NO DESCRIPCION DE CANTIDAD:

  return (
    <>
      {/* MODAL */}
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton className='modalHeader'>
          <Modal.Title className="modalTitle">
            <strong>Agregar Nueva Venta</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='modalBody'>
          <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleAddSaleFormSubmit)}>
            <div className='col-12 row my-2'>
              <h6>Información General:</h6>
              <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicDate">
                <Form.Label className='modalLabel'>Fecha:</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  {...register("date", { required: true })}
                  max={currentDate}
                />
              </Form.Group>
              <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicClient">
                <Form.Label className='modalLabel'>Cliente:</Form.Label>
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
                <Form.Label className='modalLabel'>Tipo de venta:</Form.Label>
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
                  <Form.Group className="formFields my-2 px-2 col-3" controlId={`formBasicDescription${field.id}`} onChange={handleProductChange}>
                    <Form.Label className='modalLabel'>Variedad:</Form.Label>
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
                        handleProductChange(e, field.id) // Llama a handleProductChange cuando cambia la variedad
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
                  <Form.Group className="formFields my-2 px-2 col-1" controlId={`formBasicAmount${field.id}`}>
                    <Form.Label className='modalLabel'>Cantidad</Form.Label>
                    <Form.Control
                      type="number"
                      maxLength={5}
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
                  <Form.Group className="formFields my-2 px-2 col-3" controlId={`formBasicAmountDescription${field.id}`}>
                    <Form.Label className='modalLabel'>Descripción Cantidad:</Form.Label>
                    <Form.Select
                      as="select"
                      name={`amountDescription${field.id}`}
                      {...register(`amountDescription${field.id}`, {
                        required: true,
                        disabled: typeValue === 'mayorista',
                      })}
                      onChange={(e) => handleAmountDescriptionChange(e, field.id)}
                    >
                      <option value="docena">Docena</option>
                      <option value="unidad" disabled={typeValue === 'mayorista'}>Unidad</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-2" controlId={`formBasicStatus${field.id}`}>
                    <Form.Label className='modalLabel'>Descripción Adicional:</Form.Label>
                    <Form.Select as="select" name={`productStatus${field.id}`} {...register(`productStatus${field.id}`, { required: true })}>
                      <option value="">Seleccione una opción</option>
                      <option value="horneadas">Horneadas</option>
                      <option value="congeladas">Congeladas</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-2" controlId={`formBasicPayment${field.id}`}>
                    <Form.Label className='modalLabel'>Precio unitario</Form.Label>
                    <Form.Control
                      type="number"
                      name={`unitPrice${field.id}`}
                      placeholder="Precio por unidad"
                      {...register(`unitPrice${field.id}`, { required: true })}
                      onChange={(e) => {
                        const unitPrice = parseFloat(e.target.value)
                        const amount = parseFloat(watch(`amount${field.id}`))
                        const subtotal = isNaN(amount) || isNaN(unitPrice) ? 0 : amount * unitPrice

                        const updatedSubtotals = [...subtotals]
                        updatedSubtotals[field.id] = subtotal
                        setSubtotals(updatedSubtotals)
                      }}
                    />
                    {errors?.unitPrice && (<span className="authSpan">Este campo es requerido</span>)}
                  </Form.Group>
                  <Button className='buttonsFormAddSale my-2 col-1' variant="danger" type="button" onClick={() => handleRemoveProductField(field.id)} style={{ width: '40px', height: '40px' }}>
                    <FaTrashAlt />
                  </Button>
                  <h6 className='modalLabel'>Subtotal: ${subtotals[field.id]}</h6>
                </div>
              ))}

              <Button className='buttonsFormAddSale w-25' variant="secondary" type="button" onClick={handleAddProductField}>
                Agregar
              </Button>
            </div>
            <h4>Total: ${total}</h4>

            <Modal.Footer className="mt-3 col-12">
              <Button className='buttonsFormAddSale m-2 w-100' variant="secondary" type="submit">
                Agregar Venta
              </Button>
              <Button className='buttonsFormAddSale m-2 w-100' variant="secondary" onClick={onHide}>
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
