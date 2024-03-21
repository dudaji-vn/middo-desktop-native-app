require('dotenv').config();
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { utils: { fromBuildIdentifier } } = require('@electron-forge/core');
const path = require("path");
module.exports = {
  buildIdentifier: 'prod',
  packagerConfig: {
    icon: path.join(process.cwd(), "src", "assets", "icon.icns"),
    asar: true,
    protocols: [
      {
        "name": "Middo",
        "schemes": ["middo"]
      }
    ],
    osxSign: {
      identity: process.env.TEAM_ID,
      hardenedRuntime: true,
      gatekeeperAssess: false,
      entitlements: path.join(process.cwd(), "entitlements.mac.plist"),
      entitlementsInherit: path.join(process.cwd(), "entitlements.mac.plist"),
    },
    osxNotarize: {
      tool: 'notarytool',
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.TEAM_ID,
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: 'Middo',
        icon: path.join(process.cwd(), "src", "assets", "icon.icns"),
        // background: path.join(process.cwd(), "src", "assets", "background-mac.tiff"),
        overwrite: true,
        format: 'ULFO',
      },
    },
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
