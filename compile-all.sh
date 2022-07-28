#!/bin/bash

# bundle all scripts by replacing insert statements with file contents
cd Scripts
/bin/bash bundle_scripts.sh
cd ..

# Setup variables
name="--name Overleaf"
destination="Binaries/"
appversionnumber=$(cat Scripts/appversion.js | grep -o "\".*\"")
appversion="--app-version $appversionnumber"
epochtime=$(date +%s)
buildversion="--build-version $appversionnumber.$epochtime" 
script="--inject bundled_script.js"
basecommand="nativefier https://overleaf.com $destination $name $appversion $buildversion $script --overwrite"

# Mac
platform="--platform osx"
icon="--icon Icons/Mac.icns"
options="--darwin-dark-mode-support --counter --bounce --fast-quit"
$basecommand $platform --arch arm64 $options $icon
$basecommand $platform --arch x64 $options $icon

# Linux
platform="--platform linux"
icon="--icon Icons/base_icon.png"
$basecommand $platform --arch arm64 $icon
$basecommand $platform --arch armv7l $icon
$basecommand $platform --arch x64 $icon

# Windows
platform="--platform windows"
icon="--icon Icons/Windows.ico"
$basecommand $platform --arch arm64 $icon
$basecommand $platform --arch x64 $icon
$basecommand $platform --arch ia32 $icon

# Zipping
echo
echo "--------"
cd $destination
for d in */ ; do
    target="${d%?}.zip"         # remove the / at the end of the folder name
    echo "Zipping $d to $target"
    ditto -c -k --sequesterRsrc --keepParent $d $target
    # zip -r -X -o $target $d   # ditto is much more efficient for zipping Mac applications
done
cd ..
