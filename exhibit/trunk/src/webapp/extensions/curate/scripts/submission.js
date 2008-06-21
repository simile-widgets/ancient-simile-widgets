Exhibit.Submission = {};

Exhibit.Submission.Properties = {};

Exhibit.Submission.submitChanges = function() {
    var message = this.makeSubmissionMessage();
    var str = SimileAjax.JSON.toJSONString(message);
    
    var error = function(xhr, textStatus, errorThrown) {
        alert("Error submitting changes: " + xhr.responseText + "\nYou may try again.");
        Exhibit.Submission.enableWidgets();
    };
    
    var success = function(data) {
        view._justSubmitted = true;
        view.reset(); // trigger redraw
        getByAttr(view._div, 'ex:role', 'submit-button').attr('disabled', false);
        getByAttr(view._div, 'ex:role', 'placeholder').text(successMsg);
    };
    
    var submitLink = $('head link[rel="exhibit/submission"]').get(0);
    var params = Exhibit.extractOptionsFromElement(submitLink);
    
    delete params['rel'];
    params['message'] = str;
    
    $.ajax({
        url: this._settings.submitTo,
        dataType: 'jsonp',
        jsonp: 'callback',
        data: params, //'ss='+ ss + '&wkname=' + wkname + '&message='+str,
        success: success,
        error: error  
    });
}

Exhibit.Submission.enableWidgets = function() {
    
}

Exhibit.Submission.disableWidgets = function() {
    
}


//=============================================================================
// Submission Properties
//=============================================================================


Exhibit.SubmissionProperty = function(elmt, uiContext, settings) {
    
};

Exhibit.SubmissionProperty._settingSpecs = {
    "propertyName": { type: "text" },
    "propertyType": { type: "text", defaultValue: "normal" }
};

Exhibit.UI.generateCreationMethods(Exhibit.SubmissionProperty);
Exhibit.UI.registerComponent('submission-property', Exhibit.SubmissionProperty);


//=============================================================================
// Submission Button
//=============================================================================


Exhibit.SubmissionButton = function(elmt, uiContext, settings) {
    
}

Exhibit.SubmissionButton._settingSpecs = {
    submitTo:        { type: "text", defaultValue: "http://valinor.mit.edu/sostler/gdocbackend.cgi" },
    // spreadsheetKey:  { type: "text" },
    // worksheetName:   { type: "text", defaultValue: "submissions"},
};

Exhibit.UI.generateCreationMethods(Exhibit.SubmissionButton);
Exhibit.UI.registerComponent('submission-button', Exhibit.SubmissionButton);