import { BaseResponseType, instance, TaskType, UpdateTaskModelType } from "api/base-api"
import { UpdateDomainTaskModelType } from "features/TodolistsList/tasks-reducer"

export const todolistsAPI = {
    getTodolists() {
        return instance.get<TodolistType[]>("todo-lists")
    },
    createTodolist(title: string) {
        return instance.post<BaseResponseType<{ item: TodolistType }>>("todo-lists", { title: title })
    },
    deleteTodolist(id: string) {
        return instance.delete<BaseResponseType>(`todo-lists/${id}`)
    },
    updateTodolist(id: string, title: string) {
        return instance.put<BaseResponseType>(`todo-lists/${id}`, { title: title })
    },
    getTasks(todolistId: string) {
        return instance.get<GetTasksResponse>(`todo-lists/${todolistId}/tasks`)
    },
    deleteTask(todolistId: string, taskId: string) {
        return instance.delete<BaseResponseType>(`todo-lists/${todolistId}/tasks/${taskId}`)
    },
    createTask(todolistId: string, taskTitile: string) {
        return instance.post<BaseResponseType<{ item: TaskType }>>(`todo-lists/${todolistId}/tasks`, {
            title: taskTitile,
        })
    },
    updateTask(todolistId: string, taskId: string, model: UpdateTaskModelType) {
        return instance.put<BaseResponseType<TaskType>>(`todo-lists/${todolistId}/tasks/${taskId}`, model)
    },
}

export type ArgUpdateTask = {
    taskId: string
    domainModel: UpdateDomainTaskModelType
    todolistId: string
}

export type TodolistType = {
    id: string
    title: string
    addedDate: string
    order: number
}

type GetTasksResponse = {
    error: string | null
    totalCount: number
    items: TaskType[]
}

export type UpdateTodolistTitleArgType = {
    id: string
    title: string
}
