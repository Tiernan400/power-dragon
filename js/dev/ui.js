function tab(el) {
    if (!el.classList.contains('focused')) {
        for (let i = 0; i < getClass('tab').length; i++) {
            getClass('tab')[i].classList = 'tab';
        }
        el.classList.toggle('focused');
        for (let i = 0; i < document.getElementsByTagName('content').length; i++) {
            document.getElementsByTagName('content')[i].style.display = 'none';
        }
        get(el.getAttribute('linked')).style.display = 'block';
        var t = el.getAttribute('linked');
        if (t == 'balancer') sortLabels()
        newTitle("Power Dragon - "+t.capitaliseFirstLetter())
    }
}
function addPerson(complete = false) {
    if (!complete) {
        get('add-modal').style.display = 'block';
    } else {
        if (get('new-name').value != '' && get('new-weight').value != '') {
            var newPerson = {
                name: get('new-name').value,
                weight: get('new-weight').value,
                side: get('new-dropdown').getAttribute('value'),
                active: true
            }
            weights.push(newPerson)
            updateWeights()
            get('add-modal').style.display = 'none';
            get('new-name').value = '';
            get('new-weight').value = '';
            get('new-dropdown').setAttribute('value', 'any')
        } else {
            alert('Please fill in all the values', 'warn')
        }
    }
}
get('modal-close').addEventListener('click', () => {
    get('add-modal').style.display = 'none';
})
get('modal-close1').addEventListener('click', () => {
    get('add-modal1').style.display = 'none';
})
get('save-screenshot').addEventListener('click', () => {
    get('add-modal1').style.display = 'none';
})