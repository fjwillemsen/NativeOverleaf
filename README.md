## Important notice on the future of Native Overleaf
As many of you are aware, recent changes to Overleaf have made it very hard to keep this project in good condition. For example, the settings panel of Native Overleaf was broken by changes on Overleaf's end (see [issue #32](https://github.com/fjwillemsen/NativeOverleaf/issues/32)). I have tried my best to work around these issues, but this is not sustainable. This means that Native Overleaf is not able to provide the stability needed to use it in daily work, and I will no longer be working towards fixing the individual issues.

I am very grateful for the overwhelmingly positive response Native Overleaf has had over the past two years and would like to create something even better. I believe it is necessary to start from the ground up to create a completely new solution that will not have these issues, something worthy of serving the academic community. I am currently working on this, and hope to share this with all of you soon.

In the meantime, I will try to provide security & maintainance updates to Native Overleaf, but will not be resolving most issues or adding new features. 

If you feel like discussing this, please see [discussions #38](https://github.com/fjwillemsen/NativeOverleaf/discussions/38). 


# Native Overleaf
Overleaf is a fantastic webtool for writing and cooperating on LaTeX documents. 
However, would it not be even better if it were to behave like a native app on your system? 

![switching between system light and dark mode](Assets/showcase/darkmode/switching.gif)

[Download directly for your system below](#download-binary)!


## Contents
- [Important notice on the future of Native Overleaf](#important-notice-on-the-future-of-native-overleaf)
- [Contents](#contents)
- [Features](#features)
- [Next Features](#next-features)
- [Hints](#hints)
- [Download binary](#download-binary)
  - [**Mac**](#mac)
  - [**Linux**](#linux)
  - [**Windows**](#windows)
- [Installation on Linux](#installation-on-linux)
- [How it works](#how-it-works)
- [Troubleshooting](#troubleshooting)
  - [Institutional login](#institutional-login)
  - [Unable to open on Mac](#unable-to-open-on-mac)
  - [Wordcounts \& projects](#wordcounts--projects)
- [Compile your own](#compile-your-own)
- [Ideas, questions, contributions?](#ideas-questions-contributions)

## Features
- [x] standalone native application
- [x] system-based dark / light mode switching 
- [x] notifications of chats, comments and comment threads
- [x] notifications of tracked changes
- [x] preferences pane integrated in the Overleaf sidemenu
- [x] automatic update checking and release notes display
- [x] words-per-day tracker, reminder & graph (useful for the 200-words-per-day-doctrine)

<p float="left">
    <img src="Assets/showcase/notifications/badgecount.png" alt="notification badgecount">
    <img src="Assets/showcase/notifications/notificationcenter_light.png" width="250" alt="notification center showcase">
    <img src="Assets/showcase/wordcount/wordcount_notification_hour.png" width="250" alt="notification center wordcount hour">
    <img src="Assets/showcase/preferences/preferences_pane_extended.png" width="200" alt="preferences pane">
    <img src="Assets/showcase/wordcount/wordcount_overview_dark.png" width="550" alt="wordcount overview graph">
</p>


## Next Features
- [ ] addition to Homebrew for easier updates
- [ ] automated local backups of projects (planned for future version)
- [ ] date range selection for wordcount graph (planned for future version)
- [ ] integrate Overleaf extensions (if technically possible, discussed here: [issue #8](https://github.com/fjwillemsen/NativeOverleaf/issues/8)) <!-- not supported but possible: https://github.com/nativefier/nativefier/issues/1433 Electron supports this: https://www.electronjs.org/docs/latest/api/extensions -->

[Looking to contribute?](#ideas-questions-contributions)

## Hints
- The preferences pane can be found in the same left-side menu as the other Overleaf settings. 
- You can run multiple instances of Native Overleaf, allowing you to keep multiple projects open at the same time and receive notifications for each project. 
- The word count tracker tracks the total words in the project, so includes anything written by other authors. It counts the words in the compiled PDF, hence it must be recompiled to track a new change in the number of words. 
- The word count tracker uses the local date of your system, hence inconsistencies may arise when switching time zones. If necessary, the word count can be reset using the button in the preferences pane. 
- Notice on notifications: For notifications to work, the app must be allowed to by your system. You will only receive notifications for projects that are opened in the app. Multiple instances of the app can be openened at the same time. **Important**: to get notifications for chats, the chat window must have been opened at least once after loading a project (you can close it again). This is a limitation of the way we listen for new chat messages. If someone has a better idea, please get in touch. 
- PDF dark mode works by inversing the colors and reversing the hue, meaning the white-grey-black scale is inversed while the colors remain largely the same. This can make graphics appear slightly different. PDF dark mode has been implemented by adjusting the PDF web viewer, not the source or the PDF itself, so downloaded files are untouched. 

## Download binary
Should you have any problems running the app, please [comment on or open an issue](https://github.com/fjwillemsen/NativeOverleaf/issues)!
For now, the following binaries have been precompiled and can be downloaded directly:

### **Mac**
* [Apple Silicon (M1/M2)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-darwin-arm64.zip)
* [Intel (64-bit only)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-darwin-x64.zip)

### **Linux**
* [ARM64 (64-bit)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-linux-arm64.zip)
* [ARMv7L (32-bit)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-linux-armv7l.zip)
* [X64 (64-bit)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-linux-x64.zip)

### **Windows**
* [ARM64 (64-bit)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-win32-arm64.zip)
* [X86 (64-bit)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-win32-x64.zip)

If your platform / architecture is missing, let me know via the [discussions page](https://github.com/fjwillemsen/NativeOverleaf/discussions), or compile it yourself using the instructions below. 

## Installation on Linux

After downloading the zip-file you should extract it and move the directory to `sudo mv /path/to/Overleaf-linux-x64 /opt/`. </br>
Then you can create a Desktop Entry in `/usr/share/applications` </br>
```
$ cd /usr/share/applications
$ sudo nano overleaf.desktop
$ sudo vim overleaf.desktop

[Desktop Entry]
Name=Overleaf
Type=Application
Terminal=false
Icon=/opt/Overleaf-linux-x64/resources/app/icon.png
Exec=/opt/Overleaf-linux-x64/Overleaf
Categories=Science
```

After ca. 30 seconds you should see Overleaf as a Desktop entry. This is tested for **Debian 12**.

## How it works
Using [nativefier](https://github.com/nativefier/nativefier), the Overleaf website is wrapped as an Electron app and injected with JavaScript. While this is not optimally efficient and we may switch to a more efficient framework in the future, it does allow combining the webapp with native features for a large number of supported platforms. 
<!-- may switch to [Multi](https://github.com/kofigumbs/multi), but macOS only -->
<!-- qbrt would have been nice had it been further developed (discontinued) -->
<!-- best option: Tauri (like [this](https://github.com/erayerdin/taurapp)) -->

## Troubleshooting
If you have any problem running the app not fixed with these instructions, please [comment on or open an issue](https://github.com/fjwillemsen/NativeOverleaf/issues)!

### Institutional login
This has been fixed since v1.4.0. If you encounter a related issue, look at and comment on [issue #3](https://github.com/fjwillemsen/NativeOverleaf/issues/3). 

### Unable to open on Mac
If you get the message that "Apple can't verify this app doesn't contain malware", use right-click -> open to open it. 
If you get "This app is damaged and can't be opened", download the archive again and unzip it using Finder's built-in Archive Utility or [ditto](https://ss64.com/osx/ditto.html) (otherwise codesigning metadata may be lost). 

### Wordcounts & projects
Currently, the wordcount tracking settings are globally. 
In the future we can change this to per-project settings. 
If you want this, please [create an issue](https://github.com/fjwillemsen/NativeOverleaf/issues/new). 


## Compile your own
Want to adjust some settings or just build from scratch for your device? Easily create your own native version of Overleaf!
In just four easy steps you can compile Overleaf as a native app for your device.  

- Step 1: open your terminal and `cd` to wherever you want to install Overleaf. 
- Step 2: download this repository (e.g. `git clone https://github.com/fjwillemsen/NativeOverleaf.git`).
- Step 3: install the package.json dependencies, and optionally the devDependencies if you want to change the JavaScript code. 
- Step 4: use the `compile-all.sh` script (without codesigning) for inspiration, executing and modifying the commands as needed. Alternatively (not recommended), run `nativefier 'https://overleaf.com' --name 'Overleaf' --app-version <latest version> --darwin-dark-mode-support --inject bundled_script.js --icon Icon/<select icon>`. If you have an Apple Silicon (M1/M2) Mac, be sure to add `--arch arm64` as Homebrew may still be an Intel process in some cases. If you do not intend to distribute the app, leave out the codesigning, otherwise create your own self-signed certificate. 

After being built, the app appears in the folder - you can copy it to another location if desired. 

## Ideas, questions, contributions?
Please use the [GitHub discussions page](https://github.com/fjwillemsen/NativeOverleaf/discussions) for this project. This allows others to read and chime in as well. 
If you'd like to contribute, great! 
Feel free to submit pull requests via forks. 
