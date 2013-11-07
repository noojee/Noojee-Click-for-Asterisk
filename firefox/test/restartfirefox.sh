#! /bin/bash
# to use this you need to create a firefox profile called development by running:
# firefox -P development
# You should then install the firefox extenion development add ons to make life easier.
# https://developer.mozilla.org/en/docs/Setting_up_extension_development_environment
#
echo starting firefox
#/usr/bin/firefox  
sh -c cd / && /usr/bin/firefox -chromebug -P development & : -c > /dev/null 2>&1 </dev/null
