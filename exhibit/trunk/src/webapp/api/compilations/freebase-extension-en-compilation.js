

/* compile-prolog.js */
window.Exhibit_FreebaseExtension_isCompiled=true;


/* freebase-extension.js */
(function(){var F=("Exhibit_FreebaseExtension_isCompiled" in window)&&window.Exhibit_FreebaseExtension_isCompiled;
Exhibit.FreebaseExtension={params:{bundle:false}};
var G=["freebase-importer.js","metaweb.js"];
var B=[];
var E={bundle:Boolean};
if(typeof Exhibit_FreebaseExtension_urlPrefix=="string"){Exhibit.FreebaseExtension.urlPrefix=Exhibit_FreebaseExtension_urlPrefix;
if("Exhibit_FreebaseExtension_parameters" in window){SimileAjax.parseURLParameters(Exhibit_FreebaseExtension_parameters,Exhibit.FreebaseExtension.params,E);
}}else{var D=SimileAjax.findScript(document,"/freebase-extension.js");
if(D==null){SimileAjax.Debug.exception(new Error("Failed to derive URL prefix for Simile Exhibit Freebase Extension code files"));
return ;
}Exhibit.FreebaseExtension.urlPrefix=D.substr(0,D.indexOf("freebase-extension.js"));
SimileAjax.parseURLParameters(D,Exhibit.FreebaseExtension.params,E);
}var A=[];
var C=[];
SimileAjax.prefixURLs(A,Exhibit.FreebaseExtension.urlPrefix+"scripts/",G);
SimileAjax.prefixURLs(C,Exhibit.FreebaseExtension.urlPrefix+"styles/",B);
if(!F){SimileAjax.includeJavascriptFiles(document,"",A);
SimileAjax.includeCssFiles(document,"",C);
}})();


/* freebase-extension-bundle.js */
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
Metaweb.read=function(I,J){var H="_"+Metaweb.counter++;
Metaweb[H]=function(A){var B=A.qname;
if(B.code.indexOf("/api/status/ok")!=0){var C=B.messages[0];
throw C.code+": "+C.message;
}var D=B.result;
document.body.removeChild(G);
delete Metaweb[H];
J(D);
};
envelope={qname:{query:I}};
var K=encodeURIComponent(JSON.serialize(envelope));
var L=Metaweb.HOST+Metaweb.QUERY_SERVICE+"?queries="+K+"&callback=Metaweb."+H;
var G=document.createElement("script");
G.src=L;
document.body.appendChild(G);
};


/* compile-epilog.js */
(function(){var f=null;
if("SimileWidgets_onLoad" in window){if(typeof SimileWidgets_onLoad=="string"){f=eval(SimileWidgets_onLoad);
SimileWidgets_onLoad=null;
}else{if(typeof SimileWidgets_onLoad=="function"){f=SimileWidgets_onLoad;
SimileWidgets_onLoad=null;
}}}if(f!=null){f();
}})();
