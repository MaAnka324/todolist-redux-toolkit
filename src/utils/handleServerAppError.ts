import { Dispatch } from "redux"
import { appActions } from "app/app-reducer"
import { BaseResponseType } from "api/base-api"

export const handleServerAppError = <D>(data: BaseResponseType<D>, dispatch: Dispatch) => {
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
