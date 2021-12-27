type IAdditionalSequences = {
    queries : IQuery[]
}

type IQuery = {
    name: string,
    file : string,
    threshold: string,
    current_value: number
    alert: false,
}

export type {
    IAdditionalSequences,
    IQuery
}
