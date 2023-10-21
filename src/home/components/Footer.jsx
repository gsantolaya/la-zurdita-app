import React from "react"
import "./Footer.css"
import logoNavbar from '../components/img/Imagen_de_WhatsApp_2023-10-02_a_las_15.55.47_72f6c6c6-removebg-preview.png'

export function Footer() {
  return (
    <div className="d-flex footerContainer px-4 px-md-5">
      <div id='contactContainer' className="col-12 col-md-6 col-lg-4 my-2 ">
      </div>
      <div id='logoContainer' className="col-12 col-md-6 col-lg-4 d-flex row align-items-center justify-content-center">
      <img src={logoNavbar} className="appLogoFooter m-1" alt="logo" />
      <span><i>Todos los derechos reservados &copy; 2023 La Zurdita</i></span>
      </div>
      <div id='socialMediaContainer' className="col-12 col-md-6 col-lg-4 d-flex align-items-center justify-content-end ">
      </div>
    </div >
  )
}