#! /bin/bash
echo starting firefox
#/usr/bin/firefox  
sh -c cd / && /usr/bin/firefox -chromebug & : -c > /dev/null 2>&1 </dev/null
