"use strict";

(function() {
  var root = this
/*
  RESPONSE HANDLERS
*/
const _statusText = {
    200 : "Ok",
    201 : "Created",
    404 : "Not Found",
    405 : "Method Not Supported",
    409 : "Conflict",
    500 : "Internal Server Error"
}
function _response (status, body, headers) {
  return {
    status: status,
    ok: status >= 200 && status <= 299,
    statusText: _statusText[status],
    headers: new Headers(headers),
    body: body,
    text: text.bind(null, body),
    json: json.bind(null, body)
  }
}

/*
  REQUEST HANDLER
*/
let appfetch = async function appfetch (iri, options) {

  options = options || {}
  options.method = (options.method || options.Method || 'GET').toUpperCase()

  let pathname = decodeURIComponent(iri);
  let hostname = pathname.replace(/^app:\/\/\//,'').replace(/\/.*/,'');

  if(!pathname.match(/^app:\/\/ls/)){
      console.log("Malformed URL : does not begin with app://ls");
      return Promise.resolve( _response(500) );
  }
  if(!pathname.match(/^app:\/\/ls\//)){
      console.log("Malformed URL : path does not begin with /");
      return Promise.resolve( _response(500) );
  }

  const objectType = await _getObjectType(pathname);

  if( options.method==="GET" && objectType==="Container"){
      return await  _getContainer(pathname) ;
  }
  if( options.method==="DELETE" && objectType==="Container" ){
      return await _deleteResource(pathname) ;
  }
  if( options.method==="POST"){
      if( objectType==="notFound" ) return Promise.resolve(_response(404));
      pathname = pathname + options.headers.Slug;

      return await _putResource(pathname) ;
/*
      if( options.headers.Link && options.headers.Link.match("Container") ) {
          return Promise.resolve( _response( await postContainer(pathname) ) );
      }
      else if(options.headers.Link && options.headers.Link.match("Resource")){
          options.method = "POST-RESOURCE"
      }
*/
  }
  if (options.method === 'GET') {
      if( objectType==="notFound" ) {
          return Promise.resolve(_response(404,""))
      }
      else {
          return await _getResource(pathname,options);
      }
  }
  else if (options.method === 'DELETE' ) {
      if( objectType==="notFound" ) {
          return Promise.resolve(_response(404))
      }
      else {
              return await _deleteResource(pathname)
      }
  }
  else if (options.method === 'PUT' || options.method === "POST-RESOURCE" ) {
      if(options.method==='PUT'){
//          await _makeContainers(pathname); /* MAKE CONTAINERS */
      }
      return await _putResource( pathname, options ); /* PUT RESOURCE */
  }
  else {
      return Promise.resolve( _response(405) )   /* UNKNOWN METHOD */
  }
}

/*
  STREAM HANDLERS
*/
function text (stream) {
  return new Promise((resolve, reject) => {
    resolve(stream)
  },e=>{reject(e)})
}
function json (stream) {
    return Promise.resolve( JSON.parse(stream) );
}

/*
  RESOURCE HANDLERS
*/
async function _getObjectType(fn){
    let body = localStorage.getItem( fn );
    if(body&&body.length) {
        return (body.match(/\/$/)) ? "Container" : "Resource";
    }
    else if(fn.match(/\/$/)) return "Container"
    else return "notFound";
}
async function _getResource(pathname,options){
        try { 
            let body = localStorage.getItem( pathname );
            return Promise.resolve( _response(
                200,
                body,
                {"Content-Type":"text/turtle"},
            ))
        }
        catch(e){ Promise.resolve( _response(500) ) }
}
function _putResource(pathname,options){
    options = options || {};
    options.body = options.body || "";
    return new Promise((resolve) => {
        try { 
            localStorage.setItem( pathname, options.body );
            resolve( _response(201,undefined,{'location': pathname}) )
        }
        catch(e){ console.log(e); resolve( _response(500) ) }
    })
}
function _deleteResource(fn){
    return new Promise(function(resolve) {
        try {
            localStorage.removeItem(fn);
            resolve(_response(200))
        }
        catch(e){
            resolve( _response(409) );
        }    
    });
}

/* 
  CONTAINER HANDLERS
*/
async function _getContainer(pathname){
        let filenames = Object.keys(localStorage).filter( (k)=>{ 
            if(k.startsWith(pathname)){return k} 
        });
        let str2 = "";
        let str = `@prefix ldp: <http://www.w3.org/ns/ldp#>.
<> a ldp:BasicContainer, ldp:Container` // eos
        if(filenames.length){
            str = str + "; ldp:contains\n";
            for(var i=0;i<filenames.length;i++){
                let fn = filenames[i];
                let ftype = await _getObjectType(fn);
                ftype = (ftype==="Container") ? "BasicContainer; a ldp:Container": ftype
                str = str + `<${fn}>,\n`
                str2=str2+`<${fn}> a ldp:${ftype}.\n`
            }
            str = str.replace(/,\n$/,"")
        }
        str = str+`.\n`+str2;
        return ( Promise.resolve(_response(
            200,
            str,
            {'Content-Type':'text/turtle'}
        )))
}

  if( typeof exports != 'undefined' ) {
    if( typeof module != 'undefined' && module.exports ) {
      exports = module.exports = appfetch
    }
    else exports.appfetch = appfetch
  } 
  else {
    root.appfetch = appfetch // creates window.appfetch
    return root  // consumed by requrie
  }

}).call(this)
