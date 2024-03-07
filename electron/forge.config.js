const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { utils: { fromBuildIdentifier } } = require('@electron-forge/core');
const { APPLE_ID, APPLE_PASSWORD, APPLE_TEAM_ID } = require('./config');

module.exports = {
  buildIdentifier: 'prod',
  packagerConfig: {
    asar: true,
    appBundleId: fromBuildIdentifier({ beta: 'middo', prod: 'middo' }),
    protocols: [
      {
        "name": "Middo",
        "schemes": ["middo"]
      }
    ]
    // osxSign: {},
    // osxNotarize: {
    //   tool: 'notarytool',
    //   appleId: APPLE_ID,
    //   appleIdPassword: APPLE_PASSWORD,
    //   teamId: APPLE_TEAM_ID
    // }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: 'Middo',
        background: 'src/assets/background.png',
        icon: 'src/assets/icon.icns',
        overwrite: true,
        contents: [
          {
            x: 110,
            y: 150,
          },
          {
            x: 240,
            y: 150,
            type: 'link',
            path: '/Applications',
          },
        ],
      },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        "mimeType": ["x-scheme-handler/middo"],
        "desktop": {
          "Name": "Middo",
          "Type": "Application",
          "Icon": "src/assets/icon.png",
          "Terminal": "false",
          "MimeType": "x-scheme-handler/middo"
        }
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
