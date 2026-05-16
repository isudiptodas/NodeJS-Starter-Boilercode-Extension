import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand(
		'nodejs-starter-code.createNodeStructure',
		async () => {

			const workspaceFolders = vscode.workspace.workspaceFolders;

			if (!workspaceFolders) {
				vscode.window.showErrorMessage('Open a project folder first.');
				return;
			}

			const rootPath = workspaceFolders[0].uri.fsPath;

			const folders = [
				'models',
				'routes',
				'controllers',
				'config'
			];

			let alreadySetup = true;

			// Check if folders present
			for (const folder of folders) {
				const folderPath = path.join(rootPath, folder);

				if (!fs.existsSync(folderPath)) {
					alreadySetup = false;
					fs.mkdirSync(folderPath);
				}
			}

			// Check if index.js present
			const indexPath = path.join(rootPath, 'index.js');

			if (!fs.existsSync(indexPath)) {
				alreadySetup = false;

				fs.writeFileSync(
					indexPath,
					`import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.get("/", (req, res) => {
  res.json({
    status: 200,
    message: "App is running"
  });
});

app.listen(PORT, () => {
  console.log(\`Server started on port \${PORT}\`)
});`
				);
			}

			// create .env file if not present
			const envPath = path.join(
				rootPath,
				'.env'
			);

			if (!fs.existsSync(envPath)) {
				alreadySetup = false;
				fs.writeFileSync(
					envPath,
					`PORT=5000`
				);
			}

			// If everything already exists
			if (alreadySetup) {
				vscode.window.showWarningMessage(
					'Project is already setup. Cannot modify.'
				);
				return;
			}

			exec(
				'npm init -y && npm install express dotenv cors cookie-parser',
				{ cwd: rootPath },
				(error) => {

					if (error) {
						vscode.window.showErrorMessage(
							'Dependencies installation failed.'
						);
						return;
					}
				}

			)

			vscode.window.showInformationMessage(
				'Node.js project structure created successfully with required dependency installed.'
			);

		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() { }