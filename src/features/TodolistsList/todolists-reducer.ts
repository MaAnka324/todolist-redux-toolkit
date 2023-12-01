import { appActions, RequestStatusType } from "app/app-reducer"
import { handleServerNetworkError } from "utils/error-utils"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { clearTasksAndTodolists } from "common/actions/common.actions"
import { todolistsAPI, TodolistType, UpdateTodolistTitleArgType } from "features/TodolistsList/Todolist/todolistsApi"
import { createAppAsyncThunk } from "utils/createAsyncThunk"
import { ResultCode } from "common/enum/enum"
import { thunkTryCatch } from "utils/thunk-try-catch"

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: "todolist",
    initialState,
    reducers: {
        // removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
        //     // return state.filter((tl) => tl.id != action.id)
        //     const index = state.findIndex((todo) => todo.id === action.payload.id)
        //     if (index !== -1) state.splice(index, 1)
        // },
        // addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
        //     // return [{ ...action.todolist, filter: "all", entityStatus: "idle" }, ...state]
        //     state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" })
        // },
        // changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
        //     //return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl))
        //     const index = state.findIndex((todo) => todo.id === action.payload.id)
        //     if (index !== -1) state[index].title = action.payload.title
        // },
        changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
            // return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl))
            const index = state.findIndex((todo) => todo.id === action.payload.id)
            if (index !== -1) state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; status: RequestStatusType }>) => {
            const index = state.findIndex((todo) => todo.id === action.payload.id)
            if (index !== -1) state[index].entityStatus = action.payload.status
        },
        // setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
        //     // return action.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
        //     return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
        // },
    },
    extraReducers: (builder) => {
        builder
            .addCase(clearTasksAndTodolists, () => {
                return []
            })
            .addCase(fetchTodolistsTC.fulfilled, (state, action) => {
                return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
            })
            .addCase(addTodolist.fulfilled, (state, action) => {
                const newTodolist: TodolistDomainType = {
                    ...action.payload.todolist,
                    filter: "all",
                    entityStatus: "idle",
                }
                state.unshift(newTodolist)
            })
            .addCase(removeTodolist.fulfilled, (state, action) => {
                const index = state.findIndex((todo) => todo.id === action.payload.id)
                if (index !== -1) state.splice(index, 1)
            })
            .addCase(changeTodolistTitle.fulfilled, (state, action) => {
                const todo = state.find((todo) => todo.id === action.payload.id)
                if (todo) {
                    todo.title = action.payload.title
                }
            })
    },
})

export const todolistsAction = slice.actions
export const todolistsReducer = slice.reducer

// thunks

const fetchTodolistsTC = createAppAsyncThunk<{ todolists: TodolistType[] }, void>(
    `${slice.name}/fetchTodolistsTC`,
    async (arg, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI
        return thunkTryCatch(thunkAPI, async () => {
            dispatch(appActions.setAppStatus({ status: "loading" }))
            const res = await todolistsAPI.getTodolists()
            //dispatch(todolistsAction.setTodolists({ todolists: res.data }))
            dispatch(appActions.setAppStatus({ status: "succeeded" }))
            return { todolists: res.data }
        })
    },
)

const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, string>(
    "todo/addTodolist",
    async (title, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI
        return thunkTryCatch(thunkAPI, async () => {
            dispatch(appActions.setAppStatus({ status: "loading" }))
            const res = await todolistsAPI.createTodolist(title)
            if (res.data.resultCode === ResultCode.Success) {
                dispatch(appActions.setAppStatus({ status: "succeeded" }))
                return { todolist: res.data.data.item }
            } else {
                handleServerNetworkError(res.data, dispatch)
                return rejectWithValue(null)
            }
        })
    },
)

const removeTodolist = createAppAsyncThunk<{ id: string }, string>("todo/removeTodolist", async (id, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    return thunkTryCatch(thunkAPI, async () => {
        dispatch(appActions.setAppStatus({ status: "loading" }))
        dispatch(todolistsAction.changeTodolistEntityStatus({ id, status: "loading" }))
        const res = await todolistsAPI.deleteTodolist(id)
        if (res.data.resultCode === ResultCode.Success) {
            dispatch(appActions.setAppStatus({ status: "succeeded" }))
            return { id }
        } else {
            handleServerNetworkError(res.data, dispatch)
            return rejectWithValue(null)
        }
    })
})

const changeTodolistTitle = createAppAsyncThunk<UpdateTodolistTitleArgType, UpdateTodolistTitleArgType>(
    "todo/changeTodolistTitle",
    async (arg, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI
        return thunkTryCatch(thunkAPI, async () => {
            dispatch(appActions.setAppStatus({ status: "loading" }))
            const res = await todolistsAPI.updateTodolist(arg.id, arg.title)
            if (res.data.resultCode === ResultCode.Success) {
                dispatch(appActions.setAppStatus({ status: "succeeded" }))
                return arg
            } else {
                handleServerNetworkError(res.data, dispatch)
                return rejectWithValue(null)
            }
        })
    },
)

export type FilterValuesType = "all" | "active" | "completed"
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

export const todolistsThunks = { fetchTodolistsTC, removeTodolist, changeTodolistTitle, addTodolist }
