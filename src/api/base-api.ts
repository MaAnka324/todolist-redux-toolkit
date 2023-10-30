import axios from "axios"
import { TaskPriorities, TaskStatuses } from "common/enum/enum"

const settings = {
    withCredentials: true,
    headers: {
        "API-KEY": "b2aa0181-7c4a-4cfb-9fa0-ad8f16fa6d5f",
    },
}
export const instance = axios.create({
    baseURL: "https://social-network.samuraijs.com/api/1.1/",
    ...settings,
})

export type ResponseType<D = {}> = {
    resultCode: number
    messages: Array<string>
    data: D
}

export type TaskType = {
    description: string
    title: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
    id: string
    todoListId: string
    order: number
    addedDate: string
}

export type UpdateTaskModelType = {
    title: string
    description: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
}

export type FieldErrorType = {
    error: string
    field: string
}

//❗ Чтобы у нас не было пересечения имен наовем общий тип BaseResponseType
export type BaseResponseType<D = {}> = {
    resultCode: number
    messages: string[]
    data: D
    fieldsErrors: FieldErrorType[]
}
