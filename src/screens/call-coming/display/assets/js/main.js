// Add window loaded event
window.addEventListener("DOMContentLoaded", () => {
    let avatarElement = document.querySelector('.js-avatar');
    let nameElement = document.querySelector('.js-name');
    let btnDecline = document.querySelector('.js-btn-decline');
    let btnAccept = document.querySelector('.js-btn-accept');

    if(ipcRenderer) {
        ipcRenderer.on('INCOMING_CALL_DATA', (data) => {
            const { user } = data
            if(!user) return
            const {name, avatar} = user
            avatarElement.src = avatar;
            nameElement.innerText = name;
        });

        btnDecline.addEventListener('click', () => {
            ipcRenderer.send('CALL_RESPONSE', 'DECLINE');
        });

        btnAccept.addEventListener('click', () => {
            ipcRenderer.send('CALL_RESPONSE', 'ACCEPT');
        });
    }
});