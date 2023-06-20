function DynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
Element.prototype.getTag = function(tag) { return this.getElementsByTagName(tag) }
Array.prototype.swap = function(i1 = 0, i2 = 0) {
    var d = this[i1]
    this[i1] = this[i2]
    this[i2] = d
    return this
}
const get = (id) => { return document.getElementById(id) }
const getClass = (name) => { return document.getElementsByClassName(name) }
String.prototype.capitaliseFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}
const { ipcRenderer } = require('electron')
const { app } = require('@electron/remote')
const fs = require('fs')
const path = require('path')
window.addEventListener('load', () => ipcRenderer.send('loaded'))
const file = {
    get: function(f) {
        return fs.readFileSync(f)
    },
    put: function(f, c, o) {
        return fs.writeFileSync(f, c, o)
    }
}
const PATH = {
    settings: path.join(app.getPath('userData'), 'settings.json'),
    weights: path.join(app.getPath('userData'), 'weights.json')
}
function newTitle(title) {
    ipcRenderer.send('set-title', title)
}
window.alert = function(msg, type) {
    ipcRenderer.send('alert', msg, type)
}
window.confirm = function(msg, callback) {
    ipcRenderer.send('confirm', msg, callback)
}