
# Introduction

Config tool for D4 Loot Filter: https://github.com/aeon0/d4lf

![Alt text](/src/assets/thumbnail.png)


## Features
- Modify settings in the **params.ini** file located in **%USERPROFILE%/.d4lf** folder.
- Create and modify new and existing filter profiles files (.yaml) located in **%USERPROFILE%/.d4lf/profiles**.
- Aspects & Affixes editor - manipulate the aspect keys, threshold, and condition values.
- Affixes editor - Specify the item type(s), minimum item power, and minimum affix count for each item group.
- Autocomplete - suggest what aspect/affix the user wants to enter into the input field.
- Uniques editor - I'll work on this at some point.

## Usage
- Download the latest version from [releases](https://github.com/kvo189/d4lf-config/releases). You only need to download either the standable .exe or .zip file (**d4lf-config.x.x.x.exe** OR **d4lf-config.x.x.x.zip**)
- For the **Launch D4LF** action to work correctly, ensure that **d4lf.exe** script and it's associated files are in the same directory as **d4lf-config.exe**.


## To build for development

- **in a terminal window** -> npm start

Voila! You can use your Angular + Electron app in a local development environment with hot reload!

The application code is managed by `app/main.ts`. In this sample, the app runs with a simple Angular App (http://localhost:4200), and an Electron window. \
The Angular component contains an example of Electron and NodeJS native lib import. \
You can disable "Developer Tools" by commenting `win.webContents.openDevTools();` in `app/main.ts`.

## Project structure

| Folder | Description                                      |
|--------|--------------------------------------------------|
| app    | Electron main process folder (NodeJS)            |
| src    | Electron renderer process folder (Web / Angular) |

## Included Commands

| Command                  | Description                                                                                           |
|--------------------------|-------------------------------------------------------------------------------------------------------|
| `npm run ng:serve`       | Execute the app in the web browser (DEV mode)                                                         |
| `npm run web:build`      | Build the app that can be used directly in the web browser. Your built files are in the /dist folder. |
| `npm run electron:local` | Builds your application and start electron locally                                                    |
| `npm run electron:build` | Builds your application and creates an app consumable based on your operating system                  |


