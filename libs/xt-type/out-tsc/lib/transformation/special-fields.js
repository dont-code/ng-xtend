export class SpecialFields {
    dateFields = null;
    idField = null;
    addDateField(name) {
        if (this.dateFields == null) {
            this.dateFields = new Array();
        }
        this.dateFields.push(name);
    }
}
//# sourceMappingURL=special-fields.js.map