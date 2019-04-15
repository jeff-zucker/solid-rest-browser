/*
  RESPONSE HANDLERS
*/
const statusText = {
    200 : "Ok",
    201 : "Created",
    404 : "Not Found",
    405 : "Method Not Supported",
    409 : "Conflict",
    500 : "Internal Server Error"
}
function response (status, body, headers) {
  return {
    status: status,
    ok: status >= 200 && status <= 299,
    statusText: statusText[status],
    headers: new Headers(headers),
    body: body,
    text: text.bind(null, body),
    json: json.bind(null, body)
  }
}

/*
  REQUEST HANDLER
*/
async function appfetch (iri, options) {
  options = options || {}
  options.method = (options.method || options.Method || 'GET').toUpperCase()

  let pathname = decodeURIComponent(iri);
  let hostname = pathname.replace(/^app:\/\/\//,'').replace(/\/.*/,'');


  if(!pathname.match(/^app:\/\/ls/)){
      console.log("Malformed IRI : does not begin with app://ls");
      return Promise.resolve( response(500) );
  }
  if(!pathname.match(/^app:\/\/ls\//)){
      console.log("Malformed IRI : path does not begin with /");
      return Promise.resolve( response(500) );
  }

  const objectType = await _getObjectType(pathname);

  if( options.method==="GET" && objectType==="Container"){
      return await  _getContainer(pathname) ;
  }
  if( options.method==="DELETE" && objectType==="Container" ){
      return await _deleteResource(pathname) ;
  }
  if( options.method==="POST"){
      if( objectType==="notFound" ) return Promise.resolve(response(404));
      pathname = pathname + options.headers.Slug;

      return await _putResource(pathname) ;
/*
      if( options.headers.Link && options.headers.Link.match("Container") ) {
          return Promise.resolve( response( await postContainer(pathname) ) );
      }
      else if(options.headers.Link && options.headers.Link.match("Resource")){
          options.method = "POST-RESOURCE"
      }
*/
  }
  if (options.method === 'GET') {
      if( objectType==="notFound" ) {
          return Promise.resolve(response(404,""))
      }
      else {
          return await _getResource(pathname,options);
      }
  }
  else if (options.method === 'DELETE' ) {
      if( objectType==="notFound" ) {
          return Promise.resolve(response(404))
      }
      else {
          return new Promise((resolve) => {
              _deleteResource(pathname).then( statusCode => { 
                  return resolve( response(statusCode) )
              })
          });
      }
  }
  else if (options.method === 'PUT' || options.method === "POST-RESOURCE" ) {
      if(options.method==='PUT'){
//          await _makeContainers(pathname); /* MAKE CONTAINERS */
      }
      return await _putResource( pathname, options ); /* PUT RESOURCE */
  }
  else {
      return Promise.resolve( response(405) )   /* UNKNOWN METHOD */
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
            return Promise.resolve( response(
                200,
                body,
                {"Content-Type":"text/turtle"},
            ))
        }
        catch(e){ Promise.resolve( response(500) ) }
}
function _putResource(pathname,options){
    options = options || {};
    options.body = options.body || "";
    return new Promise((resolve) => {
        try { 
            localStorage.setItem( pathname, options.body );
            resolve( response(201,undefined,{'location': pathname}) )
        }
        catch(e){ console.log(e); resolve( response(500) ) }
    })
}
function _deleteResource(fn){
    return new Promise(function(resolve) {
        try {
            localStorage.removeItem(fn);
            resolve(response(200))
        }
        catch(e){
            resolve( response(409) );
        }    
    });
}

/* 
  CONTAINER HANDLERS
*/
function _deleteContainer(fn){
    return new Promise(function(resolve) {
        fs.rmdir( fn, function(err) {
            if(err) {
                resolve( 409 );
            } else {
                resolve( 200 );
            }
        });
    });
}
function postContainer(fn,recursive){
    fn = fn.replace(/\/$/,'');
    return new Promise(function(resolve) {
        let opts = (recursive) ? {"recursive":true} : {}
        fs.mkdir( fn, opts, (err) => {
            if(err) {
                resolve( 409 )
            } 
            else {
                resolve( 201 );
            }
        });
    });
}
async function _makeContainers(pathname){
      let filename = path.basename(pathname);
      let reg = new RegExp(filename+"\$")
      let foldername = pathname.replace(reg,'');
      let exists = await _getObjectType(foldername);
      if(exists==="notFound"){
          let fresults = await postContainer(foldername,"recursive");
          if(!fresults===201) Promise.resolve( response(500) ); 
       }
}
function _getContainer(pathname){
    let filenames = Object.keys(localStorage).filter( (k)=>{ 
        if(k.startsWith(pathname)){return k} 
    });
    return new Promise(function(resolve) {
            let str = `@prefix ldp: <http://www.w3.org/ns/ldp#>.

<>
    a ldp:BasicContainer, ldp:Container
` // eos
            if(filenames.length){
                str = str + "; ldp:contains\n";
                filenames.forEach(function(filename) {
                    if(filename!=pathname)
                        str = str + `<${filename}>,`
                });
                str = str.replace(/,$/,"");
            }
            str = str+".";
            return ( resolve(response(
                200,
                str,
                {'Content-Type':'text/turtle'}
            )))
//        });
    });
}

