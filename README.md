This project moved!
===================

The new location: https://github.com/sanitz/jenkins-chrome-extension


Hudson Extension for Google Chrome
----------------------------------

This extension monitors Hudson, a continuous integration server. For more
information about Hudson take a look at: <http://hudson-ci.org/>

The options of this extension allows you to set the URL of your Hudson. By
default it will check the status of the Hudson instance used for Hudson
itself at <http://ci.hudson-labs.org/>

The button of this extension will show a green "OK" if the builds succeeds, if
the build fails the button shows a red "Fail". A click on the button will show 
you the status of your jobs and the time of the last update.

You can get the source for this extension and file bugs or feature requests at
github: <http://github.com/sanitz/hudson-chrome-extension>

You can install the extension at the [offical
Google Extension site][extension_site].

Changelog
----------
- Disabled horizontal scroll (Ivan Nevostruev)
- refresh button in popup (Ivan Nevostruev)
- desktop notification (Ivan Nevostruev)
- manifest_version 2 compatibility (Jyry Suvilehto)

[extension_site]: http://bit.ly/hudson_extension
