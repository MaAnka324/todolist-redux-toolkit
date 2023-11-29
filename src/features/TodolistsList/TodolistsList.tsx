import React, { useCallback, useEffect } from "react"
import { useSelector } from "react-redux"
import { AppRootStateType } from "app/store"
import { FilterValuesType, TodolistDomainType, todolistsAction, todolistsThunks } from "./todolists-reducer"
import { TasksStateType, tasksThunks } from "./tasks-reducer"
import { Grid, Paper } from "@mui/material"
import { AddItemForm } from "components/AddItemForm/AddItemForm"
import { Todolist } from "./Todolist/Todolist"
import { Navigate } from "react-router-dom"
import { useAppDispatch } from "hooks/useAppDispatch"
import { TaskStatuses } from "common/enum/enum"
import { useActions } from "hooks/useActions"

type PropsType = {
    demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
    const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>((state) => state.todolists)
    const tasks = useSelector<AppRootStateType, TasksStateType>((state) => state.tasks)
    const isLoggedIn = useSelector<AppRootStateType, boolean>((state) => state.auth.isLoggedIn)

    const dispatch = useAppDispatch()

    const {
        fetchTodolistsTC,
        removeTodolist: removeTodolistTC,
        changeTodolistTitle: changeTodolistTitleTC,
        addTodolist: addTodolistTC,
    } = useActions(todolistsThunks)

    const { changeTodolistFilter } = useActions(todolistsAction)

    const { addTaskTC, removeTaskTC, updateTaskTC } = useActions(tasksThunks)

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return
        }
        fetchTodolistsTC()
    }, [])

    const removeTodolist = useCallback(function (id: string) {
        removeTodolistTC(id)
    }, [])

    const changeTodolistTitle = useCallback(function (id: string, title: string) {
        changeTodolistTitleTC({ id, title })
    }, [])

    const addTodolist = useCallback(
        (title: string) => {
            addTodolistTC(title)
        },
        [dispatch],
    )

    const changeFilter = useCallback(function (value: FilterValuesType, todolistId: string) {
        changeTodolistFilter({ id: todolistId, filter: value })
    }, [])

    const removeTask = useCallback(function (id: string, todolistId: string) {
        removeTaskTC({ taskId: id, todolistId })
    }, [])

    const addTask = useCallback(function (title: string, todolistId: string) {
        addTaskTC({ title, todolistId })
    }, [])

    const changeStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {
        updateTaskTC({ taskId: id, domainModel: { status }, todolistId: todolistId })
    }, [])

    const changeTaskTitle = useCallback(function (id: string, newTitle: string, todolistId: string) {
        updateTaskTC({ taskId: id, domainModel: { title: newTitle }, todolistId: todolistId })
    }, [])

    if (!isLoggedIn) {
        return <Navigate to={"/login"} />
    }

    return (
        <>
            <Grid container style={{ padding: "20px" }}>
                <AddItemForm addItem={addTodolist} />
            </Grid>
            <Grid container spacing={3}>
                {todolists.map((tl) => {
                    let allTodolistTasks = tasks[tl.id]

                    return (
                        <Grid item key={tl.id}>
                            <Paper style={{ padding: "10px" }}>
                                <Todolist
                                    todolist={tl}
                                    tasks={allTodolistTasks}
                                    removeTask={removeTask}
                                    changeFilter={changeFilter}
                                    addTask={addTask}
                                    changeTaskStatus={changeStatus}
                                    removeTodolist={removeTodolist}
                                    changeTaskTitle={changeTaskTitle}
                                    changeTodolistTitle={changeTodolistTitle}
                                    demo={demo}
                                />
                            </Paper>
                        </Grid>
                    )
                })}
            </Grid>
        </>
    )
}
