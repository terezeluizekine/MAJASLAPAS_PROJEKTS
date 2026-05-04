const calGrid = document.getElementById('calendar-grid');
const calTitle = document.getElementById('cal-title');
const calPrevBtn = document.getElementById('cal-prev');
const calNextBtn = document.getElementById('cal-next');
const calTodayBtn = document.getElementById('cal-today');
const calDetail = document.getElementById('calendar-detail');
const calDetailTitle = document.getElementById('cal-detail-title');
const calTodosList = document.getElementById('cal-todos-list');
const calEventsList = document.getElementById('cal-events-list');
const eventForm = document.getElementById('event-form');
const eventInput = document.getElementById('event-input');

const MONTH_NOM = ['Janvāris','Februāris','Marts','Aprīlis','Maijs','Jūnijs','Jūlijs','Augusts','Septembris','Oktobris','Novembris','Decembris'];
const MONTH_NOM_uncap = ['janvāris','februāris','marts','aprīlis','maijs','jūnijs','jūlijs','augusts','septembris','oktobris','novembris','decembris'];
const WEEKDAY_NAMES = ['svētdiena','pirmdiena','otrdiena','trešdiena','ceturtdiena','piektdiena','sestdiena'];
const PRIORITY_BADGE = { high: 'A', medium: 'V', low: 'Z' };

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let selectedDate = null;

function pad(n) { return String(n).padStart(2, '0'); }
function toISO(year, month, day) { return `${year}-${pad(month + 1)}-${pad(day)}`; }
function todayISO() {
    const t = new Date();
    return toISO(t.getFullYear(), t.getMonth(), t.getDate());
}

function getEvents() {
    return JSON.parse(localStorage.getItem('calendarEvents') || '{}');
}
function saveEvents(events) {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
}
function getEventsForDate(iso) {
    return (getEvents()[iso] || []);
}
function getTodosForDate(iso) {
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    return todos.filter(t => t.deadline === iso);
}

function renderCalendar() {
    calTitle.textContent = `${MONTH_NOM[currentMonth]} ${currentYear}`;
    calGrid.innerHTML = '';

    // Mēneša pirmā diena, pielāgota pirmdienai kā nedēļas sākumam
    let startDay = new Date(currentYear, currentMonth, 1).getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const events = getEvents();
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const todoDates = new Set(todos.filter(t => t.deadline).map(t => t.deadline));

    const today = todayISO();
    const cellCount = 42; // 6 nedēļas

    for (let i = 0; i < cellCount; i++) {
        let day, year, month, isOtherMonth = false;

        if (i < startDay) {
            day = lastDayOfPrevMonth - (startDay - i - 1);
            month = currentMonth - 1;
            year = currentYear;
            if (month < 0) { month = 11; year--; }
            isOtherMonth = true;
        } else if (i >= startDay + lastDayOfMonth) {
            day = i - startDay - lastDayOfMonth + 1;
            month = currentMonth + 1;
            year = currentYear;
            if (month > 11) { month = 0; year++; }
            isOtherMonth = true;
        } else {
            day = i - startDay + 1;
            month = currentMonth;
            year = currentYear;
        }

        const iso = toISO(year, month, day);
        const cell = document.createElement('div');
        cell.className = 'cal-cell';
        if (isOtherMonth) cell.classList.add('other-month');
        if (iso === today) cell.classList.add('today');
        if (iso === selectedDate) cell.classList.add('selected');

        const dayOfWeek = i % 7;
        if (dayOfWeek === 5 || dayOfWeek === 6) cell.classList.add('weekend');

        cell.innerHTML = `<span class="cal-day-num">${day}</span>`;

        const hasTodos = todoDates.has(iso);
        const hasEvents = (events[iso] || []).length > 0;

        const todosForDay = todos.filter(t => t.deadline === iso);
        const eventsForDay = events[iso] || [];

        const content = document.createElement('div');
        content.className = 'cal-content';

        [...todosForDay.slice(0, 2)].forEach(t => {
            const el = document.createElement('div');

            let priorityClass = '';
            if (t.priority) priorityClass = `priority-${t.priority}`;

            el.className = `cal-mini-item todo ${priorityClass}`;
            el.textContent = t.text;

            el.title = t.text;

            content.appendChild(el);
        });

        [...eventsForDay.slice(0, 2)].forEach(e => {
            const el = document.createElement('div');
            el.className = 'cal-mini-item event';
            el.textContent = e.text;

            el.title = e.text;
            
            content.appendChild(el);
        });

        // ja ir vairāk nekā 2
        const extraCount = todosForDay.length + eventsForDay.length - 2;
        if (extraCount > 0) {
            const more = document.createElement('div');
            more.className = 'cal-more';
            more.textContent = `+${extraCount}`;
            content.appendChild(more);
        }

        if (content.children.length > 0) {
            cell.appendChild(content);
        }

        cell.addEventListener('click', () => selectDate(iso));
        calGrid.appendChild(cell);
    }
}

