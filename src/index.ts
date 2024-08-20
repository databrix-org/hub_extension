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
            Dialog.okButton({ label: trans.__('Restart') }),
          ]
        });

        if (info) {
          info.isConnected = true;
        }

        if (result.button.accept) {
          window.location.href = '';
        }
      };
      return onConnectionLost;
   },
   autoStart: true,
   provides: IConnectionLost
 };

 /**
  * Idle Warning extension.
  */


const idlewarnextension: JupyterFrontEndPlugin<void> = {
  id: 'idle-culler-warning',
  autoStart: true,
  requires: [ITranslator],
  activate: (
    app: JupyterFrontEnd,
    translator: ITranslator,) => {

    const trans = translator.load('jupyterlab');
    console.log('JupyterLab extension idle-culler-warning is activated!');

    const warningTime = 1 * 60 * 1000; // 1 minute

    let timeoutId: number;
    let timeoutId2: number;

    const idleCheck = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        clearTimeout(timeoutId2);
      }
      timeoutId = window.setTimeout(async() => {
        const result = await showDialog({
          title: trans.__('Are you still online?'),
          body: trans.__(
            'Your session will be stopped if no activity is detected in the next minute.'
          ),
          buttons: [
            Dialog.okButton({ label: trans.__('YES') }),
          ]
        });
        if (result.button.accept) {
          clearTimeout(timeoutId);
          console.log('User is still online.');
        }
      }, warningTime);

      timeoutId2 = window.setTimeout(idleredirect, 2 * warningTime);
    };

    window.addEventListener('mousemove', idleCheck);
    window.addEventListener('keydown', idleCheck);
    window.addEventListener('click', idleCheck);
    window.addEventListener('scroll', idleCheck);
  }
};

function idleredirect() {
  // Redirect the user to a specific page after the timeout
  window.location.href = 'https://databrix.org'; // Replace with your target URL
}

export default [
  connectionlost,
  idlewarnextension
] as JupyterFrontEndPlugin<any>[];
