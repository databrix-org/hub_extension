import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
/**
 * Initialization data for the databrix_hub_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'databrix_hub_extension:plugin',
  description: 'A JupyterLab extension for hub_extension from databrix Project',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension databrix_hub_extension is activated!');

    // Identify the command you want to override (or hide)
    const commandToRemove = 'hub:restart';
    console.log('Available commands:', app.commands.listCommands());
    // Check if the command exists
    if (app.commands.hasCommand(commandToRemove)) {
      // Override the command with a no-op or a function that throws an error
      console.log('hub:restart is removed!');
      app.commands.addCommand(commandToRemove, {
        execute: () => {
          window.open("www.databrix.org", '_blank');
        },
        label: 'databrix restart Command',
        isVisible: () => false, // Optional: Hide it from the palette
      });

      // Notify the command palette that the command list has changed
      app.commands.notifyCommandChanged();
    }
    console.log('hub:restart is NOT removed!');
  }
};

export default plugin;
