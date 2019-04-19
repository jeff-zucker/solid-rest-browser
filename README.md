# Solid REST Browser

## treat a browser's localStorage as a mini Solid server

[![NPM](https://nodei.co/npm/solid-rest-browser.png)](https://nodei.co/npm/solid-rest-browser/)

This library supports the use of the app:// scheme to create and access resources and containers stored in a browser's localStorage (and eventually indexedDB and other kinds of storage) using the same methods as a Solid pod.  Using this library, apps may read and write configuration preferences and other data within the user's browser using rdflib, query-ldflex, and any library that uses solid-auth-client's fetch.  It can also serve as a mini-pod allowing users with no pod and no web-server to interact with Solid apps as though they had a pod.  Most calls will return what you expect from a Solid server, including, on fetch of a folder, a Turtle representation of a container and the resources it contains.

The library should work in all modern browsers and runs fine on iPhone and Android.

**See [a live demo](https://jeff-zucker.github.io/solid-rest-browser/)!**

## Installation and Usage

Just include the library and solid-auth-client in script tags, then use rdflib, query-ldflex or any other Solid library's methods to access app:// URLs the same as you would https:// URLs.  All methods should work except those that require PATCH (e.g. rdflib's UpdateManager).

    <script src="https://cdn.jsdelivr.net/npm/solid-rest-browser@0.0.1">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/solid-auth-client@3.14.1">
    </script>
    // import rdflib or other Solid libraries here
    // use most of the Solid library's methods with app:// URLs ...

**IMPORTANT** : solid-auth-client has the hook to use this library but it hasn't been npm'd yet so this library will need to be used directly until it propagates; see the (demo code)[./index.html) for examples of using it directly with rdflib.

# Storage and Naming Conventions

Each app origin (protocol+domain+port) has its own siloed localStorage and can not see or change the localStorage of other apps.  For purposes of this library, localhost:// and file:// origins work the same as remote origins.

Here is how URLs will be treated :

    URL = scheme + storageType + resourcePath

    scheme = app://

    storageType = "ls" for localStorage
                  "id" for indexedDB (not yet implemented)
                  ... possible others

    resourcePath = the path to the container or resource


The root container for any app is

    app://ls/

But an app at originX will be looking at app://ls/ within originX's localStorage silo whereas an app at originY will be looking at a different app://ls/ in its own silo.


**Important** : Container names must always end in slash.


copyright &copy; 2019, Jeff Zucker, may be freely used with an MIT license.