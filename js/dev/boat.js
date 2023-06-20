const boat = getClass('boat')[0];
boat.style.width = window.innerHeight / 3 + 'px';
function sortLabels() {
    for (let i = 0; i < settings.boat.seats * 2; i++) {
        var label = getClass('label')[i]
        var part = getClass('part')[Math.floor( i / 2 )]
        var coords = part.getBoundingClientRect()
        if (coords.x) {
            label.style.top = 'unset';
            label.style.left = 'unset';
            label.style.right = 'unset';
            label.style.top = coords.top + 'px';
            if (i % 2 == 1) label.style.left = coords.left + ( window.innerHeight / 3 ) + 'px';
            else label.style.right = coords.right + 'px';
        }
    }
}
window.addEventListener('resize', () => {
    boat.style.width = window.innerHeight / 3 + 'px';
    sortLabels()
})
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
        for (let i = 0; i < parseInt(settings.boat.seats, 10) * 2; i++) {
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