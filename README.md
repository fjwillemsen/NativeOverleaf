# Native Overleaf
Overleaf is a fantastic webtool for writing and cooperating LaTeX documents. 
However, would it not be even better if it were to behave like a native app on your system? 

## Features
- [x] standalone native application
- [x] system-based dark / light mode switching 
- [ ] preferences pane (planned for next version)
- [ ] notifications (planned for next version)


## How it works
Using [nativefier](https://github.com/nativefier/nativefier), the Overleaf website is wrapped as an Electron app. While this is not optimally efficient and we may switch to a better approach in the future, it does provide compatibility with a large number of platforms. 


## Download binary
If there is interest in this project, I will create add it to Homebrew for easy updates. 
For now, the following binaries have been precompiled and can be downloaded directly:

### **Mac**
* Apple Silicon (M1/M2)
* Intel (64-bit only)

### **Linux**
* ARM64 (64-bit)
* ARMv7L (32-bit)
* X64 (64-bit)
* IA32 (32-bit)

### **Windows**
* X86 (64-bit)
* X86 (32-bit)
* ARM64 (64-bit)

If your platform is missing, let me know and I will add it, or compile it yourself using the instructions below. 


## Compile your own
Want to adjust some settings or just build from scratch for your device? Easily create your own native version of Overleaf!
In just four easy steps you can compile Overleaf as a native app for your device.  

- Step 1: open your terminal and `cd` to wherever you want to install Overleaf. 
- Step 2: download this repository (e.g. `git clone https://github.com/fjwillemsen/NativeOverleaf.git`).
- Step 3: install nativefier, for example using `brew install nativefier`. 
- Step 4: run `nativefier 'https://overleaf.com' --name 'Overleaf' --app-version 1.0.0 --darwin-dark-mode-support --inject script.js --icon Icon/<select icon>`. If you have an Apple Silicon (M1/M2) Mac, be sure to add `--arch arm64` as Homebrew may still be an Intel process in some cases. 

After being built, the app appears in the folder - you can copy it to another location if desired. 
