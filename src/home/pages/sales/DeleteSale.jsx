import React, { useState } from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { TokenStorage } from "../../../utils/TokenStorage"

export const DeleteSale = ({ show, onHide, fetchSales, selectedSale }) => {

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
    const deleteSale = async (id) => {
        try {
            const response = await axios.delete(`/sales/${id}`, {
                headers: {
                    "access-token": store.token
                }
            })
            if (response.status === 200) {
                onHide()
                setShowConfirmationToast(true)
                fetchSales()
            }
        } catch (error) {
            onHide()
            setShowErrorToast(true)
            console.error(error)
        }
    }

    return (
        <>
            {/* MODAL */}
            <Modal show={show} onHide={onHide}>
                <Modal.Header className='modalHeader' closeButton>
                    <Modal.Title className='modalTitle'><strong>Confirmar Eliminación</strong></Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody py-4'>
                    ¿Estás seguro de que deseas eliminar esta venta?
                </Modal.Body>
                <Modal.Footer className='modalBody'>
                    <Button variant="secondary" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={() => deleteSale(selectedSale?._id)}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* TOAST */}
            <ToastContainer className="p-3" style={{ position: 'fixed', zIndex: 1, bottom: '20px', right: '20px', }} >
                <Toast show={showConfirmationToast} onClose={handleConfirmationToastClose} className="toastConfirmation" delay={5000} autohide>
                    <Toast.Header className="toastConfirmationHeader">
                        <strong className="me-auto">Eliminación Exitosa</strong>
                    </Toast.Header>
                    <Toast.Body>La venta ha sido eliminado correctamente.</Toast.Body>
                </Toast>
                <Toast show={showErrorToast} onClose={handleErrorToastClose} className="toastError" delay={5000} autohide>
                    <Toast.Header className="toastErrorHeader">
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Hubo un error al eliminar la venta. Por favor, inténtalo nuevamente.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    )
}
