import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the databrix_hub_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'databrix_hub_extension:plugin',
  description: 'A JupyterLab extension for hub_extension from databrix Project',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension databrix_hub_extension is activated!');
    const { commands } = app;
    // Identify the command you want to override (or hide)
    const commandToRemove = 'hub:restart';
    // Check if the command exists
    if (commands.hasCommand(commandToRemove)) {
      // Override the command with a no-op or a function that throws an error
      commands.addCommand(commandToRemove, {
        execute: () => {
          window.open("www.databrix.org", '_blank');
        },
        label: 'databrix restart Command',
        isVisible: () => false, // Optional: Hide it from the palette
      });

      // Notify the command palette that the command list has changed
      commands.notifyCommandChanged();
    }
  }
};

export default plugin;
