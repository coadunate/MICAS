type IAdditionalSequences = {
    queries : IQuery[]
}

type IQuery = {
    name: string,
    file : string,
    parent: string,
    alert: false,
}

export type {
    IAdditionalSequences,
    IQuery
}
