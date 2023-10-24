import React, { useEffect, useState } from 'react'
import Form from "react-bootstrap/Form"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { FaUserAlt } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import { BsFillPersonCheckFill, BsFillPersonXFill } from "react-icons/bs"
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"
import { tokenIsValid } from '../../utils/TokenIsValid'
import axios from "axios"
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import "./RegisterScreen.css"

export const RegisterScreen = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordMatch, setPasswordMatch] = useState(true)
    const [users, setUsers] = useState([])
    const [emailExists, setEmailExists] = useState(false)
    const [showConfirmationRegisterToast, setShowConfirmationRegisterToast] = useState(false)
    const [showErrorRegisterToast, setShowErrorRegisterToast] = useState(false)

    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const checkEmailExists = (email) => {
        return users.some(user => user.email === email)
    }

    const Submit = (data) => {
        const { email } = data
        if (checkEmailExists(email)) {
            setEmailExists(true)
            return
        }

        if (data.password !== data.confirmPassword) {
            setPasswordMatch(false)
            return
        }

        axios
            .post("/users", { ...data, isAdmin: false, isActivated: false })
            .then((response) => {
                console.log('SUCCESS!', response.status, response.text)
                setShowConfirmationRegisterToast(true)
                setTimeout(function () {
                    navigate('/login')
                }, 3000)
            })
            .catch((err) => {
                console.log(err)
                setShowErrorRegisterToast(true)
            })
    }

    useEffect(() => {
        axios.get('/users')
            .then((response) => { setUsers(response.data) })
            .catch((err) => console.log(err))
        if (tokenIsValid()) { navigate("/home") }
    }, [navigate])


    const handleConfirmationRegisterToastClose = () => {
        setShowConfirmationRegisterToast(false)
    }
    const handleErrorRegisterToastClose = () => {
        setShowErrorRegisterToast(false)
    }

    return (
        <div className="registerContainer">
            <div className="registerForm col-12 col-md-4 py-5 m-md-4 pt-md-5 px-md-5 pb-md-4">
                <h3 className="registerTitle mb-3">Registrarse</h3>
                <Form onSubmit={handleSubmit(Submit)}>
                    <Form.Group className="registerFormGroup p-3 m-3" controlId="formBasicEmail">
                        <div className="col-10">
                            <Form.Label className="d-inline">Nombre:</Form.Label>
                            <input className="registerInput d-block w-100" type="text" maxLength={20} placeholder="Ingrese su nombre" id="firstName" name="firstName"
                                {...register("firstName", { required: true, minLength: 3 })} />
                            {errors?.firstName?.type === "required" && (
                                <span className="registerSpan">Este campo es requerido.</span>
                            )}
                            {errors?.firstName?.type === "minLength" && (
                                <span className="registerSpan">Debe tener al menos 3 caracteres.</span>
                            )}
                        </div>
                        <div className="d-flex align-items-center">
                            <FaUserAlt size={25} />
                        </div>
                    </Form.Group>
                    <Form.Group className="registerFormGroup p-3 m-3" controlId="formBasicEmail">
                        <div className="col-10">
                            <Form.Label className="d-inline">Apellido:</Form.Label>
                            <input className="registerInput d-block  w-100" type="text" maxLength={20} placeholder="Ingrese su apellido" id="lastName" name="lastName"
                                {...register("lastName", { required: true, minLength: 3 })}
                            />
                            {errors?.lastName && (
                                <span className="registerSpan">Este campo es requerido.</span>
                            )}
                            {errors?.lastName?.type === "minLength" && (
                                <span className="registerSpan">Debe tener al menos 3 caracteres.</span>
                            )}
                        </div>
                        <div className="d-flex align-items-center">
                            <FaUserAlt size={25} />
                        </div>
                    </Form.Group>
                    <Form.Group className="registerFormGroup p-3 m-3" controlId="formBasicEmail">
                        <div className="col-10">
                            <Form.Label className="d-inline">Email:</Form.Label>
                            <input className="registerInput d-block w-100" type="email" maxLength={35} placeholder="Ingrese su email" id="email" name="email"
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
                            {emailExists && (
                                <span className="registerSpan">El email ya ha sido registrado.</span>
                            )}
                        </div>
                        <div className="d-flex align-items-center">
                            <MdEmail size={25} />
                        </div>
                    </Form.Group>
                    <Form.Group className="registerFormGroup p-3 m-3" controlId="formBasicPassword">
                        <div className="col-10">
                            <Form.Label className="d-inline">Contraseña:</Form.Label>
                            <input
                                className="registerInput d-block  w-100" type={showPassword ? "text" : "password"} placeholder="Ingrese su contraseña" id="password" maxLength={35} name="password"
                                {...register("password", {
                                    required: true,
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
                                })}
                            />
                            {errors?.password && (
                                <span className="registerSpan">Este campo es requerido.</span>
                            )}
                            {errors?.password && errors.password.type === "pattern" && (
                                <span className="registerSpan">La contraseña debe tener al menos 6 caracteres, una mayúscula y un número.</span>
                            )}
                        </div>
                        <div
                            className="d-flex align-items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <AiFillEye size={25} />
                            ) : (
                                <AiFillEyeInvisible size={25} />
                            )}
                        </div>
                    </Form.Group>
                    <Form.Group className="registerFormGroup p-3 m-3" controlId="formBasicPassword">
                        <div className="col-10">
                            <Form.Label className="d-inline">
                                Confirmar Contraseña:
                            </Form.Label>
                            <input className="registerInput d-block  w-100" type={showConfirmPassword ? "text" : "password"} placeholder="Confirme su contraseña" id="confirmPassword" maxLength={35} name="confirmPassword"
                                {...register("confirmPassword", {
                                    required: true,
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
                                })}
                            />
                            {errors?.confirmPassword && (
                                <span className="registerSpan">Este campo es requerido.</span>
                            )}
                            {errors?.confirmPassword &&
                                errors.confirmPassword.type === "pattern" && (
                                    <span className="registerSpan">La contraseña debe tener al menos 6 caracteres, una mayúscula y un número.</span>
                                )}
                            {!passwordMatch && (
                                <span className="registerSpan">Las contraseñas no coinciden.</span>
                            )}
                        </div>
                        <div className="d-flex align-items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? (
                                <AiFillEye size={25} />
                            ) : (
                                <AiFillEyeInvisible size={25} />
                            )}
                        </div>
                    </Form.Group>
                    <div className='contenedorRegisterButton'>
                        <button className="registerButton" type="submit">Registrarme</button>
                    </div>
                    <p className="text-dark fw-bold mt-3 text-center">
                        ¿Ya tienes una cuenta?{" "}
                        <Link className="registerLink" to={"/login"}>Ingresa Aquí</Link>
                    </p>
                </Form>
            </div>
            <ToastContainer className="p-3" style={{ position: 'fixed', zIndex: 1, bottom: '20px', right: '20px', }} >
                <Toast show={showConfirmationRegisterToast} onClose={handleConfirmationRegisterToastClose} delay={3000} autohide>
                    <Toast.Header>
                        <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
                        <strong className="me-auto">Confirmación<BsFillPersonCheckFill /></strong>
                        <small>Ahora</small>
                    </Toast.Header>
                    <Toast.Body className='text-dark'>Registro exitoso, ya puede iniciar sesión.</Toast.Body>
                </Toast>
                <Toast show={showErrorRegisterToast} onClose={handleErrorRegisterToastClose} delay={3000} autohide>
                    <Toast.Header>
                        <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
                        <strong className="me-auto">Error    <BsFillPersonXFill /></strong>
                        <small>Ahora</small>
                    </Toast.Header>
                    <Toast.Body className='text-dark'>No se ha podido completar el registro, intente nuevamente.</Toast.Body>
                </Toast>
            </ToastContainer>
        </div >
    )
}