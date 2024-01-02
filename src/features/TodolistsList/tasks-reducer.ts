import { TaskType, UpdateTaskModelType } from "api/base-api"
import { appActions } from "app/app-reducer"
import { createSlice } from "@reduxjs/toolkit"
import { todolistsThunks } from "features/TodolistsList/todolists-reducer"
import { clearTasksAndTodolists } from "common/actions/common.actions"
import { createAppAsyncThunk } from "utils/createAsyncThunk"
import { handleServerAppError } from "utils/handleServerAppError"
import { ArgUpdateTask, todolistsAPI } from "features/TodolistsList/Todolist/todolistsApi"
import { ResultCode, TaskPriorities, TaskStatuses } from "common/enum/enum"
import { thunkTryCatch } from "utils/thunk-try-catch"

const initialState: TasksStateType = {}

const slice = createSlice({
    name: "tasks",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasksTC.fulfilled, (state, action) => {
                state[action.payload.todolistId] = action.payload.tasks
            })
            .addCase(addTaskTC.fulfilled, (state, action) => {
                const tasks = state[action.payload.task.todoListId]
                tasks.unshift(action.payload.task)
            })
            .addCase(updateTaskTC.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex((t) => t.id === action.payload.taskId)
                if (index !== -1) {
                    tasks[index] = { ...tasks[index], ...action.payload.domainModel }
                }
            })
            .addCase(removeTaskTC.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex((t) => t.id === action.payload.taskId)
                if (index !== -1) tasks.splice(index, 1)
            })
            .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
                //return { ...state, [action.todolist.id]: [] }
                state[action.payload.todolist.id] = []
            })
            .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
                // const copyState = { ...state }
                // delete copyState[action.id]
                // return copyState
                delete state[action.payload.id]
            })
            .addCase(todolistsThunks.fetchTodolistsTC.fulfilled, (state, action) => {
                // const copyState = { ...state }
                // action.todolists.forEach((tl) => {
                //     copyState[tl.id] = []
                // })
                // return copyState
                action.payload.todolists.forEach((tl) => {
                    state[tl.id] = []
                })
            })
            .addCase(clearTasksAndTodolists, () => {
                return {}
            })
    },
})

export const tasksAction = slice.actions
export const tasksReducer = slice.reducer

// thunks
const fetchTasksTC = createAppAsyncThunk<{ tasks: TaskType[]; todolistId: string }, string>(
    `${slice.name}/fetchTasksTC`,
    async (todolistId: string, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI
        return thunkTryCatch(thunkAPI, async () => {
            dispatch(appActions.setAppStatus({ status: "loading" }))
            const res = await todolistsAPI.getTasks(todolistId)
            //dispatch(tasksAction.setTasks({ tasks: res.data.items, todolistId }))
            dispatch(appActions.setAppStatus({ status: "succeeded" }))
            return { tasks: res.data.items, todolistId }
        })
    },
)

const addTaskTC = createAppAsyncThunk<{ task: TaskType }, { todolistId: string; title: string }>(
    `${slice.name}/addTasksTC`,
    async (arg, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI
        return thunkTryCatch(thunkAPI, async () => {
            const res = await todolistsAPI.createTask(arg.todolistId, arg.title)
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                return { task }
            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        })
    },
)

const removeTaskTC = createAppAsyncThunk<
    { taskId: string; todolistId: string },
    { taskId: string; todolistId: string }
>(`${slice.name}/removeTaskTC`, async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    return thunkTryCatch(thunkAPI, async () => {
        dispatch(appActions.setAppStatus({ status: "loading" }))
        const res = await todolistsAPI.deleteTask(arg.todolistId, arg.taskId)
        if (res.data.resultCode === ResultCode.Success) {
            dispatch(appActions.setAppStatus({ status: "succeeded" }))
            return arg
        } else {
            handleServerAppError(res.data, dispatch)
            return rejectWithValue(null)
        }
    })
})

const updateTaskTC = createAppAsyncThunk<ArgUpdateTask, ArgUpdateTask>(
    `${slice.name}/updateTasksTC`,
    async (arg, thunkAPI) => {
        const { dispatch, rejectWithValue, getState } = thunkAPI
        return thunkTryCatch(thunkAPI, async () => {
            const state = getState()
            const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId)
            if (!task) {
                return rejectWithValue(null)
            }
            const apiModel: UpdateTaskModelType = {
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                title: task.title,
                status: task.status,
                ...arg.domainModel,
            }
            const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel)
            if (res.data.resultCode === 0) {
                //const action = updateTaskAC(taskId, domainModel, todolistId)
                return arg
            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        })
    },
)

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = Record<string, TaskType[]>

export const tasksThunks = { fetchTasksTC, addTaskTC, updateTaskTC, removeTaskTC }
