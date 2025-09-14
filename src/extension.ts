import * as vscode from 'vscode';
import * as path from 'path';
import { SvgParser } from './svgParser';
import { ReactGenerator } from './reactGenerator';

export function activate(context: vscode.ExtensionContext) {
    // Register command for converting from SVG file (right-click context menu and keyboard shortcut)
    const convertCommand = vscode.commands.registerCommand('imi-svg-to-icon.convertSvg', async (uri?: vscode.Uri) => {
        await convertSvgToReactComponent(uri);
    });

    context.subscriptions.push(convertCommand);
}

async function convertSvgToReactComponent(uri?: vscode.Uri) {
    try {
        console.log('convertSvgToReactComponent called with uri:', uri?.fsPath);
        
        // If no URI provided (e.g., from keyboard shortcut), try to get from active editor
        if (!uri) {
            console.log('No URI provided, checking active editor...');
            
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                console.log('Active editor found:', activeEditor.document.uri.fsPath);
                const filePath = activeEditor.document.uri.fsPath;
                if (filePath.endsWith('.svg')) {
                    uri = activeEditor.document.uri;
                    console.log('Using active editor URI:', uri.fsPath);
                } else {
                    console.log('Active editor is not an SVG file:', filePath);
                }
            } else {
                console.log('No active editor found');
            }
        }

        // Convert from SVG file
        if (!uri || !uri.fsPath.endsWith('.svg')) {
            console.log('Final check failed - uri:', uri?.fsPath);
            vscode.window.showErrorMessage('Please open an SVG file in the editor and try again');
            return;
        }

        console.log('Processing SVG file:', uri.fsPath);

        const document = await vscode.workspace.openTextDocument(uri);
        const svgContent = document.getText();
        const fileName = path.basename(uri.fsPath, '.svg');
        const outputDir = path.dirname(uri.fsPath);

        // Parse SVG content
        const svgData = SvgParser.parse(svgContent);
        if (!svgData) {
            vscode.window.showErrorMessage('Invalid SVG content');
            return;
        }

        // Generate React component
        const componentCode = ReactGenerator.generate(fileName, svgData);
        
        // Create output file
        const componentFileName = ReactGenerator.getComponentFileName(fileName);
        const outputPath = path.join(outputDir, componentFileName);
        
        // Check if file exists
        const fileUri = vscode.Uri.file(outputPath);
        try {
            await vscode.workspace.fs.stat(fileUri);
            const overwrite = await vscode.window.showWarningMessage(
                `File ${componentFileName} already exists. Overwrite?`,
                'Yes',
                'No'
            );
            if (overwrite !== 'Yes') {
                return;
            }
        } catch {
            // File doesn't exist, continue
        }

        // Write component file
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(componentCode, 'utf8'));

        // Open the created file
        const newDocument = await vscode.workspace.openTextDocument(fileUri);
        await vscode.window.showTextDocument(newDocument);

        vscode.window.showInformationMessage(`Successfully created React component: ${componentFileName}`);

    } catch (error) {
        console.error('Error converting SVG:', error);
        vscode.window.showErrorMessage(`Failed to convert SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export function deactivate() {}