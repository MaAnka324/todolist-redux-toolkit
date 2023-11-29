import React, { useCallback, useEffect } from "react"
import "./App.css"
import { TodolistsList } from "features/TodolistsList/TodolistsList"
import { ErrorSnackbar } from "components/ErrorSnackbar/ErrorSnackbar"
import { useDispatch, useSelector } from "react-redux"
import { AppRootStateType } from "./store"
import { RequestStatusType } from "./app-reducer"
import { HashRouter, Route, Routes } from "react-router-dom"
import { Login } from "features/Login/Login"
import {
    AppBar,
    Button,
    CircularProgress,
    Container,
    IconButton,
    LinearProgress,
    Toolbar,
    Typography,
} from "@mui/material"
import { Menu } from "@mui/icons-material"
import { authThunks } from "features/Login/auth-reducer"
import { useActions } from "hooks/useActions"

type PropsType = {
    demo?: boolean
}

function App({ demo = false }: PropsType) {
    const status = useSelector<AppRootStateType, RequestStatusType>((state) => state.app.status)
    const isInitialized = useSelector<AppRootStateType, boolean>((state) => state.app.isInitialized)
    const isLoggedIn = useSelector<AppRootStateType, boolean>((state) => state.auth.isLoggedIn)
    const dispatch = useDispatch<any>()

    const { initializeAppTC, logoutTC } = useActions(authThunks)

    useEffect(() => {
        // dispatch(authThunks.initializeAppTC())
        // bindActionCreators(authThunks.initializeAppTC, dispatch)()
        initializeAppTC()
    }, [])

    const logoutHandler = useCallback(() => {
        logoutTC()
    }, [])

    if (!isInitialized) {
        return (
            <div style={{ position: "fixed", top: "30%", textAlign: "center", width: "100%" }}>
                <CircularProgress />
            </div>
        )
    }

    return (
        // <BrowserRouter>
        <HashRouter>
            <div className="App">
                <ErrorSnackbar />
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu">
                            <Menu />
                        </IconButton>
                        <Typography variant="h6">News</Typography>
                        {isLoggedIn && (
                            <Button color="inherit" onClick={logoutHandler}>
                                Log out
                            </Button>
                        )}
                    </Toolbar>
                    {status === "loading" && <LinearProgress />}
                </AppBar>
                <Container fixed>
                    <Routes>
                        <Route path={"/"} element={<TodolistsList demo={demo} />} />
                        <Route path={"/login"} element={<Login />} />
                    </Routes>
                </Container>
            </div>
        </HashRouter>
        // </BrowserRouter>
    )
}

export default App
