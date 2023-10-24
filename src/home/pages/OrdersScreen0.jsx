import React from 'react'
import './HomeScreen.css'
import { SideMenu } from '../components/SideMenu'
import { OrdersScreen } from './orders/OrdersScreen'

export const OrdersScreen0 = () => {
    return (
        <>
            <div className='d-flex'>
                <div className='col-2 col-sm-4 col-md-3 col-lg-2 sideMenuContainer'>
                    <SideMenu />
                </div>
                <div className='col-12 col-sm-8 col-md-9 col-lg-10 mainContainer'>
                    <OrdersScreen />
                </div>
            </div>
        </>
    )
}