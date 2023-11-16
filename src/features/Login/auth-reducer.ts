import { handleServerNetworkError } from "utils/error-utils"
import { createSlice } from "@reduxjs/toolkit"
import { appActions } from "app/app-reducer"
import { handleServerAppError } from "utils/handleServerAppError"
import { authAPI, LoginParamsType } from "features/Login/authApi"
import { createAppAsyncThunk } from "utils/createAsyncThunk"

const slice = createSlice({
    name: "auth",
    initialState: {
        isLoggedIn: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginTC.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn
            })
            .addCase(logoutTC.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn
            })
            .addCase(initializeAppTC.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn
            })
    },
})

// thunks

const loginTC = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>(
    `${slice.name}/loginTC`,
    async (arg, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI
        try {
            dispatch(appActions.setAppStatus({ status: "loading" }))
            const res = await authAPI.login(arg)
            if (res.data.resultCode === 0) {
                dispatch(appActions.setAppStatus({ status: "succeeded" }))
                return { isLoggedIn: true }
            } else {
                console.log(res.data)
                const isShowAppError = !res.data.fieldsErrors.length
                handleServerAppError(res.data, dispatch, isShowAppError)
                return rejectWithValue(res.data)
            }
        } catch (error) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    },
)

// export const _loginTC =
//     (data: LoginParamsType): AppThunk =>
//     (dispatch) => {
//         //dispatch(setAppStatusAC("loading"))
//         dispatch(appActions.setAppStatus({ status: "loading" }))
//         authAPI
//             .login(data)
//             .then((res) => {
//                 if (res.data.resultCode === 0) {
//                     //dispatch(setIsLoggedInAC(true))
//                     dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }))
//                     //dispatch(setAppStatusAC("succeeded"))
//                     dispatch(appActions.setAppStatus({ status: "succeeded" }))
//                 } else {
//                     handleServerAppError(res.data, dispatch)
//                 }
//             })
//             .catch((error) => {
//                 handleServerNetworkError(error, dispatch)
//             })
//     }

const logoutTC = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>(
    `${slice.name}/logoutTC`,
    async (_, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI
        try {
            dispatch(appActions.setAppStatus({ status: "loading" }))
            const res = await authAPI.logout()
            if (res.data.resultCode === 0) {
                dispatch(appActions.setAppStatus({ status: "succeeded" }))
                return { isLoggedIn: false }
            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (error) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    },
)

// export const _logoutTC = (): AppThunk => (dispatch) => {
//     //dispatch(setAppStatusAC("loading"))
//     dispatch(appActions.setAppStatus({ status: "loading" }))
//     authAPI
//         .logout()
//         .then((res) => {
//             if (res.data.resultCode === 0) {
//                 dispatch(authActions.setIsLoggedIn({ isLoggedIn: false }))
//                 //dispatch(clearTasksAndTodolists({}, []))
//                 dispatch(appActions.setAppStatus({ status: "succeeded" }))
//             } else {
//                 handleServerAppError(res.data, dispatch)
//             }
//         })
//         .catch((error) => {
//             handleServerNetworkError(error, dispatch)
//         })
// }

const initializeAppTC = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>(
    `${slice.name}/initializeAppTC`,
    async (_, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI
        try {
            const res = await authAPI.me()
            if (res.data.resultCode === 0) {
                // dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }))
                return { isLoggedIn: true }
            } else {
                // handleServerNetworkError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (error) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        } finally {
            dispatch(appActions.setAppInitialized({ value: true }))
        }
    },
)

export const authActions = slice.actions
export const authReducer = slice.reducer
export const authThunks = { loginTC, logoutTC, initializeAppTC }
