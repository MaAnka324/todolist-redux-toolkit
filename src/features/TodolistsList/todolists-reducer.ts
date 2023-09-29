import { todolistsAPI, TodolistType } from "api/todolists-api"
import { appActions, RequestStatusType } from "app/app-reducer"
import { handleServerNetworkError } from "utils/error-utils"
import { AppThunk } from "app/store"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { clearTasksAndTodolists } from "common/actions/common.actions"

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: "todolist",
    initialState,
    reducers: {
        removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
            // return state.filter((tl) => tl.id != action.id)
            const index = state.findIndex((todo) => todo.id === action.payload.id)
            if (index !== -1) state.splice(index, 1)
        },
        addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
            // return [{ ...action.todolist, filter: "all", entityStatus: "idle" }, ...state]
            state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" })
        },
        changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
            //return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl))
            const index = state.findIndex((todo) => todo.id === action.payload.id)
            if (index !== -1) state[index].title = action.payload.title
        },
        changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
            // return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl))
            const index = state.findIndex((todo) => todo.id === action.payload.id)
            if (index !== -1) state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; status: RequestStatusType }>) => {
            const index = state.findIndex((todo) => todo.id === action.payload.id)
            if (index !== -1) state[index].entityStatus = action.payload.status
        },
        setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
            // return action.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
            return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
        },
    },
    extraReducers: (builder) => {
        builder.addCase(clearTasksAndTodolists, () => {
            return []
        })
    },
})

export const todolistsAction = slice.actions
export const todolistsReducer = slice.reducer

// thunks
export const fetchTodolistsTC = (): AppThunk => {
    return (dispatch) => {
        //dispatch(setAppStatusAC("loading"))
        dispatch(appActions.setAppStatus({ status: "loading" }))
        todolistsAPI
            .getTodolists()
            .then((res) => {
                dispatch(todolistsAction.setTodolists({ todolists: res.data }))
                dispatch(appActions.setAppStatus({ status: "succeeded" }))
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch)
            })
    }
}

export const removeTodolistTC = (todolistId: string): AppThunk => {
    return (dispatch) => {
        dispatch(appActions.setAppStatus({ status: "loading" }))
        dispatch(todolistsAction.changeTodolistEntityStatus({ id: todolistId, status: "loading" }))
        todolistsAPI.deleteTodolist(todolistId).then((res) => {
            dispatch(todolistsAction.removeTodolist({ id: todolistId }))
            dispatch(appActions.setAppStatus({ status: "succeeded" }))
        })
    }
}

export const addTodolistTC = (title: string): AppThunk => {
    return (dispatch) => {
        dispatch(appActions.setAppStatus({ status: "loading" }))
        todolistsAPI.createTodolist(title).then((res) => {
            dispatch(todolistsAction.addTodolist({ todolist: res.data.data.item }))
            dispatch(appActions.setAppStatus({ status: "succeeded" }))
        })
    }
}

export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
    return (dispatch) => {
        todolistsAPI.updateTodolist(id, title).then((res) => {
            dispatch(todolistsAction.changeTodolistTitle({ id: id, title: title }))
        })
    }
}

export type FilterValuesType = "all" | "active" | "completed"
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
