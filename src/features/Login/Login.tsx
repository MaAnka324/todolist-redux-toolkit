import React from "react"
import { FormikHelpers, useFormik } from "formik"
import { useSelector } from "react-redux"
import { AppRootStateType } from "app/store"
import { Navigate } from "react-router-dom"
import { useAppDispatch } from "hooks/useAppDispatch"
import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, TextField } from "@mui/material"
import { authThunks } from "features/Login/auth-reducer"
import { BaseResponseType } from "api/base-api"

type FormikErrorType = {
    email?: string
    password?: string
    rememberMe?: boolean
}

type FormValues = {
    email: string
    password: string
    rememberMe: boolean
}

export const Login = () => {
    const dispatch = useAppDispatch()

    const isLoggedIn = useSelector<AppRootStateType, boolean>((state) => state.auth.isLoggedIn)

    const formik = useFormik({
        validate: (values) => {
            const errors: FormikErrorType = {}
            if (!values.email) {
                errors.email = "Required"
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
                errors.email = "Invalid email address"
            }
            if (!values.password) {
                errors.password = "Required"
            } else if (values.password?.length < 4) {
                errors.password = "Please add more symbols"
            }
            return errors
        },
        initialValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
        onSubmit: (values, formikHelpers: FormikHelpers<FormValues>) => {
            dispatch(authThunks.loginTC(values))
                .unwrap()
                .catch((err: BaseResponseType) => {
                    console.log(err)
                    err.fieldsErrors?.forEach((fieldError) => {
                        formikHelpers.setFieldError(fieldError.field, fieldError.error)
                    })
                })
        },
    })

    if (isLoggedIn) {
        return <Navigate to={"/"} />
    }
    // console.log(!formik.errors.email)
    console.log(!formik.errors.password)

    return (
        <Grid container justifyContent="center">
            <Grid item xs={4}>
                <form onSubmit={formik.handleSubmit}>
                    <FormControl>
                        <FormLabel>
                            <p>
                                To log in get registered{" "}
                                <a href={"https://social-network.samuraijs.com/"} target={"_blank"}>
                                    here
                                </a>
                            </p>
                            <p>or use common test account credentials:</p>
                            <p> Email: free@samuraijs.com</p>
                            <p>Password: free</p>
                        </FormLabel>
                        <FormGroup>
                            <TextField label="Email" margin="normal" {...formik.getFieldProps("email")} />
                            {formik.touched.email && formik.errors.email && (
                                <div style={{ color: "red" }}>{formik.errors.email}</div>
                            )}
                            {/*{formik.errors.email ? <div style={{ color: "red" }}>{formik.errors.email}</div> : null}*/}

                            <TextField
                                type="password"
                                label="Password"
                                margin="normal"
                                {...formik.getFieldProps("password")}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <div style={{ color: "red" }}>{formik.errors.password}</div>
                            )}
                            {/*{formik.errors.password ? (*/}
                            {/*    <div style={{ color: "red" }}>{formik.errors.password}</div>*/}
                            {/*) : null}*/}
                            <FormControlLabel
                                label={"Remember me"}
                                control={
                                    <Checkbox
                                        {...formik.getFieldProps("rememberMe")}
                                        checked={formik.values.rememberMe}
                                    />
                                }
                            />
                            <Button
                                type={"submit"}
                                variant={"contained"}
                                color={"primary"}
                                disabled={!!formik.errors.email || !!formik.errors.password}
                            >
                                Login
                            </Button>
                        </FormGroup>
                    </FormControl>
                </form>
            </Grid>
        </Grid>
    )
}
