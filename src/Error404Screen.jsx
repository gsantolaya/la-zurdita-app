import React from "react";
import ErrorImage from './home/components/img/empanada_triste.png';
import { Link } from "react-router-dom";

export const Error404Screen = () => {
  return (
    <div className="mainContainer">
      <div className="d-flex pt-5">
        <div className="pt-5 col-md-6 d-flex flex-column align-items-center" style={{ height: "93vh" }}>
          <h1 className="mt-5">Error 404 - Not Found</h1>
          <Link id="return-link" to={"/"}>
            Pulse aquí para regresar a la página principal
          </Link>
        </div>
        <div className="col-md-6">
          <img
            src={ErrorImage}
            className="error-image"
            alt="error-img"
            style={{ width: "400px" }}
          />
        </div>
      </div>
    </div>
  );
};

