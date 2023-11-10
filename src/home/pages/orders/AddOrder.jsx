import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { FaTrashAlt } from 'react-icons/fa'
import { Modal, Toast, Form, Button } from 'react-bootstrap'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { TokenStorage } from '../../../utils/TokenStorage'
import { tokenIsValid } from '../../../utils/TokenIsValid'

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
  const [highestSaleNumber, setHighestSaleNumber] = useState(0);

  // MANEJO LA FECHA
  const getCurrentDateInArgentina = () => {
    const now = new Date()
    now.setHours(now.getHours() - 3)
    const formattedDate = now.toISOString().split('T')[0]
    setCurrentDate(formattedDate)
  }
  useEffect(() => {
    getCurrentDateInArgentina()
  }, [])

  // CALCULAR TOTAL
  useEffect(() => {
    const calculatedTotal = subtotals.reduce((accumulator, currentSubtotal) => {
      return accumulator + currentSubtotal
    }, 0)
    setTotal(calculatedTotal)
  }, [subtotals])

  // OBTENER CLIENTES Y PRODUCTOS
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

  useEffect(() => {
    if (store.tokenValid) {
      axios.get('/sales', {
        headers: {
          "access-token": store.token
        }
      })
        .then((response) => {
          // Extract the sale numbers from the sales data
          const saleNumbers = response.data.map(sale => sale.number);
  
          // Find the maximum sale number
          const maxSaleNumber = Math.max(...saleNumbers, 0);
  
          // Validate and set the highestSaleNumber
          const maxSaleNumberValidado = isNaN(maxSaleNumber) ? 0 : maxSaleNumber;
          setHighestSaleNumber(maxSaleNumberValidado);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [store.tokenValid, store.token]);
  
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

  const checkStockSufficiency = async (data) => {
    for (const productField of additionalProductFields) {
      const productId = data[`product${productField.id}`];
      const amount = parseFloat(data[`amount${productField.id}`]);
      const amountDescription = data[`amountDescription${productField.id}`];

      // Consulta el producto actual en la base de datos para obtener su stock actual
      const response = await axios.get(`/products/${productId}`, {
        headers: {
          "access-token": store.token
        }
      });

      const product = response.data;
      const currentStock = product.stock;

      // Ajusta la cantidad si la descripción es "docena"
      const adjustedAmount = amountDescription === "docena" ? amount * 12 : amount;

      // Compara el stock actual con la cantidad solicitada
      if (currentStock < adjustedAmount) {
        // Stock insuficiente, muestra una alerta y detén la función
        alert(`Stock insuficiente para el producto: ${product.type}`);
        return false;
      }
    }
    return true;
  };

  // GUARDAR VENTA EN LA BASE DE DATOS
  const handleAddSaleFormSubmit = async (data) => {
    if (additionalProductFields.length === 0) {
      alert("Debes agregar al menos un producto.");
      return;
    }
  
    // Verifica el stock antes de continuar
    const stockSufficient = await checkStockSufficiency(data);
    if (!stockSufficient) {
      return;
    }
  
    try {
      const productsData = additionalProductFields.map((field) => {
        const productId = data[`product${field.id}`];
        const amount = parseFloat(data[`amount${field.id}`]);
        const amountDescription = data[`amountDescription${field.id}`];
        const productStatus = data[`productStatus${field.id}`];
        const unitPrice = parseFloat(data[`unitPrice${field.id}`]);
        return {
          product: productId,
          amount,
          amountDescription,
          productStatus,
          unitPrice,
        };
      });
  
      const saleToCreate = {
        number: highestSaleNumber + 1,
        date: data.date,
        user: userId,
        client: data.client,
        type: data.type,
        products: productsData,
        status: 'pending'
      };
  console.log(saleToCreate)
      const response = await axios.post('/sales/', saleToCreate, {
        headers: {
          "access-token": store.token,
        },
      });
  
      if (response.status === 201) {
        // Actualizar el stock de los productos
        for (const productData of productsData) {
          const productId = productData.product;
          const amount = productData.amount;
          const amountDescription = productData.amountDescription;
  
          const response = await axios.get(`/products/${productId}`, {
            headers: {
              "access-token": store.token,
            },
          });
          const product = response.data;
  
          let newStock = product.stock;
  
          if (amountDescription === 'docena') {
            newStock -= amount * 12;
          } else {
            newStock -= amount;
          }
  
          // Actualiza el stock del producto
          await axios.patch(`/products/${productId}/stock`, { stock: newStock }, {
            headers: {
              "access-token": store.token,
            },
          });
        }
  
        setShowConfirmationAddSaleToast(true);
        reset();
        setNextId(1);
        setSubtotals([0]);
        setTotal(0);
        setProductFieldsData({});
        onHide();
        setAdditionalProductFields([]);
        fetchSales();
      } else {
        setShowErrorAddSaleToast(true);
      }
    } catch (error) {
      console.error(error);
      setShowErrorAddSaleToast(true);
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

  
  //ESTABLECER EL PRECIO DEL PRODUCTO POR UNIDAD SI ES UNA VENTA MAYORISTA AL SELECCIONAR UNA VARIEDAD
  const typeValue = watch("type")
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
              <h5 className='modalLabel'>Información General:</h5>
              <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicDate">
                <Form.Label className='modalLabel'>Fecha:</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  onChange={(e) => setCurrentDate(e.target.value)}
                  {...register("date", { required: true })}
                  // max={currentDate}
                  defaultValue={currentDate}
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
                {errors.client && (
                  <span className="validateSpan">Seleccione una opción.</span>
                )}
              </Form.Group>
              <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicType">
                <Form.Label className='modalLabel'>Tipo de venta:</Form.Label>
                <Form.Select as="select" name="type"  {...register("type", { required: true })}>
                  <option value="">Seleccione una opción</option>
                  <option value="mayorista">Mayorista</option>
                  <option value="minorista">Minorista</option>
                </Form.Select>
                {errors.type && (
                  <span className="validateSpan">Seleccione una opción.</span>
                )}
              </Form.Group>
            </div>
            <div className='col-12 row my-2'>
              <h5 className='modalLabel'>Productos:</h5>
              {additionalProductFields.map((field, index) => (
                <div key={field.id} className='col-12 row my-2 align-items-center justify-content-between'>
                  <Form.Group className="formFields my-2 px-2 col-12 col-md-3" controlId={`formBasicDescription${field.id}`} onChange={handleProductChange}>
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
                    {errors[`product${field.id}`] && (
                      <span className="validateSpan">Seleccione una opción.</span>
                    )}
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-12 col-md-1" controlId={`formBasicAmount${field.id}`}>
                    <Form.Label className='modalLabel'>Cantidad:</Form.Label>
                    <Form.Control
                      type="number"
                      maxLength={5}
                      name={`amount${field.id}`}
                      placeholder="000"
                      {...register(`amount${field.id}`, {
                        required: true,
                        pattern: /^\d+(\.\d{1,2})?$/
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
                    {errors[`amount${field.id}`] && (
                      <span className="validateSpan">Ingrese un número válido.</span>
                    )}
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-12 col-md-3" controlId={`formBasicAmountDescription${field.id}`}>
                    <Form.Label className='modalLabel'>Cantidad por:</Form.Label>
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
                    {errors[`amountDescription${field.id}`] && (
                      <span className="validateSpan">Seleccione una opción.</span>
                    )}
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-12 col-md-2" controlId={`formBasicStatus${field.id}`}>
                    <Form.Label className='modalLabel'>Descripción adicional:</Form.Label>
                    <Form.Select as="select" name={`productStatus${field.id}`} {...register(`productStatus${field.id}`, { required: true })}>
                      <option value="">Seleccione una opción</option>
                      <option value="horneadas">Horneadas</option>
                      <option value="congeladas">Congeladas</option>
                    </Form.Select>
                    {errors[`productStatus${field.id}`] && (
                      <span className="validateSpan">Seleccione una opción.</span>
                    )}
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-12 col-md-2" controlId={`formBasicPayment${field.id}`}>
                    <Form.Label className='modalLabel'>Precio unitario:</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name={`unitPrice${field.id}`}
                      placeholder="Precio por unidad"
                      {...register(`unitPrice${field.id}`, {
                        required: false,
                        pattern: /^\d+(\.\d{1,2})?$/
                      })}
                      onChange={(e) => {
                        const unitPrice = parseFloat(e.target.value)
                        const amount = parseFloat(watch(`amount${field.id}`))
                        const subtotal = isNaN(amount) || isNaN(unitPrice) ? 0 : amount * unitPrice
                        const updatedSubtotals = [...subtotals]
                        updatedSubtotals[field.id] = subtotal
                        setSubtotals(updatedSubtotals)
                      }}
                    />
                    {errors[`unitPrice${field.id}`] && (
                      <span className="validateSpan">Ingrese un número válido.</span>
                    )}
                  </Form.Group>
                  <Button className='buttonsFormAddSale my-2 mt-4 col-1' variant="danger" type="button" onClick={() => handleRemoveProductField(field.id)} style={{ width: '40px', height: '40px' }}>
                    <FaTrashAlt />
                  </Button>
                  <h6 className='modalLabel'>Subtotal: ${subtotals[field.id]}</h6>
                </div>
              ))}
              <Button className='buttonsFormAddSale w-25' variant="secondary" type="button" onClick={handleAddProductField}>
                Agregar
              </Button>
            </div>
            <h4 className='modalLabel'>Total: ${total}</h4>
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