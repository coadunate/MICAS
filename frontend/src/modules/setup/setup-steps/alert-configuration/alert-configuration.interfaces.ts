type IAlertConfig = {
    phone : string,
    email : string,
    alert_sequence_threshold : number,
    alert_status : "yes" | "no"
}

export type {
    IAlertConfig
}
