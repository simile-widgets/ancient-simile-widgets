Exhibit.Submission = {};

// Submission Properties are user-defined properties that apply to all
// submitted changes -- e.g. the submitter's email address.
Exhibit.Submission.Properties = {};

// Called when a submission property overlaps with an item's property. 
Exhibit.Submission.handleNamingConflict = function(uiContext, item, prop) {
    SimileAjax.Debug.warn('error for item ' + item.id + ': item property ' + prop 
        + ' conflicts with submission property.');
    throw "naming conflict for " + item.id + ' -- ' + prop;
}

Exhibit.Submission.formatChangesForSubmission = function(uiContext) {
    return uiContext.getDatabase().collectChanges().map(function(change) {
        var item = { id: change.id, changeType: change.changeType }
        
        SimileAjax.jQuery.each(change.vals || {}, function(prop, val) {
            item[prop] = val.newVal;
        });
        
        SimileAjax.jQuery.each(Exhibit.Submission.Properties, function(prop, val) {
            if (prop in item) {
                Exhibit.Submission.handleNamingConflict(uiContext, item, prop);
            } else {
                item[prop] = val;
            }
        });

        return item;
    });
}

Exhibit.Submission.getSubmissionLinkOptions = function(link) {
    
}

Exhibit.Submission.submitChanges = function(uiContext, settings) {
    var changes = Exhibit.Submission.formatChangesForSubmission(uiContext);

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

Exhibit.Submission.submissionWidgets = ['submission-property', 'submission-button'];

Exhibit.Submission.enableWidgets = function() {
    Exhibit.UI.findAttribute('ex:role', Exhibit.Submission.submissionWidgets)
        .attr('disabled', false);
}

Exhibit.Submission.disableWidgets = function() {
    Exhibit.UI.findAttribute('ex:role', Exhibit.Submission.submissionWidgets)
        .attr('disabled', true);
}


//=============================================================================
// Submission Properties
//=============================================================================


Exhibit.SubmissionProperty = function(elmt, uiContext, settings) {
    if (!settings.propertyName) {
        SimileAjax.Debug.warn("No propertyName given for SubmissionProperty");
    } else if (settings.propertyType == 'timestamp') {
        Exhibit.Submission.Properties[settings.propertyName] = new Date().toString();
    } else {
        SimileAjax.jQuery(elmt).change(function(){
            Exhibit.Submission.Properties[settings.propertyName] = elmt.value;
        });
    }
};

Exhibit.SubmissionProperty._settingSpecs = {
    propertyName: { type: "text" },
    propertyType: { type: "text", defaultValue: "normal" }
};

Exhibit.UI.generateCreationMethods(Exhibit.SubmissionProperty);
Exhibit.UI.registerComponent('submission-property', Exhibit.SubmissionProperty);


//=============================================================================
// Submission Button
//=============================================================================


Exhibit.SubmissionButton = function(elmt, uiContext, settings) {
    var f = function() { Exhibit.Submission.submitChanges(uiContext, settings) };
    SimileAjax.jQuery(elmt).click(f);
}

Exhibit.SubmissionButton._settingSpecs = {
    submitTo:        { type: "text", defaultValue: "http://valinor.mit.edu/sostler/gdocbackend.cgi" }
    // spreadsheetKey:  { type: "text" },
    // worksheetName:   { type: "text", defaultValue: "submissions"},
};

Exhibit.UI.generateCreationMethods(Exhibit.SubmissionButton);
Exhibit.UI.registerComponent('submission-button', Exhibit.SubmissionButton);