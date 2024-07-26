import * as childProcess from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";

function getWorkBenchRootDir(curPath: string): string {
  let rootDir = path.dirname(curPath);
  const workBenchRootDir = vscode.workspace.workspaceFolders || [];
  workBenchRootDir.findIndex(function (workbench: { uri: any }) {
    const uri = workbench.uri;
    if (curPath.startsWith(uri.fsPath)) {
      rootDir = uri.fsPath;
      return true;
    }
    return false;
  });
  return rootDir;
}
function registerHandler(e: { fsPath: any }, type: number) {
  if (process.platform === "darwin") {
    const scriptPath = path.join(__dirname, "../res/open-item2.scpt");
    fs.stat(e.fsPath, (err: any, stats: { isFile: () => any }) => {
      if (err) {
        return;
      }

      let dirPath = e.fsPath;
      if (type === 1) {
        if (stats.isFile()) {
          dirPath = path.dirname(dirPath);
        }
      } else if (type === 2) {
        dirPath = getWorkBenchRootDir(dirPath);
      }
      console.log(dirPath);
      childProcess.spawn("osascript", [scriptPath, "cd", `"${dirPath}"`]);
    });
  } else {
    vscode.commands.executeCommand(
      "workbench.action.terminal.openNativeConsole",
      e
    );
  }
}
function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.openITerm2",
    (e: any) => {
      registerHandler(e, 1);
    }
  );
  let disposable2 = vscode.commands.registerCommand(
    "extension.openITerm2Root",
    (e: any) => {
      registerHandler(e, 2);
    }
  );
  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
}
exports.activate = activate;
function deactivate() {}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
