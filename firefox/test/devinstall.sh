#
$!/bin/bash

#
# Make certain the target matches the path to your development profile for firefox.
# read the notes in restartfirefox.sh for details on creating the development profile.
# 
target=~/.mozilla/firefox/k56g72oa.development/extensions

echo ${target}

# Make certain that the path in the file test/noojeeclick@noojee.com.au points to the source code in your test environment. 
rm -rf ${target}/noojeeclick@noojee.com.au
cp test/noojeeclick@noojee.com.au ${target}


echo Make certain you have the following firefox boolean property set \(via about:config\) 
echo nglayout.debug.disable_xul_cache=true
echo

echo Please restart firefox or force an extension reload
