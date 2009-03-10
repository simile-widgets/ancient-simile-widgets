var preview = false;

function onLoad() {
    /*
     *  Determine from formats and to formats
     */
    var fromFormats = {};
    for (var i = 0; i < Config.readers.length; i++) {
        fromFormats[Config.readers[i].format] = true;
    }
    
    var toFormats = {};
    for (var i = 0; i < Config.writers.length; i++) {
        toFormats[Config.writers[i].format] = true;
    }
    
    var fromFormatA = []
    for (n in fromFormats) {
        fromFormatA.push(n);
    }
    fromFormatA.sort(function(f1,f2) { 
        return Config.formats[f1].label.localeCompare(Config.formats[f2].label); 
    });
    
    var toFormatA = []
    for (n in toFormats) {
        toFormatA.push(n);
    }
    toFormatA.sort(function(f1,f2) { 
        return Config.formats[f1].label.localeCompare(Config.formats[f2].label); 
    });
    
    /*
     *  Build radio buttons for from formats and to formats
     */
    var createRadioDiv = function(label, name, value, tooltip, onselect) {
        var div = document.createElement("div");
        //div.className = "applicable-format";
        div.title = tooltip;
        div.innerHTML = "<input type='radio' name='" + name + "' value='" + value + "' >" + label + "</input>";
        div.firstChild.onclick = onselect;
        return div;
    };
    
    var fromFormatsDiv = document.getElementById("from-formats-div");
    for (var i = 0; i < fromFormatA.length; i++) {
        var formatName = fromFormatA[i];
        var format = Config.formats[formatName];
        var div = createRadioDiv(format.label, "from-format", formatName, format.description, onFromFormatSelect);
        
        fromFormatsDiv.appendChild(div);
    }
    
    var toFormatsDiv = document.getElementById("to-formats-div");
    for (var i = 0; i < toFormatA.length; i++) {
        var formatName = toFormatA[i];
        var format = Config.formats[formatName];
        var div = createRadioDiv(format.label, "to-format", formatName, format.description, onToFormatSelect);
        
        toFormatsDiv.appendChild(div);
    }
    
    /*
     *  Hook event handlers
     */
    document.getElementById("add-another-file-button").onclick = onAddAnotherFile;
    document.getElementById("add-another-url-button").onclick = onAddAnotherURL;
    
    document.getElementById("files-convert-form").onsubmit = onSubmitFiles;
    document.getElementById("urls-convert-form").onsubmit = onSubmitURLs;
    document.getElementById("text-convert-form").onsubmit = onSubmitText;
    
    var convertButtons = document.getElementsByName("convert-button");
    for (var i = 0; i < convertButtons.length; i++) {
        convertButtons[i].onmousedown = function() { preview = false; };
    }
    
    var previewButtons = document.getElementsByName("preview-button");
    for (var i = 0; i < previewButtons.length; i++) {
        previewButtons[i].onmousedown = function() { preview = true; };
    }
}

