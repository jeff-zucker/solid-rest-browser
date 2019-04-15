# Solid REST Browser

## treat a browser's localStorage as a mini Solid server

This library supports the use of the app:// scheme to create and access resources and containers stored in a browser's localStorage (and eventually indexedDB and other kinds of storage).  It supports rdflib's fetcher methods which means that resources in the app:// space may be addressed pretty much the same as in https;// space. 

See **[a live demo](https://jeff-zucker.github.io/solid-rest-browser/)**.

This is not carved in stone, but how I currently handle IRIs:

    IRI = scheme + host + path

    scheme = app://

    host = "ls" for localStorage
           "id" for indexedDB (not yet implemented)
           ... possible others

Since each origin gets its own localStorage, Solid apps can read and write to their own storage.  It is also possible to sync between the apps's local storage and the user's pod with standard Solid methods.  

The root Container of an app's localStorage is:

   app://ls/

In the actual storage, the app origin will be pre-pended but the app can't see that part.

My hope is that this will become a part of solid-auth-client which would mean that resources in the app:// space could be accessed in the same way as resources in the https:// space regardless of whether through rdflib, query-ldflex, or any other library using solid-auth-client's fetch.

copyright &copy; 2019, Jeff Zucker, may be freely used with an MIT license.