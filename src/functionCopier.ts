import * as vscode from "vscode";

export class FunctionCopierProvider implements vscode.CodeLensProvider {
  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = [];
    const regex = /function\s+([^\s(]+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(document.getText()))) {
      const functionName = match[1];
      const position = new vscode.Position(match.index, 0);
      const range = document.getWordRangeAtPosition(position);
      if (range) {
        const command: vscode.Command = {
          command: "functionCopier.copyFunction",
          title: "Copy Function",
          arguments: [functionName, document.getText(range)],
        };
        const codeLens = new vscode.CodeLens(range, command);
        codeLenses.push(codeLens);
      }
    }
    return codeLenses;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "functionCopier" is now active!');

  const functionCopierProvider = new FunctionCopierProvider();

  vscode.languages.registerCodeLensProvider(
    { scheme: "file", language: "javascript" },
    functionCopierProvider
  );

  vscode.commands.registerCommand(
    "functionCopier.copyFunction",
    (functionName: string, functionCode: string) => {
      vscode.env.clipboard.writeText(functionCode).then(() => {
        vscode.window.showInformationMessage(
          `Function "${functionName}" copied to clipboard!`
        );
      });
    }
  );
}
