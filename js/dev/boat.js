function updateBoats() {
    settings.boats = settings.boats.sort(DynamicSort('name'))
    file.put(PATH.settings, JSON.stringify(settings))
    get('boat-list').innerHTML = '';
    for (let i = 0; i < settings.boats.length; i++) {
        get('boat-list').innerHTML += `<div class="super-card"><div class="card ${i==settings.boat?'selected':''}" onclick="settings.boat=${i};updateBoats()">
    <span class="edit lined" onclick="boatclicked=${i};editMenu.popup()"><svg fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>
    <span>${settings.boats[i].name}</span>
    <span>Seats: ${settings.boats[i].seats}</span>
</div></div>`;
    }
    get('boat-list').innerHTML += `<div class="card lined" onclick="addBoat(false)" title="New boat" style="cursor:pointer">
    <svg  xmlns="http://www.w3.org/2000/svg"  width="128"  height="128"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>
</div>`;
    get('balancer').getElementsByClassName('overlay')[0].style.display = 'flex';
    get('boat-container').innerHTML = '<div class="boat"></div>';
    if (settings.boat != -1) {
        get('dynamic-root').innerText = `:root { --part-height: ${100/settings.boats[settings.boat].seats}%; }`;
        boatPos = new Array()
        for (let i = 0; i < parseInt(settings.boats[settings.boat].seats, 10) * 2; i++) {
            if (i % 2) getClass('boat')[0].innerHTML += '<div class="part"></div>';
            boatPos[i] = 'SPACE';
            get('boat-container').innerHTML += `<div class="label"><span>${i}</span><b></b></div>`;
        }
        for (let i = 0; i < getClass('label').length; i++) {
            var cur = getClass('label')[i].getTag('span')[0]
            cur.addEventListener('click', (e) => {
                if (moving == -1) {
                    var cpath = e.composedPath()
                    var label = cpath[0].parentElement;
                    label.getTag('b')[0].classList = 'active';
                    moving = Array.from(getClass('label')).indexOf(label)
                } else {
                    var cpath = e.composedPath()
                    var label = cpath[0].parentElement;
                    var tb = label.getTag('b')[0]
                    var thisIndex = Array.from(getClass('label')).indexOf(label)
                    var origEl = getClass('label')[moving]
                    var ob = origEl.getTag('b')[0]
                    if (thisIndex == moving) {
                        origEl.getTag('b')[0].classList = '';
                        moving = -1;
                        return;
                    }
                    if (thisIndex % 2 != moving % 2) {
                        origEl.getTag('b')[0].classList = '';
                        alert('You cannot move people to the other side of the boat')
                        moving = -1;
                        return;
                    }
                    boatPos.swap(moving, thisIndex)
                    ob.classList = '';
                    ob.innerText = (boatPos[moving]=='SPACE')?'SPACE':`${boatPos[moving].n} (${boatPos[moving].w}kg)`;
                    tb.innerText = (boatPos[thisIndex]=='SPACE')?'SPACE':`${boatPos[thisIndex].n} (${boatPos[thisIndex].w}kg)`;
                    moving = -1;
                }
            })
        }
        sortLabels();
    }
}
function deleteBoat(i) {
    confirm("Are you sure that you want to delete "+settings.boats[i].name+" from this list?", `(function(res) {
        if (res == 1) {
            settings.boats.splice(${i}, 1);
            if (settings.boat == ${i}) settings.boat = -1;
            updateBoats();
        }
    })(\${c})`)
}
function sortLabels() {
    if (settings.boat == -1) return;
    for (let i = 0; i < settings.boats[settings.boat].seats * 2; i++) {
        var label = getClass('label')[i]
        var part = getClass('part')[Math.floor( i / 2 )]
        var coords = part.getBoundingClientRect()
        if (coords.x) {
            label.style.top = 'unset';
            label.style.left = 'unset';
            label.style.right = 'unset';
            label.style.top = coords.top + ( parseInt(getComputedStyle(part).height) - parseInt(getComputedStyle(label).height) ) / 2 - 5 + 'px';
            if (i % 2 == 1) label.style.left = `calc(${coords.left}px + 27% - 4px)`;
            else label.style.right = coords.right + 4 + 'px';
        }
    }
}
window.addEventListener('resize', sortLabels)
function tempBoat(alt) {
    if (alt == 'return') {
        for (let i = 0; i < boatPos.length; i++) {
            getClass('label')[i].getTag('b')[0].innerText = (boatPos[i]=='SPACE')?'SPACE':`${boatPos[i].n} (${boatPos[i].w}kg)`;
        }
        get('left-total').innerText = optimal.closest.totals[0];
        get('left-percent').innerText = optimal.closest.leftPercent.toString().substring(0, 5);
        get('right-total').innerText = optimal.closest.totals[1];
        get('right-percent').innerText = optimal.closest.rightPercent.toString().substring(0, 5);
        if (optimal.closest.balance > 0) {
            var percent = (optimal.closest.leftPercent - optimal.closest.rightPercent).toString().substring(0, 4);
            get('right-offset').innerText = '';
            get('left-offset').innerHTML = '+' + percent + '%<br>+' + optimal.closest.diff + 'kg';
        } else {
            var percent = (optimal.closest.rightPercent - optimal.closest.leftPercent).toString().substring(0, 4);
            get('left-offset').innerText = '';
            get('right-offset').innerHTML = '+' + percent + '%<br>+' + optimal.closest.diff + 'kg';
        }
    } else if (typeof alt == 'number' && optimal.alternatives[alt]) {
        b = optimal.alternatives[alt]
        for (let i = 0; i < parseInt(settings.boats[settings.boat].seats, 10) * 2; i++) {
            getClass('label')[i].getTag('b')[0].innerText = 'SPACE';
        }
        for (let i = 0; i < b.left.length; i++) {
            getClass('label')[i * 2].getTag('b')[0].innerText = b.left[i].n+' ('+b.left[i].w+'kg)';
        }
        for (let i = 0; i < b.right.length; i++) {
            getClass('label')[i * 2 + 1].getTag('b')[0].innerText = b.right[i].n+' ('+b.right[i].w+'kg)';
        }
        get('left-total').innerText = b.totals[0];
        get('left-percent').innerText = b.leftPercent.toString().substring(0, 5);
        get('right-total').innerText = b.totals[1];
        get('right-percent').innerText = b.rightPercent.toString().substring(0, 5);
        if (b.balance > 0) {
            var percent = (b.leftPercent - b.rightPercent).toString().substring(0, 4);
            get('right-offset').innerText = '';
            get('left-offset').innerHTML = '+' + percent + '%<br>+' + b.diff + 'kg';
        } else {
            var percent = (b.rightPercent - b.leftPercent).toString().substring(0, 4);
            get('left-offset').innerText = '';
            get('right-offset').innerHTML = '+' + percent + '%<br>+' + b.diff + 'kg';
        }
    }
}
function swap(altIndex) {
    confirm('Change to this boat position?', `(function(res) {
        if (res == 1) {
            var prevAlt = optimal.alternatives[${altIndex}];
            optimal.alternatives.splice(${altIndex}, 1);
            optimal.alternatives.push(optimal.closest);
            optimal.closest = prevAlt;
            for (let i = 0; i < optimal.closest.left.length; i++) {
                boatPos[i * 2] = optimal.closest.left[i];
                boatPos[i * 2 + 1] = optimal.closest.right[i];
            }
            get('alt-div').innerText = '';
            for (let i = 0; i < optimal.alternatives.length; i++) {
                get('alt-div').innerHTML += \`<div onmouseover="tempBoat(\${i})" onmouseout="tempBoat('return')" onclick="swap(\${i})">\${i + 1}</div>\`;
            }
        }
    })(\${c})`)
}