import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import axios from "axios"
import Form from "react-bootstrap/Form"
import "./LoginScreen.css"
import { tokenIsValid } from "../../utils/TokenIsValid"
import { MdEmail } from "react-icons/md"
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"

export const LoginScreen = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [loginError, setLoginError] = useState("")
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const Submit = (data) => {
        axios
            .post("/users/login", data)
            .then((res) => {
                let value = res.data.token
                localStorage.setItem("token", value)
                navigate("/home")
            })
            .catch((err) => {
                setLoginError("Usuario o contraseña incorrectos")
                console.log(err)
            })
    }

    useEffect(() => {
        if (tokenIsValid()) {
            navigate("/home")
        }
    }, [navigate])

    return (
        <div className="loginContainer">
            <div className="loginForm col-12 col-md-4 py-5 m-md-4 pt-md-5 px-md-5 pb-md-4">
                <h3 className="loginTitle mb-3">Iniciar Sesión</h3>
                <Form onSubmit={handleSubmit(Submit)}>
                    <Form.Group className="loginFormGroup p-3 my-3" controlId="formBasicEmail">
                        <div className="col-10">
                            <Form.Label className="d-inline">Email:</Form.Label>
                            <input
                                className="loginInput d-block w-100"
                                type="email"
                                maxLength={35}
                                placeholder="Ingrese su email"
                                id="email"
                                name="email"
                                {...register("email", {
                                    required: true,
                                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                })}
                            />
                            {errors?.email?.type === "required" && (
                                <span className="registerSpan">Este campo es requerido.</span>
                            )}
                            {errors?.email?.type === "pattern" && (
                                <span className="registerSpan">Ingrese un email válido.</span>
                            )}
                        </div>
                        <div className="d-flex align-items-center">
                            <MdEmail size={25} />
                        </div>
                    </Form.Group>
                    <Form.Group className="loginFormGroup p-3 my-3" controlId="formBasicPassword">
                        <div className="col-10">
                            <Form.Label className="d-inline">Contraseña:</Form.Label>
                            <input
                                className="loginInput d-block w-100"
                                type={showPassword ? "text" : "password"}
                                maxLength={35}
                                placeholder="Ingrese su contraseña"
                                id="password"
                                name="password"
                                {...register("password", {
                                    required: true,
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
                                })}
                            />
                            {errors?.password && <span className="loginSpan">Este campo es requerido. </span>}
                            {errors?.password && errors.password.type === "pattern" && (
                                <span className="loginSpan">La contraseña debe tener al menos 6 caracteres, una mayúscula y un número.</span>
                            )}
                        </div>
                        <div className="d-flex align-items-center" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <AiFillEye size={25} /> : <AiFillEyeInvisible size={25} />}
                        </div>
                    </Form.Group>
                    {loginError && (
                        <div className="text-center text-danger mb-2">
                            <span className="loginError"><b>{loginError}</b></span>
                        </div>
                    )}
                    <div className="text-center">
                        <Link className="loginLink" to={"/error404"}>
                            <b>¿Olvidaste tu contraseña?</b>
                        </Link>
                    </div>
                    <div className="contenedorloginButton" >
                        <button className="loginButton" type="submit">Acceder</button>
                    </div>
                    <p className="text-dark fw-bold mt-3 text-center">
                        ¿Aún no tienes una Cuenta?{" "}
                        <Link className="loginLink" to={"/register"}>
                            <b>Regístrate!</b>
                        </Link>
                    </p>
                </Form>
            </div>
        </div>
    )
}