import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HomeScreen } from "../home/pages/HomeScreen"
import { LoginScreen } from "../auth/pages/LoginScreen"
import { RegisterScreen } from "../auth/pages/RegisterScreen"
import { ClientsScreen0 } from '../home/pages/ClientsScreen0'
import { SalesScreen0 } from '../home/pages/SalesScreen0'
import { ProductsScreen0 } from '../home/pages/ProductsScreen0'
import { ExpensesScreen0 } from '../home/pages/ExpensesScreen0'
import { OrdersScreen0 } from '../home/pages/OrdersScreen0'
import { UsersScreen0 } from '../home/pages/UsersScreen0'
import { NavbarMenu } from '../home/components/NavbarMenu'
import { Error404Screen } from '../Error404Screen'
import { Welcome } from '../home/components/Welcome'
import { Footer } from '../home/components/Footer'

export const AppRouter = () => {
  return (
    <>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </>
  )
}

const AppContent = () => {
  const location = useLocation()
  const isNavbarVisible = location.pathname !== '/error404'
  const isFooterVisible = location.pathname !== '/error404'

  return (
    <>
      {isNavbarVisible && <NavbarMenu />}
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/products" element={<ProductsScreen0 />} />
        <Route path="/clients" element={<ClientsScreen0 />} />
        <Route path="/sales" element={<SalesScreen0 />} />
        <Route path="/expenses" element={<ExpensesScreen0 />} />
        <Route path="/orders" element={<OrdersScreen0 />} />
        <Route path="/users" element={<UsersScreen0 />} />
        <Route path="/error404" element={<Error404Screen />} />
        <Route path="/*" element={<Error404Screen />} />
      </Routes>
      {isFooterVisible && <Footer />}
    </>
  )
}