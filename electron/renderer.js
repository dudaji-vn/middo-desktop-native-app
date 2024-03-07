// const START_NOTIFICATION_SERVICE = 'PUSH_RECEIVER:::START_NOTIFICATION_SERVICE';
// const NOTIFICATION_SERVICE_STARTED = 'PUSH_RECEIVER:::NOTIFICATION_SERVICE_STARTED';
// const NOTIFICATION_SERVICE_ERROR = 'PUSH_RECEIVER:::NOTIFICATION_SERVICE_ERROR';
// const NOTIFICATION_RECEIVED = 'PUSH_RECEIVER:::NOTIFICATION_RECEIVED';
// const TOKEN_UPDATED = 'PUSH_RECEIVER:::TOKEN_UPDATED';

// // Listen for service successfully started
// ipcRenderer.on(NOTIFICATION_SERVICE_STARTED, (_, token) => {
//   console.log('service successfully started', token)
// })

// // Handle notification errors
// ipcRenderer.on(NOTIFICATION_SERVICE_ERROR, (_, error) => {
//   console.log('notification error::', error)
// })

// // Send FCM token to backend
// ipcRenderer.on(TOKEN_UPDATED, (_, token) => {
//   console.log('token updated::', token)
// })

// // Display notification
// ipcRenderer.on(NOTIFICATION_RECEIVED, (_, serverNotificationPayload) => {
//   console.log('display notification::', serverNotificationPayload)
// })

// // Start service
// const senderId = ''
// console.log('starting service and registering a client')
// ipcRenderer.send(START_NOTIFICATION_SERVICE, senderId)


