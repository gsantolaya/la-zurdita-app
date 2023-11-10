import React, { useState } from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { TokenStorage } from "../../../utils/TokenStorage"

export const DeleteOrder = ({ show, onHide, fetchSales, selectedSale, products }) => {
    const [showConfirmationToast, setShowConfirmationToast] = useState(false)
    const [showErrorToast, setShowErrorToast] = useState(false)
    const store = TokenStorage()

    const handleConfirmationToastClose = () => {
        setShowConfirmationToast(false)
    }
    const handleErrorToastClose = () => {
        setShowErrorToast(false)
    }

    //FUNCION PARA ELIMINAR UN PRODUCTO
    const deleteOrder = async (id) => {
        try {
          const saleToDelete = selectedSale;
          const stockToReturn = {};
      
          for (const productSale of saleToDelete.products) {
            const product = products.find((product) => product._id === productSale.product);
            const stockKey = product._id.toString();
      
            if (!stockToReturn[stockKey]) {
              stockToReturn[stockKey] = 0;
            }
      
            if (productSale.amountDescription === 'docena') {
              stockToReturn[stockKey] += productSale.amount * 12;
            } else {
              stockToReturn[stockKey] += productSale.amount;
            }
          }
      
          const response = await axios.delete(`/sales/${id}`, {
            headers: {
              "access-token": store.token
            }
          });
      
          if (response.status === 200) {
            for (const stockKey in stockToReturn) {
              if (stockToReturn.hasOwnProperty(stockKey)) {
                const product = products.find((product) => product._id.toString() === stockKey);
                const newStock = product.stock + stockToReturn[stockKey];
      
                // Realizar el patch en la ruta correspondiente para devolver el stock
                const patchResponse = await axios.patch(`/products/${product._id}/stock`, { stock: newStock }, {
                  headers: {
                    "access-token": store.token
                  }
                });
      
                if (patchResponse.status !== 200) {
                  setShowErrorToast(true);
                }
              }
            }
      
            onHide();
            setShowConfirmationToast(true);
            fetchSales();
          }
        } catch (error) {
          onHide();
          setShowErrorToast(true);
          console.error(error);
        }
      };
      
      
    


    return (
        <>
            {/* MODAL */}
            <Modal show={show} onHide={onHide}>
                <Modal.Header className='modalHeader' closeButton>
                    <Modal.Title className='modalTitle'><strong>Confirmar Eliminación</strong></Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody py-4'>
                    <b>¿Estás seguro de que deseas eliminar este pedido?</b>
                </Modal.Body>
                <Modal.Footer className='modalBody'>
                    <Button variant="secondary" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={() => deleteOrder(selectedSale?._id)}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* TOAST */}
            <ToastContainer className="p-3" style={{ position: 'fixed', zIndex: 1, bottom: '20px', right: '20px', }} >
                <Toast show={showConfirmationToast} onClose={handleConfirmationToastClose} className="toastConfirmation" delay={5000} autohide>
                    <Toast.Header className="toastConfirmationHeader">
                        <strong className="me-auto">Cancelación Exitosa</strong>
                    </Toast.Header>
                    <Toast.Body>El pedido ha sido cancelado correctamente.</Toast.Body>
                </Toast>
                <Toast show={showErrorToast} onClose={handleErrorToastClose} className="toastError" delay={5000} autohide>
                    <Toast.Header className="toastErrorHeader">
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Hubo un error al cancelar el pedido. Por favor, inténtalo nuevamente.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    )
}
