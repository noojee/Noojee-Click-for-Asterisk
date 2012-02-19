$!/bin/bash
target=~/.mozilla/firefox/3g0nlpt5.default/extensions

echo ${target}
rm -rf ${target}/noojeeclick@noojee.com.au
cp test/noojeeclick@noojee.com.au ${target}


echo Make certain you have the following firefox boolean property set \(via about:config\) 
echo nglayout.debug.disable_xul_cache=true
echo

echo Please restart firefox or force an extension reload
