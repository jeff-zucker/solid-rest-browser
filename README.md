# Solid REST Browser

## treat a browser's localStorage as a mini Solid server
<br>
<br>
[![NPM](https://nodei.co/npm/solid-rest-browser.png)](https://nodei.co/npm/solid-rest-browser/)

This library supports the use of the app:// scheme to create and access resources and containers stored in a browser's localStorage (and eventually indexedDB and other kinds of storage).  It supports rdflib's fetcher methods which means that using rdflib, resources in the app:// space may be addressed pretty much the same as in https:// or file:// space.   

It should work in all modern browsers, I've had success reported on firefox on linux, and chrome on android, iphone, and linux.  

See **[a live demo](https://jeff-zucker.github.io/solid-rest-browser/)**.

This is not carved in stone, but how I currently handle IRIs:

    IRI = scheme + host + path

    scheme = app://

    host = "ls" for localStorage
           "id" for indexedDB (not yet implemented)
           ... possible others

    path = levels of sub-containers starting at /

Since each origin gets its own localStorage, Solid apps can read and write to their own storage.  It is also possible to sync between the app's local storage and the user's pod with standard Solid methods.  

The root container of an app's localStorage is:

     app://ls/

There may be an arbitary number of levels of containers nested under the root.  These are not actual folders, but they should behave the way we expect a Solid container to behave.  If they don't please file an issue.

**Important** : Container names must always end in slash.

In the actual storage, the app origin will be pre-pended but the app can't see that part.

My hope is that this will become a part of solid-auth-client which would mean that resources in the app:// space could be accessed in the same way as resources in the https:// space regardless of whether through rdflib, query-ldflex, or any other library using solid-auth-client's fetch.

copyright &copy; 2019, Jeff Zucker, may be freely used with an MIT license.