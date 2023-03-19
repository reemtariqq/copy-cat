import * as vscode from "vscode";

export class FunctionCopierProvider implements vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = [];
    const regex = /function\s+(\w+)\s*\(/g;
    let matches;

    while (matches = regex.exec(document.getText())) {
      const functionName = matches[1];
      const position = document.positionAt(matches.index);
      const range = document.getWordRangeAtPosition(position, /[\w\d]+/);
      if(range){
      const codeLens = new vscode.CodeLens(range, {
        title: `Copy function '${functionName}'`,
        command: "functionCopier.copyFunction",
        arguments: [functionName]
      });

        codeLenses.push(codeLens);
      }
    }

    return codeLenses;
  }

  static findFunction(editor: vscode.TextEditor, functionName: string) {
    const functionRegex = new RegExp(`function\\s+${functionName}\\s*\\(`);
  
    console.log("Searching for function:", functionRegex);
  
    const document = editor.document;
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const match = line.text.match(functionRegex);
      if (match) {
        const start = line.range.start.translate(0, match.index);
        const endLine = document.lineAt(line.range.end.line);
        let end;
        for (let j = i + 1; j < document.lineCount; j++) {
          const nextLine = document.lineAt(j);
          if (nextLine.text.includes('}')) {
            end = nextLine.range.end;
            break;
          }
        }
        if (end) {
          const functionBody = document.getText(new vscode.Range(start, end));
          if (functionBody) {
            return functionBody;
          } else {
            console.log("Function body not found!");
            return null;
          }
        } else {
          console.log("Closing brace not found!");
          return null;
        }
      }
    }
  
    console.log("Function not found!");
    return null;
  }
  
  
}

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
      (functionName: string) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage("No active editor found!");
          return;
        }

        const functionCode = FunctionCopierProvider.findFunction(editor, functionName);
        if (functionCode) {
          vscode.env.clipboard.writeText(functionCode).then(() => {
            vscode.commands.executeCommand(
              "cursorMove",
              { to: "wrappedLineStart", by: "line", value: 1 }
            );
          });
          vscode.window.showInformationMessage(
            `Function '${functionName}' copied to clipboard!`
          );
        }
      }
    )
  );
}

export function deactivate() {}
