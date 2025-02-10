/**
 * Stores and constantly updates the json (as an instance of the DontCodeSchema) as it is being edited / modified through Change events
 * It does not store the entity values but the description of entities, screens... as defined in the Editor
 */
export class DontCodeModelManager {
  protected content: any;

  constructor(/*protected schemaMgr: DontCodeSchemaManager*/) {
    this.reset();
  }

  reset() {
    this.content = undefined;
  }

  /**
   * Returns the complete json stored
   */
  getContent(): any {
    return this.content;
  }

  /**
   * Resets the current json content to the one given in parameter
   * @param newContent
   */
  resetContent(newContent: any) {
    this.content = newContent;
  }

  /**
   * Checks if the element can be viewed in the Builder or not
   * @param content
   */
  static isHidden(content: any): boolean {
    return content?.$hidden == true;
  }

  /**
   * Checks if the element can be edited in the Builder or not
   * @param content
   */
  static isReadonly(content: any): boolean {
    return content?.$readOnly == true;
  }

}
