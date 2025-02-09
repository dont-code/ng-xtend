/**
 * Stores and constantly updates the json (as an instance of the DontCodeSchema) as it is being edited / modified through Change events
 * It does not store the entity values but the description of entities, screens... as defined in the Editor
 */
export declare class DontCodeModelManager {
    protected content: any;
    constructor();
    reset(): void;
    /**
     * Returns the complete json stored
     */
    getContent(): any;
    /**
     * Resets the current json content to the one given in parameter
     * @param newContent
     */
    resetContent(newContent: any): void;
    /**
     * Checks if the element can be viewed in the Builder or not
     * @param content
     */
    static isHidden(content: any): boolean;
    /**
     * Checks if the element can be edited in the Builder or not
     * @param content
     */
    static isReadonly(content: any): boolean;
}
//# sourceMappingURL=dont-code-model-manager.d.ts.map