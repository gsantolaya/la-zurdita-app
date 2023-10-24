import React from 'react'
import './HomeScreen.css'
import { SideMenu } from '../components/SideMenu'
import { ProductsScreen } from './products/ProductsScreen'

export const ProductsScreen0 = () => {
    return (
        <>
            <div className='d-flex'>
                <div className='col-2 col-sm-4 col-md-3 col-lg-2 sideMenuContainer'>
                    <SideMenu />
                </div>
                <div className='col-12 col-sm-8 col-md-9 col-lg-10 mainContainer'>
                    <ProductsScreen />
                </div>
            </div>
        </>
    )
}