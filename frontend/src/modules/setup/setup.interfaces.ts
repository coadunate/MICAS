import React, {FunctionComponent} from "react";
import {IDatabseSetupInput} from './setup-steps/database-setup/database-setup.interfaces'
import {IAlertConfig} from "./setup-steps/database-setup/alert-configuration/alert-configuration.interfaces";

type IAlertConfigSetupProps = {
    advanceStep: () => void,
    update: React.Dispatch<React.SetStateAction<IAlertConfig>>,
}

type IDatabaseSetupProps = {
    advanceStep: () => void,
    update: React.Dispatch<React.SetStateAction<IDatabseSetupInput>>,

}

type ISteps = {
    name: string,
    component: React.ReactElement<IDatabaseSetupProps> | React.ReactElement<IAlertConfigSetupProps>
}

export type {
    IDatabaseSetupProps,
    IAlertConfigSetupProps,
    ISteps
}

