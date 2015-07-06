/* global navigator */

class AppLauncher {
  /**
   * Launches an app or returns an error
   * @param appName {String} The app to launch
   */
  static launch (appName, entryPoint, callback) {
    this.findByName(appName, (err, app) => {
      if (err) {
        callback(err);
        return;
      }

      app.launch(entryPoint);
    });
  }

  /**
   * Finds an app by name
   * @param appName {String} The app to find
   */
  static findByName (appName, callback) {
    if (!navigator.mozApps || !navigator.mozApps.mgmt) {
      callback(Error('navigator.mozApps not found'));
      return;
    }

    var allApps = navigator.mozApps.mgmt.getAll();

    allApps.onsuccess = () => {
      var installedApps = allApps.result;
      var foundApp = installedApps.find((app, index, array) => {
        return app.manifest.name.toLowerCase() === appName.toLowerCase();
      });

      if (foundApp) {
        callback(null, foundApp);
      }
      else {
        callback(Error('App (' + appName + ') not found.'));
      }
    };

    allApps.onerror = callback;
  }
}


export default AppLauncher;
