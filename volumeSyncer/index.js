// set the Apple Music Volume to the same level as the system volume
// OSX MAC ONLY
const { exec } = require('child_process');

const getVolume = () => {
  return new Promise((resolve, reject) => {
    exec('osascript -e "output volume of (get volume settings)"', (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
};

const getMusicVolume = () => {
  return new Promise((resolve, reject) => {
    exec('osascript -e "tell application \\"Music\\" to sound volume"', (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
};

const setVolume = (volume) => {
  return new Promise((resolve, reject) => {
    exec(`osascript -e "tell application \\"Music\\" to set sound volume to ${volume}"`, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
};

// log starting
const startMsg = `Starting Volume Syncer`;
console.log(startMsg);
exec(`noti '${startMsg}' 'Volume Sync'`);

let cachedSystemVolume = 0;

const syncVolume = async () => {
  const [systemVolume, musicVolume] = [await getVolume(), await getMusicVolume()];

  if (systemVolume !== musicVolume && systemVolume !== cachedSystemVolume) {
    cachedSystemVolume = systemVolume;
    const msg = `'Syncing System Volume (Volume: ${systemVolume}) with Apple Music (Volume: ${musicVolume})' 'Volume Sync'`;
    console.log(msg);
    // use cli app "noti Message From" to display a notification
    exec(`noti ${msg}`);
    await setVolume(systemVolume);
  }
};

setInterval(syncVolume, 500);

// this basically the apple script, but in js
// -- Keep Apple Music Volume in sync with System Volume

// property systemVolume : 0
// property musicVolume : 0

// on getVolume()
//   return (do shell script "osascript -e 'output volume of (get volume settings)'")
// end getVolume

// on getMusicVolume()
//   tell application "Music"
//     return sound volume
//   end tell
// end getMusicVolume

// on setVolume(volume)
//   -- set Apple Music volume
//   tell application "Music"
//     set sound volume to volume
//   end tell
// end setVolume

// repeat
//   set systemVolume to getVolume()
//   set musicVolume to getMusicVolume()

//   if systemVolume is not musicVolume then

//     -- use cli app "noti Message From" to display a notification
//     do shell script "noti 'Syncing Apple Music (Volume: " & musicVolume & ") with System Volume (Volume: " & systemVolume & ")' 'Volume Sync'"

//     setVolume(systemVolume)
//   end if

//   delay 1
// end repeat
