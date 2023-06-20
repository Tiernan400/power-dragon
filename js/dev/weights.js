window.settings = JSON.parse(file.get(PATH.settings));
window.weights = JSON.parse(file.get(PATH.weights));
weights = weights.sort(DynamicSort('name'))
for (let i = 0; i < weights.length; i++) {
    get('list').innerHTML += `<div>
    <span>${weights[i].name}</span>
    <span>${weights[i].weight}</span>
    <span>
        <select onchange="weights[${i}].side=this.value.toLowerCase();updateWeights();">
            <option${(weights[i].side=='any')?' selected':''}>Any</option>
            <option${(weights[i].side=='left')?' selected':''}>Left</option>
            <option${(weights[i].side=='right')?' selected':''}>Right</option>
        </select>
    </span>
    <span><input onchange="active(${i}, this)" name="person-check" type="checkbox"${weights[i].active&&' checked'}/></span>
    <span><button style="background:red;border-radius:3px;" onclick="deleteWeight(${i});">Delete</button></span>
</div>`;
}
if (settings.personalisation.startMaximised == false) {
    get('switch-maximise').click()
    menu.getMenuItemById("start-max").checked = false;
}
if (settings.personalisation.enableHardwareAcceleration == false) get('switch-hardware-acceleration').click()
window.addEventListener('load', () => {
    if (settings.personalisation.server == false) get('switch-server').click()
    get('switch-server').setAttribute('onswitch', "updateSettings('personalisation', 'server', !this.vl, true, true);")
})
get('theme-span').innerHTML = settings.personalisation.theme.capitaliseFirstLetter() + " <span style='float:right;'>&blacktriangledown;</span>";
function updateSettings(section, setting, value, restartRequired = false, convert2Bool) {
    if (section && setting) {
        if (convert2Bool == true || convert2Bool == false) value = value?true:false;
        settings[section][setting] = value;
        if (restartRequired) alert('A restart of the app is required for all changes to take effect')
        if (setting == 'theme') {
            get('theme-span').innerHTML = value.capitaliseFirstLetter() + " <span style='float:right;'>&blacktriangledown;</span>";
            ipcRenderer.send('set-theme', value)
        }
    }
    file.put(PATH.settings, JSON.stringify(settings));
}
function updateWeights() {
    weights = weights.sort(DynamicSort('name'))
    file.put(PATH.weights, JSON.stringify(weights));
    get('list').innerHTML = '';
    for (let i = 0; i < weights.length; i++) {
        get('list').innerHTML += `<div>
<span>${weights[i].name}</span>
<span>${weights[i].weight}</span>
<span>
<select onchange="weights[${i}].side=this.value.toLowerCase();updateWeights();">
    <option${(weights[i].side=='any')?' selected':''}>Any</option>
    <option${(weights[i].side=='left')?' selected':''}>Left</option>
    <option${(weights[i].side=='right')?' selected':''}>Right</option>
</select>
</span>
<span><input onchange="active(${i}, this)" name="person-check" type="checkbox"${weights[i].active&&' checked'}/></span>
<span><button style="background:red;border-radius:3px;" onclick="deleteWeight(${i});">Delete</button></span>
</div>`;
    }
    get('balancer').getElementsByClassName('overlay')[0].style.display = 'flex';
}
function deleteWeight(i) {
    confirm("Are you sure that you want to delete "+weights[i].name+" from this list?", `(function(res) {
        if (res == 1) {
            weights.splice(${i}, 1);
            updateWeights();
        }
    })(\${c})`)
}
function active(index, input) {
    weights[index].active = input.checked;
    updateWeights()
}
get('select-all').addEventListener('change', (e) => {
    for (let i = 0; i < weights.length; i++) {
        weights[i].active = e.target.checked;
    }
    updateWeights()
})