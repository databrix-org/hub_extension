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
import { PageConfig } from '@jupyterlab/coreutils';

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

      timeoutId2 = window.setTimeout(idleculling, warningTime + 60000);
    };

    window.addEventListener('mousemove', idleCheck);
    window.addEventListener('keydown', idleCheck);
    window.addEventListener('click', idleCheck);
    window.addEventListener('scroll', idleCheck);
  }
};

async function idleculling() {
  const currentUrl = window.location.href
  const match = currentUrl.match(/\/user\/([^\/]+)\/lab/);
  const servername = match ? match[1] : null;
  const apiUrl = `http://0.0.0.0:8081/jupyterhub/hub/api/users/${servername}/server`;
  console.log('HUB API URL: ', apiUrl );
  const token = PageConfig.getToken();

  if (!token) {
  throw new Error('API token is not available from PageConfig.');
  }

  let responseData: any;

  try {
      const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `token ${token}`,
          }
      });

      if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      responseData = await response.json();
      console.log('Response Data:', responseData);



  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

export default [
  connectionlost,
  idlewarnextension
] as JupyterFrontEndPlugin<any>[];
