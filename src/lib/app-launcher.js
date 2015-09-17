/* global navigator */
import 'string_score';


class AppLauncher {
  /**
   * Launches an app or returns an error
   * @param appName {String} The app to launch
   * @param entryPoint {String} The entry point of the app
   * @param callback {Function} The function to callback
   */
  static launch (appName, entryPoint, callback) {
    this.findByName(appName, (err, app) => {
      if (err) {
        callback(err);
        return;
      }

      app.launch(entryPoint);

      callback();
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
      var highScore = 0;
      var foundApp;

      installedApps.forEach((app) => {
        var thisName = app.manifest.name.toLocaleLowerCase();
        var thisScore = thisName.score(appName);

        if (thisScore > highScore) {
          highScore = thisScore;
          foundApp = app;
        }
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
