import {

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
   requires: [JupyterFrontEnd.IPaths, ITranslator],
   optional: [JupyterLab.IInfo],
   activate: (
     app: JupyterFrontEnd,
     paths: JupyterFrontEnd.IPaths,
     translator: ITranslator,
     info: JupyterLab.IInfo | null
   ): IConnectionLost => {
     const trans = translator.load('jupyterlab');

     const onConnectionLost: IConnectionLost = async (
        manager: ServiceManager.IManager,
        err: ServerConnection.NetworkError
      ): Promise<void> => {

        const result = await showDialog({
          title: trans.__('Server unavailable or unreachable'),
          body: trans.__(
            'Your server is not running.\nYou have been inactive for a long time, or Jupyterhub has shut down your server.\nPlease Login again!'
          ),
          buttons: [
            Dialog.okButton({ label: trans.__('Homepage') }),
            Dialog.cancelButton({ label: trans.__('Dismiss') })
          ]
        });

        if (info) {
          info.isConnected = true;
        }

        if (result.button.accept) {
          window.location.href = 'www.databrix.org';
        }
      };
      return onConnectionLost;
   },
   autoStart: true,
   provides: IConnectionLost
 };

export default connectionlost;
