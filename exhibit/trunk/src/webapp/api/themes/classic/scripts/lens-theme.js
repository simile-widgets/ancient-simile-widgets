/*==================================================
 *  Exhibit.Lens classic theme
 *==================================================
 */
 
Exhibit.Lens.theme = {
    createEditButton: function(label) {
        var button = document.createElement("button");
        button.className = "exhibit-lens-editButton";
        button.innerHTML = label != null ? label : Exhibit.Lens.l10n.editButtonLabel;
        return button;
    },
    createSaveButton: function(label) {
        var button = document.createElement("button");
        button.className = "exhibit-lens-saveButton";
        button.innerHTML = label != null ? label : Exhibit.Lens.l10n.saveButtonLabel;
        return button;
    }
}