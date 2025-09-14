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
        
        // If no URI provided (e.g., from keyboard shortcut), try various methods to find SVG file
        if (!uri) {
            console.log('No URI provided, attempting to find SVG file...');
            
            // Method 1: Check active text editor
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.document.uri.fsPath.endsWith('.svg')) {
                uri = activeEditor.document.uri;
                console.log('Method 1 - Using active editor URI:', uri.fsPath);
            }
            
            // Method 2: Check active tab (for preview mode)
            if (!uri) {
                try {
                    const activeTab = vscode.window.tabGroups.activeTabGroup?.activeTab;
                    console.log('Active tab:', activeTab?.label, 'Type:', typeof activeTab?.input);
                    
                    if (activeTab?.input) {
                        console.log('Tab input keys:', Object.keys(activeTab.input));
                        if (typeof activeTab.input === 'object' && activeTab.input !== null && 'uri' in activeTab.input) {
                            const tabUri = (activeTab.input as any).uri as vscode.Uri;
                            console.log('Tab URI found:', tabUri?.fsPath);
                            if (tabUri && tabUri.fsPath.endsWith('.svg')) {
                                uri = tabUri;
                                console.log('Method 2 - Using active tab URI:', uri.fsPath);
                            }
                        }
                    }
                } catch (error) {
                    console.log('Method 2 failed:', error);
                }
            }
            
            // Method 3: Check all visible text editors
            if (!uri) {
                const visibleEditors = vscode.window.visibleTextEditors;
                console.log('Visible editors count:', visibleEditors.length);
                for (const editor of visibleEditors) {
                    console.log('Visible editor:', editor.document.uri.fsPath);
                    if (editor.document.uri.fsPath.endsWith('.svg')) {
                        uri = editor.document.uri;
                        console.log('Method 3 - Using visible editor URI:', uri.fsPath);
                        break;
                    }
                }
            }
            
            // Method 4: Check all open text documents
            if (!uri) {
                const textDocuments = vscode.workspace.textDocuments;
                console.log('Text documents count:', textDocuments.length);
                for (const document of textDocuments) {
                    console.log('Text document:', document.uri.fsPath);
                    if (document.uri.fsPath.endsWith('.svg')) {
                        uri = document.uri;
                        console.log('Method 4 - Using open document URI:', uri.fsPath);
                        break;
                    }
                }
            }
            
            // Method 5: Ask user to select SVG file
            if (!uri) {
                console.log('Method 5 - Prompting user to select SVG file');
                const selectedFiles = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: {
                        'SVG files': ['svg']
                    },
                    title: 'Select SVG file to convert'
                });
                
                if (selectedFiles && selectedFiles.length > 0) {
                    uri = selectedFiles[0];
                    console.log('Method 5 - User selected URI:', uri.fsPath);
                }
            }
        }

        // Final validation
        if (!uri || !uri.fsPath.endsWith('.svg')) {
            console.log('Final check failed - uri:', uri?.fsPath);
            vscode.window.showErrorMessage('Could not find an SVG file. Please open an SVG file or use the command again to select one.');
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