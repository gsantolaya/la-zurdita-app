import React, { useEffect } from 'react'
import './HomeScreen.css'
import { SideMenu } from '../components/SideMenu'
import { Welcome } from '../components/Welcome'
import { TokenStorage } from "../../utils/TokenStorage"
import { useNavigate } from "react-router-dom"

export const HomeScreen = () => {

    const store = TokenStorage()
    const navigate = useNavigate()

    useEffect(() => {
        if (!store.tokenValid) {
          navigate("/login")
        }
      }, [navigate, store.token, store.tokenValid])

    return (
        <>
            <div className='d-flex'>
                <div className='col-2 col-sm-4 col-md-3 col-lg-2 sideMenuContainer'>
                    <SideMenu />
                </div>
                <div className='col-12 col-sm-8 col-md-9 col-lg-10 mainContainer'>
                    <Welcome />
                </div>
            </div>
        </>
    )
}