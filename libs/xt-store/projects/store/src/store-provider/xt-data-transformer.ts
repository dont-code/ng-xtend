/**
 * Enable custom transformation of data
 */
export interface XtDataTransformer<T=never> {
  /**
   * Enable transformation of data right after it has been loaded from the store
   * @param source
   */
  postLoadingTransformation (source:any[]): T[];
}
