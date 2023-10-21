import React from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'

import { TokenStorage } from "../../utils/TokenStorage"
import { tokenIsValid } from '../../utils/TokenIsValid'

import { FaUserAlt } from 'react-icons/fa'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { useNavigate } from 'react-router-dom'
import logoNavbar from '../components/img/Imagen_de_WhatsApp_2023-10-02_a_las_15.55.47_72f6c6c6-removebg-preview.png'
import './NavbarMenu.css'


export function NavbarMenu() {
    const currentPath = window.location.pathname

    const store = TokenStorage()
    const decodedToken = tokenIsValid()

    const navigate = useNavigate()
    console.log(decodedToken)
    const handleNavClick = () => {
        if (decodedToken) {
            navigate('/home')
        } else {
            navigate('/')
        }
    }

    const isActive = (path) => {
        return currentPath === path ? 'navActive' : ''
    }
    const handleLogout = () => {
        localStorage.removeItem('token')
    }

    return (
        <Navbar className="navContainer p-1" variant="dark" expand="lg">
            <Container className='bigScreen mx-4 ms-auto px-4'>
                <Navbar.Brand className='d-flex' onClick={handleNavClick}>
                    <img src={logoNavbar} className="appLogoNavbar" alt="logo" />
                </Navbar.Brand>
            </Container>
            <Container className='mx-4 ms-auto px-4'>
                <Navbar.Brand className='smallScreen' onClick={handleNavClick}>
                    <img src={logoNavbar} className="appLogoNavbar" alt="logo" />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto containerNavLink">
                        <Nav.Link id="inicioNavLink" className="navLinks" onClick={handleNavClick}>Inicio</Nav.Link>
                        {
                            store.tokenValid && (
                                <NavDropdown className="navDropdownLinksTitle smallScreen" id="nav-dropdown-dark-example" title="Nav" menuVariant="dark">
                                    <NavDropdown.Item className={`navDropdownLinks ${isActive('/home/products')}`} href="/home/products">Productos</NavDropdown.Item>
                                    <NavDropdown.Item className={`navDropdownLinks ${isActive('/home/clients')}`} href="/home/clients">Clientes</NavDropdown.Item>
                                    <NavDropdown.Item className={`navDropdownLinks ${isActive('/home/orders')}`} href="/home/orders">Pedidos</NavDropdown.Item>
                                    {decodedToken.isAdmin && (
                                        <>
                                            <NavDropdown.Item className={`navDropdownLinks ${isActive('/home/sales')}`} href="/home/sales">Ventas</NavDropdown.Item>
                                            <NavDropdown.Item className={`navDropdownLinks ${isActive('/home/expenses')}`} href="/home/expenses">Gastos</NavDropdown.Item>
                                        </>
                                    )}
                                </NavDropdown>
                            )
                        }
                        {decodedToken ? (
                            <>
                                <Nav.Link className="userNameLink text-center" href="/home/users"><FaUserAlt /> {decodedToken.firstName} {decodedToken.lastName}</Nav.Link>
                                <Nav.Link className="logOut ms-auto" href="/home" onClick={handleLogout}>Cerrar Sesión</Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link className="navLinks" href="/login">Login</Nav.Link>
                                <Nav.Link className="navLinks" href="/register">Registro</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}