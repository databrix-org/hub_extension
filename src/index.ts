import {
  ConnectionLost,
  IConnectionLost,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  JupyterLab
} from '@jupyterlab/application';

import {
  Dialog,
  showDialog
} from '@jupyterlab/apputils';
import { ITranslator } from '@jupyterlab/translation';
import { ServerConnection, ServiceManager } from '@jupyterlab/services';

/**
 * Initialization data for the dialog-extension.
 */
 const connectionlost: JupyterFrontEndPlugin<IConnectionLost> = {
   id: 'databrix-hub-extension:connectionlost',
   description:
     'Provides a service to be notified when the connection to the hub server is lost.',
   requires: [JupyterFrontEnd.IPaths],
   optional: [JupyterLab.IInfo],
   activate: (
     app: JupyterFrontEnd,
     paths: JupyterFrontEnd.IPaths,
     translator: ITranslator,
     info: JupyterLab.IInfo | null
   ): IConnectionLost => {
     const trans = translator.load('jupyterlab');
     const hubPrefix = paths.urls.hubPrefix || '';
     const baseUrl = paths.urls.base;

     // Return the default error message if not running on JupyterHub.
     if (!hubPrefix) {
       return ConnectionLost;
     }

     // If we are running on JupyterHub, return a dialog
     // that prompts the user to restart their server.
     let showingError = false;
     const onConnectionLost: IConnectionLost = async (
       manager: ServiceManager.IManager,
       err: ServerConnection.NetworkError
     ): Promise<void> => {
       if (showingError) {
         return;
       }

       showingError = true;
       if (info) {
         info.isConnected = false;
       }
       console.log('Databrix restart dialog is started!');
       const result = await showDialog({
         title: trans.__('Server unavailable or unreachable'),
         body: trans.__(
           'Your server at %1 is not running.\nxxxxxxxxxxxx?',
           baseUrl
         ),
         buttons: [
           Dialog.okButton({ label: trans.__('Restart') }),
           Dialog.cancelButton({ label: trans.__('Dismiss') })
         ]
       });

       if (info) {
         info.isConnected = true;
       }
       showingError = false;

       if (result.button.accept) {
         await app.commands.execute("help:jupyter-forum");
       }
     };
     return onConnectionLost;
   },
   autoStart: true,
   provides: IConnectionLost
 };

export default connectionlost;
