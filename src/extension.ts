import * as vscode from "vscode";
import { FunctionCopierProvider } from "./functionCopier";

export function activate(context: vscode.ExtensionContext) {
  console.log('Function Copier is now active!');

  // Register the CodeLens provider
  const functionCopierProvider = new FunctionCopierProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: "javascript", scheme: "file" },
      functionCopierProvider
    )
  );

  // Register the Copy Function command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "functionCopier.copyFunction",
      (functionName: string, functionCode: string) => {
        vscode.env.clipboard.writeText(functionCode);
        vscode.window.showInformationMessage(
          `Function '${functionName}' copied to clipboard!`
        );
      }
    )
  );
}

export function deactivate() {}