function onFromFormatSelect(evt) {
    evt = (evt) ? evt : ((event) ? event : null);
    if (evt == null) {
        return;
    }
    
    var radio = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
    if (radio == null) {
        return;
    }
    
    /*
     *  Build a set of semantic types that all readers capable
     *  of reading the selected format produce.
     */
    var formatName = radio.value;
    var semanticTypeSet = {};
    for (var i = 0; i < Config.readers.length; i++) {
        var reader = Config.readers[i];
        if (reader.format == formatName) {
            semanticTypeSet[reader.semanticType] = true;
        }
    }
    
    /*
     *  Build a set of all writers that can take those semantic types.
     */
    var writers = [];
    for (var i = 0; i < Config.writers.length; i++) {
        var writer = Config.writers[i];
        var writerSemanticType = writer.semanticType;
        
        checkType: for (semanticTypeName in semanticTypeSet) {
            var currentType = Config.semanticTypes[semanticTypeName];
            while (currentType != null) {
                if (currentType.name == writerSemanticType) {
                    writers.push(writer);
                    break checkType;
                }
                currentType = Config.semanticTypes[currentType.supertype];
            }
        }
    }
    
    /*
     *  Build a set of output formats those writers produce.
     */
    var toFormats = [];
    for (var i = 0; i < writers.length; i++) {
        toFormats[writers[i].format] = true;
    }
    
    /*
     *  Re-style the from-format divs
     */
    var fromFormatRadios = document.getElementsByName("from-format");
    for (var i = 0; i < fromFormatRadios.length; i++) {
        var radio2 = fromFormatRadios[i];
        radio2.parentNode.className = (radio == radio2) ? "highlight-format" : "";
    }
    
    /*
     *  Style the to-format div accordingly.
     */
    var toFormatRadios = document.getElementsByName("to-format");
    for (var i = 0; i < toFormatRadios.length; i++) {
        var radio = toFormatRadios[i];
        radio.parentNode.className = (toFormats[radio.value]) ? "highlight-format" : "";
    }
    
    configureConvertForms();
}

function onToFormatSelect(evt) {
    evt = (evt) ? evt : ((event) ? event : null);
    if (evt == null) {
        return;
    }
    
    var radio = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
    if (radio == null) {
        return;
    }
    
    /*
     *  Build a set of semantic types that all writers capable
     *  of producing the selected format produce.
     */
    var formatName = radio.value;
    var semanticTypeSet = {};
    for (var i = 0; i < Config.writers.length; i++) {
        var writer = Config.writers[i];
        if (writer.format == formatName) {
            semanticTypeSet[writer.semanticType] = true;
        }
    }
    
    /*
     *  Build a set of all readers that can produce those semantic types.
     */
    var readers = [];
    for (var i = 0; i < Config.readers.length; i++) {
        var reader = Config.readers[i];
        var readerSemanticType = reader.semanticType;
        
        checkType: for (semanticTypeName in semanticTypeSet) {
            var currentType = Config.semanticTypes[readerSemanticType];
            while (currentType != null) {
                if (currentType.name == semanticTypeName) {
                    readers.push(reader);
                    break checkType;
                }
                currentType = Config.semanticTypes[currentType.supertype];
            }
        }
    }
    
    /*
     *  Build a set of input formats those readers read.
     */
    var fromFormats = {};
    for (var i = 0; i < readers.length; i++) {
        fromFormats[readers[i].format] = true;
    }
    
    /*
     *  Re-style the to-format divs
     */
    var toFormatRadios = document.getElementsByName("to-format");
    for (var i = 0; i < toFormatRadios.length; i++) {
        var radio2 = toFormatRadios[i];
        radio2.parentNode.className = (radio == radio2) ? "highlight-format" : "";
    }
    
    /*
     *  Style the from-format div accordingly.
     */
    var fromFormatRadios = document.getElementsByName("from-format");
    for (var i = 0; i < fromFormatRadios.length; i++) {
        var radio = fromFormatRadios[i];
        radio.parentNode.className = (fromFormats[radio.value]) ? "highlight-format" : "";
    }
    
    configureConvertForms();
}

function onConvertChoiceClick(choice) {
    var formFiles = document.getElementById("files-convert-form");
    var formURLs = document.getElementById("urls-convert-form");
    var formText = document.getElementById("text-convert-form");
    
    switch (choice) {
    case "files":
        formFiles.style.display = "block";
        formURLs.style.display = "none";
        formText.style.display = "none";
        break;
    case "urls":
        formFiles.style.display = "none";
        formURLs.style.display = "block";
        formText.style.display = "none";
        break;
    case "text":
        formFiles.style.display = "none";
        formURLs.style.display = "none";
        formText.style.display = "block";
        break;
    }
}

