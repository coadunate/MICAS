import {FunctionComponent} from "react";

type ISetupComponentProps = {
    advanceStep: () => void,
    update: () => void,

}

type ISteps = {
    name: string,
    component: FunctionComponent<ISetupComponentProps>
}

export type {
    ISetupComponentProps,
    ISteps
}

