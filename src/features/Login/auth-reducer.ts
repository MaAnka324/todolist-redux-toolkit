import { handleServerNetworkError } from "utils/error-utils"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppThunk } from "app/store"
import { appActions } from "app/app-reducer"
import { handleServerAppError } from "utils/handleServerAppError"
import { authAPI, LoginParamsType } from "features/Login/authApi"
import { createAppAsyncThunk } from "utils/createAsyncThunk"

const slice = createSlice({
    name: "auth",
    initialState: {
        isLoggedIn: false,
    },
    reducers: {
        setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
            state.isLoggedIn = action.payload.isLoggedIn
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginTC.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn
            })
            .addCase(logoutTC.fulfilled, (state, action) => {
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
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
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

export const authActions = slice.actions
export const authReducer = slice.reducer
export const authThunks = { loginTC, logoutTC }