function onAddAnotherFile(evt) {
    evt = (evt) ? evt : ((event) ? event : null);
    if (evt == null) {
        return;
    }
    
    var div = document.createElement("div");
    div.innerHTML = '<input type="file" name="file" size="50" />';
    
    var button = document.getElementById("add-another-file-button");
    button.parentNode.parentNode.insertBefore(div, button.parentNode);
    div.firstChild.focus();
    
    evt.stopPropagation();
    return false;
}

function onAddAnotherURL(evt) {
    evt = (evt) ? evt : ((event) ? event : null);
    if (evt == null) {
        return;
    }
    
    var div = document.createElement("div");
    div.innerHTML = '<input type="text" name="url" size="63" />';
    
    var button = document.getElementById("add-another-url-button");
    button.parentNode.parentNode.insertBefore(div, button.parentNode);
    div.firstChild.focus();
    
    evt.stopPropagation();
    return false;
}
    
function onSubmitFiles(evt) {
    prepareFormForSubmit("files-convert-form");
}

function onSubmitURLs(evt) {
    prepareFormForSubmit("urls-convert-form");
}

function onSubmitText(evt) {
    prepareFormForSubmit("text-convert-form");
}

function prepareFormForSubmit(formName) {
    var rw = pickReaderWriter(preview);
    if (rw.reader == null || rw.writer == null) {
        alert("Sorry, we cannot convert between those formats.");
        evt.stopPropagation();
        return false;
    }
    
    var params = [
        "reader=" + encodeURIComponent(rw.reader.name),
        "writer=" + encodeURIComponent(rw.writer.name),
        "mimetype=" + encodeURIComponent(getRadioValue("mimetype-choice"))
    ];
    var servlet = "translator";
    
    if ("previewTemplate" in rw.writer && preview) {
        params.push("template=" + encodeURIComponent(rw.writer.previewTemplate));
        servlet = "preview";
    }
    
    var form = document.getElementById(formName);
    form.action = servlet + "?" + params.join("&");
}

function configureConvertForms() {
    var noConversionMessage = document.getElementById("no-conversion-message");
    var severalSemanticsMessage = document.getElementById("several-semantics-message");
    var convertFormsDiv = document.getElementById("convert-forms");
    var semanticTypesForm = document.getElementById("semantic-types-form");
    semanticTypesForm.innerHTML = "";
    
    var fromFormatName = getRadioValue("from-format");
    var toFormatName = getRadioValue("to-format");
    
    if (fromFormatName == null || toFormatName == null) {
        noConversionMessage.style.display = "block";
        severalSemanticsMessage.style.display = "none";
        convertFormsDiv.style.display = "none";
        return;
    }
    
    var conversionSemanticTypes = getConversionSemanticTypes(fromFormatName, toFormatName);
    
    if (conversionSemanticTypes.length == 0) {
        noConversionMessage.style.display = "block";
        severalSemanticsMessage.style.display = "none";
        convertFormsDiv.style.display = "none";
    } else {
        var previewable = function(conversion) {
            var writers = conversion.writers;
            var previewable = false;
            for (var i = 0; i < writers.length; i++) {
                if ("previewTemplate" in writers[i]) {
                    previewable = true;
                    break;
                }
            }
            return previewable;
        };
        
        if (conversionSemanticTypes.length == 1) {
            noConversionMessage.style.display = "none";
            severalSemanticsMessage.style.display = "none";
            convertFormsDiv.style.display = "block";
        } else {
            noConversionMessage.style.display = "none";
            severalSemanticsMessage.style.display = "block";
            convertFormsDiv.style.display = "block";
            
            for (var i = 0; i < conversionSemanticTypes.length; i++) {
                var conversion = conversionSemanticTypes[i];
                var semanticType = Config.semanticTypes[conversion.semanticType];
                
                var div = document.createElement("div");
                div.title = semanticType.description;
                div.innerHTML = "<input type='radio'" +
                    " name='semantic-type'" +
                    " value='" + conversion.semanticType + "'" +
                    " onclick='setPreviewable(" + previewable(conversion) + ")'>" + 
                    semanticType.label + 
                    "</input>";
                div.firstChild.checked = (i == 0);
                    
                semanticTypesForm.appendChild(div);
            }
        }
        
        setPreviewable(previewable(conversionSemanticTypes[0]));
    }
}

