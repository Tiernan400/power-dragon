const remote = require('@electron/remote')
const { Menu, MenuItem } = remote
const menu = new Menu()
menu.append(new MenuItem ({
    label: 'Personalisation',
    submenu: [
        new MenuItem({
            label: 'Start Fullscreen',
            id: 'start-max',
            type: 'checkbox',
            checked: true,
            click() {
                get('switch-maximise').click()
            }
        }),
        new MenuItem({ type: 'separator' }),
        new MenuItem({
            label: 'Theme',
            enabled: false
        }),
        new MenuItem({
            label: 'System',
            id: 'theme-system',
            type: 'radio',
            click() {
                updateSettings('personalisation', 'theme', 'system')
            }
        }),
        new MenuItem({
            label: 'Light',
            id: 'theme-light',
            type: 'radio',
            click() {
                updateSettings('personalisation', 'theme', 'light')
            }
        }),
        new MenuItem({
            label: 'Dark',
            id: 'theme-dark',
            type: 'radio',
            click() {
                updateSettings('personalisation', 'theme', 'dark')
            }
        })
    ]
}))
menu.append(new MenuItem ({
    label: 'New',
    submenu: [
        new MenuItem ({
            label: 'Person',
            click() {
                tab(get('weight-tab'))
                addPerson(false)
            }
        }),
        new MenuItem ({
            label: 'Boat',
            click() {
                tab(get('boat-tab'))
                addBoat(false)
            }
        })
    ]
}))
// menu.append(new MenuItem ({
//     label: 'Dev Tools',
//     click() {
//         remote.getCurrentWindow().webContents.openDevTools();
//     }
// }))
// menu.append(new MenuItem ({
//     label: 'Reload',
//     click() {
//         remote.getCurrentWindow().reload();
//     }
// }))
let boatclicked = -1;
const editMenu = new Menu()
editMenu.append(new MenuItem ({
    label: 'Edit',
    submenu: [
        new MenuItem({
            label: 'Boat Name',
            click() {
                ;
            }
        }),
        new MenuItem({
            label: 'No. of Seats',
            click() {
                ;
            }
        })
    ]
}))
editMenu.append(new MenuItem({ type: 'separator' }))
editMenu.append(new MenuItem({
    label: 'Delete',
    click() {
        deleteBoat(boatclicked)
    }
}))
window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    menu.popup(remote.getCurrentWindow())
}, false)
window.addEventListener('load', () => {
    menu.getMenuItemById("theme-"+settings.personalisation.theme).checked = true
})