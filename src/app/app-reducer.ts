import { authActions } from "features/Login/auth-reducer"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppThunk } from "app/store"
import { authAPI } from "features/Login/authApi"
import { createAppAsyncThunk } from "utils/createAsyncThunk"
import { handleServerNetworkError } from "utils/error-utils"

export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed"

const slice = createSlice({
    name: "app",
    initialState: {
        status: "idle" as RequestStatusType,
        error: null as string | null,
        isInitialized: false,
    },
    reducers: {
        setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
            state.error = action.payload.error
        },
        setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
            state.status = action.payload.status
        },
        setAppInitialized: (state, action: PayloadAction<{ value: boolean }>) => {
            state.isInitialized = action.payload.value
        },
    },
})

//
// export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
//     switch (action.type) {
//         case "APP/SET-STATUS":
//             return { ...state, status: action.status }
//         case "APP/SET-ERROR":
//             return { ...state, error: action.error }
//         case "APP/SET-IS-INITIALIED":
//             return { ...state, isInitialized: action.value }
//         default:
//             return { ...state }
//     }
// }

// const initializeAppTC = createAppAsyncThunk<any, undefined>(`${slice.name}/initializeAppTC`, async (_, thunkAPI) => {
//     const { dispatch, rejectWithValue } = thunkAPI
//     try {
//         const res = await authAPI.me()
//         if (res.data.resultCode === 0) {
//             dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }))
//         } else {
//         }
//         dispatch(appActions.setAppInitialized({ value: true }))
//     } catch (error) {
//         handleServerNetworkError(error, dispatch)
//         return rejectWithValue(null)
//     }
// })

// export const _initializeAppTC = (): AppThunk => (dispatch) => {
//     authAPI.me().then((res) => {
//         if (res.data.resultCode === 0) {
//             dispatch(authActions.setIsLoggedIn({ isLoggedIn: true }))
//         } else {
//         }
//         dispatch(appActions.setAppInitialized({ value: true }))
//     })
// }

export const appActions = slice.actions
export const appReducer = slice.reducer
