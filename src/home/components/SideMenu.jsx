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
            <Nav.Link className={`sideMenuLinks ${isActive('/home/products')}`} href="/home/products">
                Productos
            </Nav.Link>
            <Nav.Link className={`sideMenuLinks ${isActive('/home/clients')}`} href="/home/clients">
                Clientes
            </Nav.Link>
            <Nav.Link className={`sideMenuLinks ${isActive('/home/orders')}`} href="/home/orders">
                Pedidos
            </Nav.Link>
            {decodedToken.isAdmin && (
                <>
                    <Nav.Link className={`sideMenuLinks ${isActive('/home/sales')}`} href="/home/sales">
                        Ventas
                    </Nav.Link>
                    <Nav.Link className={`sideMenuLinks ${isActive('/home/expenses')}`} href="/home/expenses">
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