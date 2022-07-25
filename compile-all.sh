#!/bin/bash
name="--name Overleaf"
destination="Binaries/"
appversionnumber="1.1.0"
appversion="--app-version $appversionnumber"
epochtime=$(date +%s)
buildversion="--build-version $appversionnumber.$epochtime" 
script="--inject script.js"
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
