/* -----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
import {
  ConnectionLost,
  IConnectionLost,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  JupyterLab
} from '@jupyterlab/application';
import { Dialog, ICommandPalette, showDialog } from '@jupyterlab/apputils';
import { URLExt, PageConfig } from '@jupyterlab/coreutils';
import { ServerConnection, ServiceManager } from '@jupyterlab/services';
import { ITranslator } from '@jupyterlab/translation';

/**
 * The command IDs used by the plugin.
 */
export namespace CommandIDs {

  export const restart: string = 'databrix:restart';
}

/**
 * Activate the jupyterhub extension.
 */
function activateHubExtension(
  app: JupyterFrontEnd,
  paths: JupyterFrontEnd.IPaths,
  translator: ITranslator,
  palette: ICommandPalette | null
): void {
  const trans = translator.load('jupyterlab');
  const hubHost = paths.urls.hubHost || '';
  const hubPrefix = paths.urls.hubPrefix || '';
  //const hubUser = paths.urls.hubUser || '';
  //const hubServerName = paths.urls.hubServerName || '';

  console.log('JupyterLab extension databrix_hub_extension is activated!');
  // Bail if not running on JupyterHub.
  if (!hubPrefix) {
    return;
  }

  console.debug('hub-extension: Found configuration ', {
    hubHost: hubHost,
    hubPrefix: hubPrefix
  });

  // If hubServerName is set, use JupyterHub 1.0 URL.
  const spawnBase = URLExt.join(hubPrefix, 'spawn');
  // if (hubServerName) {
  //   const suffix = URLExt.join(spawnBase, hubUser, hubServerName);
  //   if (!suffix.startsWith(spawnBase)) {
  //     throw new Error('Can only be used for spawn requests');
  //   }
  //   restartUrl = hubHost + suffix;
  // }
  let serverName: string

  try {
    const baseUrl = PageConfig.getBaseUrl()  // e.g., /jupyterhub/user/xxx/
    // Use URL object to extract the path
    const urlObj = new URL(baseUrl);
    const path = urlObj.pathname;

    // Split the pathname into segments
    const segments = path.split('/').filter(segment => segment.length > 0);

    // Find the index of 'user'
    const userIndex = segments.indexOf('user');

    // Ensure 'user' is in the path and has a segment after it
    if (userIndex !== -1 && userIndex + 1 < segments.length) {
      // Return the segment immediately after 'user'
      serverName = segments[userIndex + 1];
    } else {
      // 'user' was not found or there is no segment after 'user'
      serverName = '';
    }
  } catch (error) {
    console.error('Invalid URL:', error);
    serverName = '';
  }


  const suffix = URLExt.join(spawnBase, serverName);
  let restartUrl = hubHost + suffix;
  console.log("restarturl: ", restartUrl); // Output: 'workspace_1'
  const { commands } = app;

  commands.addCommand(CommandIDs.restart, {
    label: trans.__('Restart Server'),
    caption: trans.__('Request that the Hub restart this server'),
    execute: () => {
      window.open(restartUrl, '_blank');
    }
  });
}

/**
 * Initialization data for the hub-extension.
 */
const databrixhubExtension: JupyterFrontEndPlugin<void> = {
  activate: activateHubExtension,
  id: 'databrix-hub-extension:plugin',
  description: 'Registers commands related to the hub server',
  requires: [JupyterFrontEnd.IPaths, ITranslator],
  optional: [ICommandPalette],
  autoStart: true
};

/**
 * The default JupyterLab connection lost provider. This may be overridden
 * to provide custom behavior when a connection to the server is lost.
 *
 * If the application is being deployed within a JupyterHub context,
 * this will provide a dialog that prompts the user to restart the server.
 * Otherwise, it shows an error dialog.
 */
const databrixconnectionlost: JupyterFrontEndPlugin<IConnectionLost> = {
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

      const result = await showDialog({
        title: trans.__('Server unavailable or unreachable'),
        body: trans.__(
          'You are inactive at %1 is not running.',
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
        await app.commands.execute(CommandIDs.restart);
      }
    };
    return onConnectionLost;
  },
  autoStart: true,
  provides: IConnectionLost
};

export default [
  databrixhubExtension,
  databrixconnectionlost
] as JupyterFrontEndPlugin<any>[];
