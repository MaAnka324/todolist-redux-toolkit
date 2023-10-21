import { ResponseType } from "api/todolists-api"
import { Dispatch } from "redux"
import { appActions } from "app/app-reducer"

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
    let errorMessage = "Some error occurred"
    if (data.messages.length) {
        //dispatch(setAppErrorAC(data.messages[0]))
        dispatch(appActions.setAppError({ error: data.messages[0] }))
    } else {
        //dispatch(setAppErrorAC("Some error occurred"))
        dispatch(appActions.setAppError({ error: errorMessage }))
    }
    // dispatch(appActions.setAppError({ error: errorMessage }))
    dispatch(appActions.setAppStatus({ status: "failed" }))
}