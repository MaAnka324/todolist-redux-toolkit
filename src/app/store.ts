import { tasksReducer } from "features/TodolistsList/tasks-reducer"
import { todolistsReducer } from "features/TodolistsList/todolists-reducer"
import { appReducer } from "./app-reducer"
import { configureStore } from "@reduxjs/toolkit"
import { authReducer } from "features/Login/auth-reducer"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        app: appReducer,
        todolists: todolistsReducer,
        tasks: tasksReducer,
    },
})

export type AppRootStateType = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// а это, чтобы можно было в консоли браузера обращаться к store в любой момент
// @ts-ignore
window.store = store
