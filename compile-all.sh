#!/bin/bash
echo

# bundle all scripts by replacing insert statements with file contents
cd Scripts
echo "Bundling scripts"
/bin/bash bundle_scripts.sh
echo
cd ..

# Setup variables
echo
echo "--------"
name="--name Overleaf"
destination="Binaries/"
appversionnumber=$(cat Scripts/appversion.js | grep -o ".\..\..")
appversion="--app-version $appversionnumber"
epochtime=$(date +%s)
buildversion="--build-version $appversionnumber.$epochtime" 
script="--inject bundled_script.js"
basecommand="nativefier https://overleaf.com $destination $name $appversion $buildversion $script --overwrite"

# function to compile while filtering the nativefier output so only relevant output remains
function compile() {
    # read in "named" arguments
    _platform="--platform $1"
    _arch="--arch $2"
    _icon="--icon $3"
    # read in remaining arguments as options string
    shift 3
    _options="${@:-""}"
    echo "Compiling with '$_platform $_arch $_icon $_options'"
    $basecommand $_platform $_arch $_icon $_options 2>&1 | grep -v "Hi! Nativefier is minimally maintained" | grep -v "If you have the time" | grep -v "Please go to" | grep -v "Processing options..." | grep -v "Preparing Electron app..." | grep -v "Converting icons..." | grep -v "Packaging...* cached yet..." | grep -v "Finalizing build..." | grep -v "App built to " | grep -v "Menu/desktop shortcuts are" | grep -v '^$'
    echo
    shift $#
}

# Mac
echo "Compiling for Mac"
platform="osx"
icon="Icons/Mac.icns"
options="--darwin-dark-mode-support --counter --bounce --fast-quit"
compile $platform "arm64" $icon $options
compile $platform "x64" $icon $options
echo "Codesigning Mac apps"
codesign --deep --force -s "NativeOverleaf" Binaries/Overleaf-darwin-arm64/Overleaf.app
codesign --deep --force -s "NativeOverleaf" Binaries/Overleaf-darwin-x64/Overleaf.app
echo ""

# Linux
echo "Compiling for Linux"
platform="linux"
icon="Icons/base_icon.png"
compile $platform "arm64" $icon
compile $platform "armv7l" $icon
compile $platform "x64" $icon

# Windows
echo "Compiling for Windows"
platform="windows"
icon="Icons/Windows.ico"
compile $platform "arm64" $icon
compile $platform "x64" $icon

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