function selectDate(iso) {
    selectedDate = iso;
    renderCalendar();
    renderDetail();
}

function renderDetail() {
    if (!selectedDate) {
        calDetail.style.display = 'none';
        return;
    }
    calDetail.style.display = 'block';

    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    calDetailTitle.textContent = `${y}. gada ${d}. ${MONTH_NOM_uncap[m - 1]}, ${WEEKDAY_NAMES[dateObj.getDay()]}`;

    // Uzdevumi
    const todos = getTodosForDate(selectedDate);
    calTodosList.innerHTML = '';
    if (todos.length === 0) {
        calTodosList.innerHTML = '<li class="cal-empty">Nav uzdevumu šim datumam.</li>';
    } else {
        todos.forEach(t => {
            const li = document.createElement('li');
            li.className = 'cal-item cal-todo-item';
            if (t.completed) li.classList.add('completed');
            const badge = t.priority
                ? `<span class="cal-priority cal-priority-${t.priority}" title="${ {high:'Augsta',medium:'Vidēja',low:'Zema'}[t.priority] } prioritāte">${PRIORITY_BADGE[t.priority]}</span>`
                : '<span class="cal-priority-spacer"></span>';
            li.innerHTML = `${badge}<span class="cal-item-text">${t.text}</span>`;
            calTodosList.appendChild(li);
        });
    }

    // Notikumi
    const events = getEventsForDate(selectedDate);
    calEventsList.innerHTML = '';
    if (events.length === 0) {
        calEventsList.innerHTML = '<li class="cal-empty">Nav notikumu šim datumam.</li>';
    } else {
        events.forEach((evt, idx) => {
            const li = document.createElement('li');
            li.className = 'cal-item cal-event-item';
            li.innerHTML = `<span class="cal-item-text">${evt.text}</span><button class="cal-delete" title="Dzēst">×</button>`;
            li.querySelector('.cal-delete').addEventListener('click', () => deleteEvent(idx));
            calEventsList.appendChild(li);
        });
    }
}

function addEvent(text) {
    if (!selectedDate || !text.trim()) return;
    const events = getEvents();
    if (!events[selectedDate]) events[selectedDate] = [];
    events[selectedDate].push({ text: text.trim() });
    saveEvents(events);
    renderCalendar();
    renderDetail();
}

function deleteEvent(idx) {
    const events = getEvents();
    if (events[selectedDate]) {
        events[selectedDate].splice(idx, 1);
        if (events[selectedDate].length === 0) delete events[selectedDate];
        saveEvents(events);
    }
    renderCalendar();
    renderDetail();
}

calPrevBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
});

calNextBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
});

calTodayBtn.addEventListener('click', () => {
    const now = new Date();
    currentMonth = now.getMonth();
    currentYear = now.getFullYear();
    selectDate(todayISO());
});

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addEvent(eventInput.value);
    eventInput.value = '';
});

// Pārzīmē, kad pārslēdzas uz kalendāra cilni — paķer jaunus uzdevumus
const observer = new MutationObserver(() => {
    if (document.body.dataset.active === 'kalendars') {
        renderCalendar();
        if (selectedDate) renderDetail();
    }
});
observer.observe(document.body, { attributes: true, attributeFilter: ['data-active'] });

renderCalendar();