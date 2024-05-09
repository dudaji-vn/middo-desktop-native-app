# Middo Desktop app

> Middo is a web application that helps you translate text from one language to another. This is the desktop version of the Middo app built using Electron.js.

<img src="https://img.shields.io/badge/Status-Release-red" />
<img src="https://img.shields.io/badge/Platform-Windows%20%20%7C%20MacOS-lightgrey" />
<img src="https://img.shields.io/badge/Company-Dudaji-blue" />

## Run and Build Middo App

### Prerequisites

-  Node.js v18.0.0 or higher

### How to run the application in development mode?

1.  Clone the repository to your local machine
2.  Run `yarn` to install all the dependencies
3.  Run `yarn dev` to start the application in development mode

### How to build the application?

-  Run `yarn make` to build the application for your platform
-  Run `yarn publish` to build the application and publish it to the GitHub releases (you need to have a GitHub token in your environment variables)

## Development

**Events to communicate**
> use ipcMain and ipcRenderer to communicate between the main and renderer processes

- Use `ipcMain.on('event-name', callback)` to listen for events from the renderer process
- Use `ipcRenderer.send('event-name', data)` to send events to the main process
- Use `ipcRenderer.on('event-name', callback)` to listen for events from the main process
- Use `(window).webContents.send('event-name', data)` to send events to the main process

**Notification**
> This application use firebase cloud messaging to send notifications to the user

Configure the firebase cloud messaging in the `src/screens/main/preload.js` file

**Auto-updates**
> This application uses electron-updater to check for updates and automatically update the application

Configure the auto-updates in the `src/setup/auto-update.js` file
App will check for updates every time the app is started
App version should be updated in the `package.json` file
When a new version is released, the app will prompt the user to update the app



## Signing the application

### Windows (Using digicert)

> This guide covers the configuration of DigiCert KeyLocker on Windows-based systems.

**Configuring your certificate in DigiCert ONE:**

1. Log in to your DigiCert ONE account.
2. Click on the Manager menu at the top right-hand corner and select KeyLocker.
3. Click on the Get started menu.
4. Under Step 1: Set up your credentials and client tools, locate Create your API token and click on the Create button.
5. On the Create API token page, enter a Name for your API token as well as an End date (i.e. the date on which the API token will expire). Click on the Create button.
6. Your newly-created token will be displayed. Save the token to a safe location (it will not be possible to view the token again). Click on the Finish button.
7. You will be taken back to the Get Started menu. Locate Create your client authentication certificate and click on the Next button.
8. You will be prompted to generate a client certificate. Enter a Nickname, End date (i.e. expiry date) and click on the Generate certificate button.
9. You will be presented with the password for the client certificate. This password is only displayed once.
10. Click on the Download certificate button to download the newly-generated .p12 certificate. Once the certificate has been downloaded, click on Close.

>Note: This client certificate is used to authenticate with DigiCert ONE.

11. You will be taken back to the Get Started menu. Click on the Next button.
12. Locate Set up DigiCert KeyLocker client tools and click on the Download button. This will download the DigiCert KeyLocker Tools installer.
13. Run the DigiCert KeyLocker Tools installer; the file is named Keylockertools-windows-x64.exe.
14. Accept the license agreement.
15. Confirm the installation directory.
16. Click Install.
17. Once the setup has been completed, click on Finish.



**Configure Environmental Variables:**
1. Locate Environmental Variables via the Start Menu.
(Please ensure you use System variables)
2. The System Properties window will open. Click on the Environmental Variables button.
3. Edit the Path variable and create a new entry for the directory in which DigiCert KeyLocker Tools was installed. The default directory is C:\Program Files\DigiCert\DigiCert KeyLocker Tools\.
4. Edit the Path variable and create a new entry for the directory in which Sign Tools was installed. The default directory is C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64 . If you do not have Sign Tools installed, you can download it from the Microsoft website [https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/](https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/).
5. Create a new variable named SM_CLIENT_CERT_FILE and enter the location of your client authentication file.
6. Create a new variable named SM_HOST and set this to: https://clientauth.one.digicert.com
7. Create a new variable named SM_API_KEY and enter your API token string.
8. Create a new variable named SM_CLIENT_CERT_PASSWORD and enter the password for your client authentication certificate.
9. Open a command prompt and run the following command: smctl credentials save <API token> <client authentication certificate password> (If successful, you should see the following response: Credentials saved to OS store).
10. Run the following command: smctl keypair list (this should open a list of all certificates which are available in your DigiCert ONE account).
11. Run the following command: smctl healthcheck (this provides information on your KeyLocker configuration, including the API key; client certificate; permissions as well as the mapped signing tools).

12. Run command `smctl windows certsync` to sync the certificate to your local machine. If nothing is returned, you need to go to the DigiCert ONE account and sync the certificate manually. After syncing the certificate, run the command again to check if the certificate is synced.

13. Go to file `C:\Program Files\DigiCert\DigiCert KeyLocker Tools\DigiCert_Click_to_sign.msi` to install Signin Tools from KeyLocker Tools. 

14. After that, when you run the command `yarn make` to build the application and create the installer file. Just right-click on the installer file and click on `Digicert Click to Sign` to sign the installer file.

### MacOS - Apple Distribution Certificate
1. Create a new certificate using the Keychain Access app
Go to the `Keychain Access` app and click on `Certificate Assistant` -> `Request a Certificate from a Certificate Authority...` 
Fill in the details and click on `Save to disk` to save the certificate to your local machine.
It will generate a `.certSigningRequest` file. 

2. Create a new App ID
Go to the [Apple Developer](https://developer.apple.com/account/resources/identifiers/list) website and create a new App ID.

3. Create a new Apple Distribution Certificate
Go to the [Apple Developer](https://developer.apple.com/account/resources/certificates/list) website and create a new Apple Distribution Certificate. It will be required upload the `.certSigningRequest` file that you generated in step 1.
At the end of the process, you will be prompted to download the certificate. Double click on the downloaded file to install it on your machine.
Drag the certificate to the login keychain in the Keychain Access app.
***For me, it takes a few hours to reflect the certificate in the Keychain Access app.***

4. Fill in details in ```.env``` file
```
APPLE_ID= #APPLE_ID
APPLE_ID_PASSWORD= #APPLE_ID_PASSWORD
TEAM_ID= #APPLE_TEAM_ID
APP_BUNDLE_ID= #APP_BUNDLE_ID
```

5. Since, you just run the command `yarn make` to build the application, it will automatically sign the application. It will prompt you to enter the password of your Apple ID in the first run.
It will be take a few minutes to build and sign the application.

