type IAdditionalSequences = {
    queries : IQuery[]
}

type IQuery = {
    name: string,
    file : string,
    threshold: string,
    alert: false,
}

export type {
    IAdditionalSequences,
    IQuery
}
