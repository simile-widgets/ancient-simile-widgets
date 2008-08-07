Exhibit.SubmissionBackend = {};

Exhibit.SubmissionBackend.formatChanges = function(itemChanges, submissionProperties, nameCollisionHandler) {
    return itemChanges.map(function(change) {
        var item = { id: change.id, label: change.label || change.id };
        
        SimileAjax.jQuery.each(change.vals || {}, function(prop, val) {
            item[prop] = val.newVal;
        });
        
        SimileAjax.jQuery.each(submissionProperties, function(prop, val) {
            if (prop in item) {
                if (nameCollisionHandler) {
                    nameCollisionHandler(item, prop, val);
                } else {
                    throw "Collision between change property and submission property "
                        + prop + ": " + item[prop] + ", " + val;
                }
            } else {
                item[prop] = val;
            }
        });

        return item;
    });
};

Exhibit.SubmissionBackend.SubmissionDefaults = {
    'gdoc': {
        'url': 'http://valinor.mit.edu/sostler/gdocbackend.cgi',
    }
};

Exhibit.SubmissionBackend.getOutputOptions = function() {
    var links = $('head link[rel="exhibit/output"]');
    if (links.length == 0) {
        throw "No output link provided";
    } else if (links.length > 1) {
        SimileAjax.Debug.warn('Multiple output links provided; ignoring all but the first');
    }

    var opts = { url: null, data: {}};
    
    opts.url = links.attr('ex:url') || Exhibit.SubmissionBackend.SubmissionDefaults.gdoc.url;
    
    
    if (links.attr('ex:spreadsheetKey')) {
        opts.data.spreadsheetkey = links.attr('ex:spreadsheetKey');        
    }
    
    if (links.attr('ex:worksheetIndex')) {
        opts.data.worksheetindex = links.attr('ex:worksheetIndex');        
    }

    if (links.attr('ex:worksheetName')) {
        opts.data.worksheetname = links.attr('ex:worksheetName');
    }
        
    return opts;
};

Exhibit.SubmissionBackend.googleAuthSuccessWrapper = function(fSuccess) {
    return function(resp) {
        SimileAjax.Debug.log('wrapped');
        SimileAjax.Debug.log(resp);
        if (resp.session) {
            Exhibit.Authentication.GoogleSessionToken = resp.session;
        }
        fSuccess(resp);
    };
}

Exhibit.SubmissionBackend.submitChanges = function(changes, fSuccess, fError) {
    var options = Exhibit.SubmissionBackend.getOutputOptions();
    options.data.json = SimileAjax.JSON.toJSONString(changes);
    
    // if authentication is enabled, authentication token must be provided.
    if (Exhibit.Authentication.Enabled) {
        if (Exhibit.Authentication.GoogleSessionToken) {
            options.data.session = Exhibit.Authentication.GoogleSessionToken;
        } else if (Exhibit.Authentication.GoogleToken) {
            options.data.token = Exhibit.Authentication.GoogleToken;
            fSuccess = Exhibit.SubmissionBackend.googleAuthSuccessWrapper(fSuccess);
        } else {
            SimileAjax.Debug.warn('Authentication is enabled, but no tokens are present');
        }
    }
    
    $.ajax({
        url: options.url,
        data: options.data,
        dataType: 'jsonp',
        jsonp: 'callback',
        success: fSuccess,
        error: fError
    });
}