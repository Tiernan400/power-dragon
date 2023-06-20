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
    label: 'Add Person',
    click() {
        tab(get('weight-tab'))
        addPerson(false)
    }
}))
window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    menu.popup(remote.getCurrentWindow())
}, false)
window.addEventListener('load', () => {
    menu.getMenuItemById("theme-"+settings.personalisation.theme).checked = true
})