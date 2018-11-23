import { remote } from "electron";
import jetpack from "fs-jetpack";
import path from "path";

const app = remote.app;
const appDirLocation = app.getAppPath();
const appDirExternalLocation = appDirLocation.replace("app.asar", "");

console.log("Application Dir Location : ", appDirLocation)
console.log("Application Dir External Location : ", appDirExternalLocation)

export const AppDir = () => {
    return jetpack.cwd(appDirLocation);
}

export const AppDirExternal = () => {
    return jetpack.cwd(appDirExternalLocation);
}