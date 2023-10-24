import React from 'react'
import Nav from 'react-bootstrap/Nav'
import './SideMenu.css'
import { tokenIsValid } from '../../utils/TokenIsValid'

export function SideMenu() {
    const decodedToken = tokenIsValid()
    const currentPath = window.location.pathname
    const isActive = (path) => {
        return currentPath === path ? 'active' : ''
    }
    const handleLogout = () => {
        localStorage.removeItem('token')
    }

    return (
        <Nav className="flex-column sideMenuContainer col-12">
            <Nav.Link className={`sideMenuLinks ${isActive('/products')}`} href="/products">
                Productos
            </Nav.Link>
            <Nav.Link className={`sideMenuLinks ${isActive('/clients')}`} href="/clients">
                Clientes
            </Nav.Link>
            <Nav.Link className={`sideMenuLinks ${isActive('/orders')}`} href="/orders">
                Pedidos
            </Nav.Link>
            {decodedToken.isAdmin && (
                <>
                    <Nav.Link className={`sideMenuLinks ${isActive('/sales')}`} href="/sales">
                        Ventas
                    </Nav.Link>
                    <Nav.Link className={`sideMenuLinks ${isActive('/expenses')}`} href="/expenses">
                        Gastos
                    </Nav.Link>
                </>
            )}
            <Nav.Link className="log" href="/" onClick={handleLogout}>
                Cerrar Sesión
            </Nav.Link>
        </Nav>
    )
}