const nav = document.getElementById('nav');
const pill = document.getElementById('navPill');
const items = nav.querySelectorAll('.nav-item');

function movePill(target) {
    const navRect = nav.getBoundingClientRect();
    const itemRect = target.getBoundingClientRect();
    pill.style.width = itemRect.width + 'px';
    pill.style.left = (itemRect.left - navRect.left + nav.scrollLeft) + 'px';
}

function activate(item) {
    items.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    movePill(item);
    document.body.dataset.active = item.dataset.target;
}

items.forEach(item => item.addEventListener('click', () => activate(item)));

window.addEventListener('load', () => {
    const active = nav.querySelector('.nav-item.active');
    if (active) movePill(active);
});

window.addEventListener('resize', () => {
    const active = nav.querySelector('.nav-item.active');
    if (active) movePill(active);
});