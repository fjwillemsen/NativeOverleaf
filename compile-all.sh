#!/bin/bash
OUTPUT_RED='\033[0;31m'    # red
OUTPUT_ORANGE='\033[0;33m'    # orange
OUTPUT_GREEN='\033[0;32m'   # green
OUTPUT_NC='\033[0m' # no color
echo

echo -e "${OUTPUT_ORANGE}Always check whether the dynamically included libraries (chartjs and showdownjs) are still up to date! ${OUTPUT_NC}"
echo

# run the unit tests
echo "Running unit tests"
npm run test
if [ $? -eq 0 ] # check the exit status of the last command
then
  echo -e "|${OUTPUT_GREEN} unit tests passed ${OUTPUT_NC}"
else
  echo -e "|${OUTPUT_RED} unit tests failed"
  exit 1
fi

# bundle all scripts by replacing insert statements with file contents
echo
cd Scripts
echo "Bundling scripts"
/bin/bash bundle_scripts.sh
cd ..

# statically validate the syntax
echo "Statically validating bundled script"
validated=$(node --check bundled_script.js 2>&1)
if [ -z "$validated" ]
then
    echo -e "|${OUTPUT_GREEN} valid ${OUTPUT_NC}"
else
    echo -e "|${OUTPUT_RED} invalid bundled_script.js, reason:"
    echo $validated
    exit 1
fi

# minify the bundled_script.js file
echo "Minifying bundled script"
terser bundled_script.js --compress --output bundled_script.js  # use --timings to see how long each step takes
echo

# Clean the binaries folder 
rm -rf Binaries
mkdir Binaries

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
internalurls="--internal-urls .*?(login|profile|engine|auth|idp|identity|secure|account.*)\..*?(?<TLD>\.\w+?)(?:$|\/)"   # matches all *(login|profile|engine|auth|account.*|etc...).*.<top-level-domain> URLs until the first forward-slash, may be a too greedy because it will also match slugs (e.g. domain.com/login.file.html)
basecommand="nativefier https://overleaf.com $destination $name $appversion $buildversion $internalurls $script --user-agent-honest --overwrite"

# function to compile while filtering the nativefier output so only relevant output remains
function compile() {
    # read in "named" arguments
    _platform="--platform $1"
    _arch="--arch $2"
    _icon="--icon $3"
    # read in remaining arguments as options string
    shift 3
    _options="${@:-""}"
    echo "compiling with '$_platform $_arch $_icon $_options'"
    # execute compilation while redirecting stdout and stderr to respective files
    $basecommand $_platform $_arch $_icon $_options > out 2>error
    if grep -iq ERROR error; # check if the error output contains "Error"
    then
        echo -e "|${OUTPUT_RED} failed to compile, reason: (check error file for details) ${OUTPUT_NC}"
        cat error | grep -i ERROR
        exit 1
    fi
    if grep -iq WARNING error; # check if the error output contains "Warning"
    then
        echo -e "|${OUTPUT_ORANGE} compiled with warnings, reason: (check error file for details) ${OUTPUT_NC}"
        cat error | grep -i WARNING
        exit 1
    fi
    # clean up the outputted files and argument list
    rm error
    rm out
    shift $#
    echo
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
