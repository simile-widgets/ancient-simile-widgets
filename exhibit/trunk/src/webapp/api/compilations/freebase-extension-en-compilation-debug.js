

/* compile-prolog.js */
window.Exhibit_FreebaseExtension_isCompiled=true;


/* freebase-extension.js */
(function(){var isCompiled=("Exhibit_FreebaseExtension_isCompiled" in window)&&window.Exhibit_FreebaseExtension_isCompiled;
Exhibit.FreebaseExtension={params:{bundle:false}};
var javascriptFiles=["freebase-importer.js","metaweb.js"];
var cssFiles=[];
var paramTypes={bundle:Boolean};
if(typeof Exhibit_FreebaseExtension_urlPrefix=="string"){Exhibit.FreebaseExtension.urlPrefix=Exhibit_FreebaseExtension_urlPrefix;
if("Exhibit_FreebaseExtension_parameters" in window){SimileAjax.parseURLParameters(Exhibit_FreebaseExtension_parameters,Exhibit.FreebaseExtension.params,paramTypes);
}}else{var url=SimileAjax.findScript(document,"/freebase-extension.js");
if(url==null){SimileAjax.Debug.exception(new Error("Failed to derive URL prefix for Simile Exhibit Freebase Extension code files"));
return ;
}Exhibit.FreebaseExtension.urlPrefix=url.substr(0,url.indexOf("freebase-extension.js"));
SimileAjax.parseURLParameters(url,Exhibit.FreebaseExtension.params,paramTypes);
}var scriptURLs=[];
var cssURLs=[];
SimileAjax.prefixURLs(scriptURLs,Exhibit.FreebaseExtension.urlPrefix+"scripts/",javascriptFiles);
SimileAjax.prefixURLs(cssURLs,Exhibit.FreebaseExtension.urlPrefix+"styles/",cssFiles);
if(!isCompiled){SimileAjax.includeJavascriptFiles(document,"",scriptURLs);
SimileAjax.includeCssFiles(document,"",cssURLs);
}})();


/* freebase-extension-bundle-debug.js */
Exhibit.FreebaseImporter={};
Exhibit.importers["application/freebase"]=Exhibit.FreebaseImporter;
(function(){var $=SimileAjax.jQuery;
var parseQuery=function(link){return eval($(link).attr("ex:query"));
};
function rename(item,oldAttr,newAttr){if(item&&item[oldAttr]){item[newAttr]=item[oldAttr];
delete item[oldAttr];
}}var imageURLPrefix="http://www.freebase.com/api/trans/raw";
var imageType="/common/topic/image";
function extractImage(item,attr){var image=item[imageType];
if(image&&image.id){item[attr]=imageURLPrefix+image.id;
}delete item[imageType];
}var defaultResponseTransformer=function(response){return response.map(function(item){extractImage(item,"image");
rename(item,"name","label");
item.type="item";
return item;
});
};
var parseTransformer=function(link){var transformer=$(link).attr("ex:transformer");
return transformer?eval(transformer):defaultResponseTransformer;
};
var makeResponseHandler=function(database,respTransformer,cont){return function(resp){try{Exhibit.UI.hideBusyIndicator();
var processedResponse=respTransformer(resp);
var baseURL=Exhibit.Persistence.getBaseURL("freebase");
var data={"items":processedResponse};
database.loadData(data,baseURL);
}catch(e){SimileAjax.Debug.exception(e);
}finally{if(cont){cont();
}}};
};
Exhibit.FreebaseImporter.load=function(link,database,cont){var query=parseQuery(link);
var respTransformer=parseTransformer(link);
try{Exhibit.UI.showBusyIndicator();
var handler=makeResponseHandler(database,respTransformer,cont);
Metaweb.read(query,handler);
}catch(e){SimileAjax.Debug.exception(e);
if(cont){cont();
}}};
})();
var JSON=SimileAjax.JSON;
JSON.serialize=JSON.toJSONString;
Metaweb={};
Metaweb.HOST="http://www.freebase.com";
Metaweb.QUERY_SERVICE="/api/service/mqlread";
Metaweb.counter=0;
Metaweb.read=function(q,f){var callbackName="_"+Metaweb.counter++;
Metaweb[callbackName]=function(outerEnvelope){var innerEnvelope=outerEnvelope.qname;
if(innerEnvelope.code.indexOf("/api/status/ok")!=0){var error=innerEnvelope.messages[0];
throw error.code+": "+error.message;
}var result=innerEnvelope.result;
document.body.removeChild(script);
delete Metaweb[callbackName];
f(result);
};
envelope={qname:{query:q}};
var querytext=encodeURIComponent(JSON.serialize(envelope));
var url=Metaweb.HOST+Metaweb.QUERY_SERVICE+"?queries="+querytext+"&callback=Metaweb."+callbackName;
var script=document.createElement("script");
script.src=url;
document.body.appendChild(script);
};


/* compile-epilog.js */
(function(){var f=null;
if("SimileWidgets_onLoad" in window){if(typeof SimileWidgets_onLoad=="string"){f=eval(SimileWidgets_onLoad);
SimileWidgets_onLoad=null;
}else{if(typeof SimileWidgets_onLoad=="function"){f=SimileWidgets_onLoad;
SimileWidgets_onLoad=null;
}}}if(f!=null){f();
}})();
