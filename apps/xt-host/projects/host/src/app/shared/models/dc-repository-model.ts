export type DcRepositoryModel = {
  name:string,
  description?: string,
  storeApiUrl?: string,
  projectApiUrl?: string,
  documentApiUrl?: string,
  plugins?: Array<DcPluginModel>
}

export type DcPluginModel= {
  id: string,
  "display-name": string,
  version?: string,
  info: {
    "remote-entry": string
  },
  "config": {}
}
