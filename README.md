# Native Overleaf
Overleaf is a fantastic webtool for writing and cooperating LaTeX documents. 
However, would it not be even better if it were to behave like a native app on your system? 

[Download directly for your system below](#download-binary)!

## Features
- [x] standalone native application
- [x] system-based dark / light mode switching 
- [x] notifications of comments and comment threads
- [ ] notifications of chat (planned for next version)
- [ ] preferences pane (planned for next version)
- [ ] automated local backups of projects (planned for future version)

## Tips
You can run multiple instances of Native Overleaf, allowing you to keep multiple projects open at the same time and receive notifications for each project. 

## Notice on notifications
For notifications to work, the app must be allowed to by your system. 
You will only receive notifications for projects that are opened in the background, so you will not get notifications while working in a project. 


## How it works
Using [nativefier](https://github.com/nativefier/nativefier), the Overleaf website is wrapped as an Electron app and injected with JavaScript. While this is not optimally efficient and we may switch to a more efficient framework in the future, it does allow combining the webapp with native feature with a large number of supported platforms. 

## Download binary
If there is interest in this project, I will create add it to Homebrew for easy updates. 
For now, the following binaries have been precompiled and can be downloaded directly:

### **Mac**
* [Apple Silicon (M1/M2)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-darwin-arm64.zip)
* [Intel (64-bit only)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-darwin-x64.zip)

### **Linux**
* [ARM64 (64-bit)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-linux-arm64.zip)
* [ARMv7L (32-bit)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-linux-armv7l.zip)
* [X64 (64-bit)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-linux-x64.zip)

### **Windows**
* [X86 (64-bit)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-win32-x64.zip)
* [X86 (32-bit)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-win32-ia32.zip)
* [ARM64 (64-bit)](https://github.com/fjwillemsen/NativeOverleaf/releases/latest/download/Overleaf-win32-arm64.zip)

If your platform is missing, let me know and I will add it, or compile it yourself using the instructions below. 


## Compile your own
Want to adjust some settings or just build from scratch for your device? Easily create your own native version of Overleaf!
In just four easy steps you can compile Overleaf as a native app for your device.  

- Step 1: open your terminal and `cd` to wherever you want to install Overleaf. 
- Step 2: download this repository (e.g. `git clone https://github.com/fjwillemsen/NativeOverleaf.git`).
- Step 3: install nativefier, for example using `brew install nativefier`. 
- Step 4: run `nativefier 'https://overleaf.com' --name 'Overleaf' --app-version <latest version> --darwin-dark-mode-support --inject script.js --icon Icon/<select icon>`. If you have an Apple Silicon (M1/M2) Mac, be sure to add `--arch arm64` as Homebrew may still be an Intel process in some cases. 

After being built, the app appears in the folder - you can copy it to another location if desired. 
