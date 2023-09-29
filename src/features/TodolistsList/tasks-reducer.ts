import { TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType } from "api/todolists-api"
import { Dispatch } from "redux"
import { AppThunk } from "app/store"
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils"
import { appActions } from "app/app-reducer"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { todolistsAction } from "features/TodolistsList/todolists-reducer"
import { clearTasksAndTodolists } from "common/actions/common.actions"

const initialState: TasksStateType = {}

const slice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
            //return { ...state, [action.todolistId]: state[action.todolistId].filter((t) => t.id != action.taskId) }
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex((t) => t.id === action.payload.taskId)
            if (index !== -1) tasks.splice(index, 1)
        },
        addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
            //return { ...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]] }
            const tasks = state[action.payload.task.todoListId]
            tasks.unshift(action.payload.task)
        },
        updateTask: (
            state,
            action: PayloadAction<{ taskId: string; model: UpdateDomainTaskModelType; todolistId: string }>,
        ) => {
            //return {
            //                 ...state,
            //                 [action.todolistId]: state[action.todolistId].map((t) =>
            //                     t.id === action.taskId ? { ...t, ...action.model } : t,
            //                 ),
            //             }
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex((t) => t.id === action.payload.taskId)
            if (index !== -1) {
                tasks[index] = { ...tasks[index], ...action.payload.model }
            }
        },
        setTasks: (state, action: PayloadAction<{ tasks: Array<TaskType>; todolistId: string }>) => {
            //return { ...state, [action.todolistId]: action.tasks }
            state[action.payload.todolistId] = action.payload.tasks
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(todolistsAction.addTodolist, (state, action) => {
                //return { ...state, [action.todolist.id]: [] }
                state[action.payload.todolist.id] = []
            })
            .addCase(todolistsAction.removeTodolist, (state, action) => {
                // const copyState = { ...state }
                // delete copyState[action.id]
                // return copyState
                delete state[action.payload.id]
            })
            .addCase(todolistsAction.setTodolists, (state, action) => {
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

// export const _tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
//     switch (action.type) {
// case "REMOVE-TASK":
//     return { ...state, [action.todolistId]: state[action.todolistId].filter((t) => t.id != action.taskId) }
// case "ADD-TASK":
//     return { ...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]] }
// case "UPDATE-TASK":
//     return {
//         ...state,
//         [action.todolistId]: state[action.todolistId].map((t) =>
//             t.id === action.taskId ? { ...t, ...action.model } : t,
//         ),
//     }
// case "ADD-TODOLIST":
//     return { ...state, [action.todolist.id]: [] }
// case "REMOVE-TODOLIST":
//     const copyState = { ...state }
//     delete copyState[action.id]
//     return copyState
// case "SET-TODOLISTS": {
//     const copyState = { ...state }
//     action.todolists.forEach((tl) => {
//         copyState[tl.id] = []
//     })
//     return copyState
// }
// case "SET-TASKS":
//     return { ...state, [action.todolistId]: action.tasks }
//         default:
//             return state
//     }
// }

// actions
// export const removeTaskAC = (taskId: string, todolistId: string) =>
//     ({ type: "REMOVE-TASK", taskId, todolistId }) as const
// export const addTaskAC = (task: TaskType) => ({ type: "ADD-TASK", task }) as const
// export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
//     ({ type: "UPDATE-TASK", model, todolistId, taskId }) as const
// export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
//     ({ type: "SET-TASKS", tasks, todolistId }) as const

// thunks
export const fetchTasksTC =
    (todolistId: string): AppThunk =>
    (dispatch: Dispatch) => {
        dispatch(appActions.setAppStatus({ status: "loading" }))
        todolistsAPI.getTasks(todolistId).then((res) => {
            const tasks = res.data.items
            //dispatch(setTasksAC(tasks, todolistId))
            dispatch(tasksAction.setTasks({ tasks, todolistId }))
            dispatch(appActions.setAppStatus({ status: "succeeded" }))
        })
    }
export const removeTaskTC =
    (taskId: string, todolistId: string): AppThunk =>
    (dispatch) => {
        todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
            //const action = removeTaskAC(taskId, todolistId)
            const action = tasksAction.removeTask({ taskId, todolistId })
            dispatch(action)
        })
    }
export const addTaskTC =
    (title: string, todolistId: string): AppThunk =>
    (dispatch: Dispatch) => {
        dispatch(appActions.setAppStatus({ status: "loading" }))
        todolistsAPI
            .createTask(todolistId, title)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    const task = res.data.data.item
                    //const action = addTaskAC(task)
                    const action = tasksAction.addTask({ task })
                    dispatch(action)
                    dispatch(appActions.setAppStatus({ status: "succeeded" }))
                } else {
                    handleServerAppError(res.data, dispatch)
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch)
            })
    }
export const updateTaskTC =
    (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
    (dispatch, getState) => {
        const state = getState()
        const task = state.tasks[todolistId].find((t) => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn("task not found in the state")
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel,
        }

        todolistsAPI
            .updateTask(todolistId, taskId, apiModel)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    //const action = updateTaskAC(taskId, domainModel, todolistId)
                    const action = tasksAction.updateTask({ taskId, model: domainModel, todolistId })
                    dispatch(action)
                } else {
                    handleServerAppError(res.data, dispatch)
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch)
            })
    }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
// type ActionsType =
//     | ReturnType<typeof removeTaskAC>
//     | ReturnType<typeof addTaskAC>
//     | ReturnType<typeof updateTaskAC>
//     | ReturnType<typeof setTasksAC>

// type ThunkDispatch = Dispatch<ActionsType>