function setPreviewable(previewable) {
    var previewButtons = document.getElementsByName("preview-button");
    for (var i = 0; i < previewButtons.length; i++) {
        previewButtons[i].style.display = previewable ? "inline" : "none";
    }
    document.getElementById("preview-message").style.display = previewable ? "block" : "none";
}

function pickReaderWriter(preview) {
    var fromFormatName = getRadioValue("from-format");
    var toFormatName = getRadioValue("to-format");
    
    var result = { 
        reader:     null, 
        writer:     null
    };
    
    if (fromFormatName != null && toFormatName != null) {
        var conversionSemanticTypes = getConversionSemanticTypes(fromFormatName, toFormatName);
        var conversion = null;
        if (conversionSemanticTypes.length == 1) {
            conversion = conversionSemanticTypes[0];
            result.reader = conversion.readers[0];
            result.writer = conversion.writers[0];
        } else if (conversionSemanticTypes.length > 1) {
            var semanticType = getRadioValue("semantic-type");
            
            for (var i = 0; i < conversionSemanticTypes.length; i++) {
                if (conversionSemanticTypes[i].semanticType == semanticType) {
                    conversion = conversionSemanticTypes[i];
                    break;
                }
            }
        }
        
        if (conversion != null) {
            result.reader = conversion.readers[0]; 
            if (preview) {
                for (var i = 0; i < conversion.writers.length; i++) {
                    if ("previewTemplate" in conversion.writers[i]) {
                        result.writer = conversion.writers[i];
                        break;
                    }
                }
            } else {
                result.writer = conversion.writers[0];
            }
        }
    }
    return result;
}

function getConversionSemanticTypes(fromFormatName, toFormatName) {
    var semanticTypeMap = {};
    
    for (var i = 0; i < Config.readers.length; i++) {
        var reader = Config.readers[i];
        if (reader.format == fromFormatName) {
            var semanticType = Config.semanticTypes[reader.semanticType];
            while (semanticType != null) {
                var record;
                if (semanticType.name in semanticTypeMap) {
                    record = semanticTypeMap[semanticType.name];
                } else {
                    record = { 
                        semanticType: semanticType.name, 
                        readers: [], 
                        writers: [] 
                    };
                    semanticTypeMap[semanticType.name] = record;
                }
                record.readers.push(reader);
                
                semanticType = Config.semanticTypes[semanticType.supertype];
            }
        }
    }
    
    for (semanticTypeName in semanticTypeMap) {
        var record = semanticTypeMap[semanticTypeName];
        
        for (var i = 0; i < Config.writers.length; i++) {
            var writer = Config.writers[i];
            if (writer.format == toFormatName && writer.semanticType == semanticTypeName) {
                record.writers.push(writer);
            }
        }
    }
    
    /*
     *  Eliminate semantic type for which we have sub semantic type.
     */
    if (true) {
        for (semanticTypeName in semanticTypeMap) {
            var record = semanticTypeMap[semanticTypeName];
            if (record.writers.length > 0) {
                var semanticType = Config.semanticTypes[semanticTypeName];
                delete semanticTypeMap[semanticType.supertype];
            }
        }
    }
    
    /*
     *  Return all conversions that we have some writers for.
     */
    var results = [];
    for (semanticTypeName in semanticTypeMap) {
        var record = semanticTypeMap[semanticTypeName];
        if (record.writers.length > 0) {
            results.push(record);
        }
    }
    
    return results;
}

function getRadioValue(name) {
    var value = null;
    var radios = document.getElementsByName(name);
    for (var i = 0; i < radios.length; i++) {
        var radio = radios[i];
        if (radio.checked) {
            value = radio.value;
            break;
        }
    }
    return value;
}
