#!/bin/bash
name="--name Overleaf"
destination="Binaries/"
appversion="--app-version 1.0.0"
script="--inject script.js"
basecommand="nativefier https://overleaf.com $destination $name $appversion $script --overwrite"

# Mac
platform="--platform osx"
icon="--icon Icon/Mac.icns"
$basecommand $platform --arch arm64 --darwin-dark-mode-support $icon
$basecommand $platform --arch x64 --darwin-dark-mode-support $icon

# Linux
platform="--platform linux"
icon="--icon Icon/base_icon.png"
$basecommand $platform --arch arm64 $icon
$basecommand $platform linux --arch armv7l $icon
$basecommand $platform linux --arch x64 $icon
$basecommand $platform linux --arch ia32 $icon

# Windows
platform="--platform windows"
icon="--icon Icon/Windows.ico"
$basecommand $platform --arch arm64 $icon
$basecommand $platform windows --arch x64 $icon
$basecommand $platform windows --arch ia32 $icon
