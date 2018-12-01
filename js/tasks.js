var TASKS_NAME = 'tasks';
var STATE = {
    [TASKS_NAME]: [],
    formName: 'form1',
    calendar: 'calendar',
    showCalendar: false,
    calendarMonth: new Date(),
};

function updateLocalStorage(varName, objData) {//1 ф-я обновление хранилища
    // window.localStorage.setItem(varName, objData);
    var tmp = JSON.stringify(objData);
    localStorage.setItem(varName, tmp);//передать в хранилище ключ и значение ключа
    return true;
}

function getDataFromLocalStorage(varName) {// 2 ф-я извлечение данных из хранилища
    var tmp = JSON.parse(localStorage.getItem(varName));//достается значение по ключу из хранилища
    return tmp || [];
}

function initTaskContainer() {// 3 ф-я инициализация контейнера для ввода задач
    var data = STATE[TASKS_NAME] = getDataFromLocalStorage(TASKS_NAME); // загрузили данные из локал сторадж
    var keysCount = data.length || 0; // Object.keys(data).length || 0;
    clearFormList();

    if (!keysCount) {
        coreInsertLiToList({task: "На сегодня нет активных задач"});
    } else {
        for (var i = 0; i < keysCount; i++) {
            coreInsertLiToList(data[i], i, true);
        }
    }
}

function insertItemToList() { //4 ф-я срабатывает на добавлении задачи
    var task = document.getElementById('taskData').value;
    var errCounter = 0;
    task = task.trim();
    if (!task.length) {
        printErrorHelper('taskData', "Это поле обязательно для ввода - введите название задачи", true);
        errCounter++;
    }
    var reminder = document.getElementById('reminderData').value;
    reminder = reminder.trim();
    if (!reminder.length) {
        printErrorHelper('reminderData', "Дата задачи обязательна для ввода", true);
        errCounter++;
    }
    var check = document.getElementById('Check1').checked;
    if (errCounter) {
        return false;
    }
    console.log({task, reminder, check});
    STATE[TASKS_NAME].push({task, reminder, check}); //закладываем в стейт задачу
    emptyAllList(); // очищаем
    return true;
}

function updateFormAndState() { // 5 ф-я обновления формы задач и стейта
    updateLocalStorage(TASKS_NAME, STATE[TASKS_NAME]); //обновили хранилище
    clearForm(); //очистили форму
    initTaskContainer();// инициализировали контейнер
}

function printErrorHelper(id, msg, err = false) { // 6 ф-я добавления сообщения об ошибке
    var errorHelper = document.getElementById(id + 'Help');
    errorHelper.innerHTML = msg;
    if (err) {
        errorHelper.classList.add('text-danger');
    } else {
        errorHelper.classList.remove('text-danger');
    }
}

function coreInsertLiToList(data, index, task = false) { // 7 ф-я для добавления задач в форму

    var list = document.getElementById('task_list');
    var newListNode = document.createElement('li');
    newListNode.classList.add('list-group-item');
    if (task) {
        newListNode.innerHTML = (data.check ? '<i class="text-danger fa fa-exclamation-triangle"></i> &nbsp ' : '') +
            data.task + '<br /><span class="text-muted"><small>' +
            data.reminder + '</small></span> ' +
            '<span data-id="' + index + '" class="delete_ico" onclick="deleteNode(event)"><i class="fa fa-times"></i></span>';
        newListNode.setAttribute('data-type', 'task');
    }
    else {
        newListNode.innerHTML = data.task;
        newListNode.setAttribute('data-type', 'empty');
    }
    list.appendChild(newListNode);
}

function clearForm() { // 8 ф-я очистки формы
    document.getElementById(STATE.formName).reset();
    printErrorHelper('taskData', "Введите название занятия на завтра.");
    printErrorHelper('reminderData', "Введите дату и время напоминания.");

}

function emptyAllList() { //9 ф-я очистки готовой формы задач
    document.getElementById('task_list').innerHTML = '';
    updateFormAndState();
}

function deleteNode(event) { //9 ф-я удаления записей
    var tmp = event.target;
    var nodeToDelete = tmp.parentNode.getAttribute('data-id');
    if (nodeToDelete === undefined || nodeToDelete === null) {
        console.log('Shit on me: can\'t determine attribute data-id ', nodeToDelete);
        return false;
    }

    STATE[TASKS_NAME].splice(nodeToDelete, 1);
    updateFormAndState();

}

function handleClearList() { // 10 ф-я удаления списка задач по кнопке
    STATE[TASKS_NAME] = [];
    updateFormAndState();
}

function clearFormList() { // 11 ф-я для очистки формы задач
    var list = document.getElementById('task_list');
    list.innerHTML = '';
}


/////////////////////////////////////// CALENDAR ////////////////////
function showCalendar(event) { //12 ф-я показать календарь по кнопке
    event.stopPropagation();
    if (STATE.showCalendar) {
        return false;
    }

    var calendar = document.getElementById(STATE.calendar)
    var button = event.target;
    var closest = button.closest('.input-group-prepend').getBoundingClientRect();
    console.log(closest);
    calendar.style.top = closest.bottom;
    calendar.style.left = closest.left;
    calendar.style.display = "block";
    STATE.showCalendar = true;
}

function hideCalendar(event) { // 13 ф-я скрыть календарь по кнопке Отмена
    event.stopPropagation();
    console.log('IN hideCalendar ', STATE.showCalendar);
    if (!STATE.showCalendar) {
        return false;
    }
    calendar.style.display = "none";
    STATE.showCalendar = false;
    return true;

}

function buildCalendar(yearToOperate, monthToOperate) { // 14 вызывается ф-я для рисования календаря
    var dateToOperate = new Date(yearToOperate, monthToOperate);
    var year = dateToOperate.getFullYear();
    var month = dateToOperate.getMonth(); // месяц от 0 до 11, нужно прибавлять 1
    var curDate = new Date();

    var dayWeek = dateToOperate.getDay(); // от 0 до 6, причем 0 - это воскресение
    var maximumDaysInPrevMonth = getLastDay(year, month - 1);
    console.log('maximumDaysInPrevMonth = ', maximumDaysInPrevMonth, dateToOperate);
    dayWeek = dayWeek === 0 ? 7 : dayWeek;
    var firstDay = getFirstDayOfMonth(year, month);
    var j = 1; // это счетчик недель, которые выводятся в календарь
    var dayCounter = 1;
    var dayCounterAfter = 1;
    var str_out_week = '';
    var className = '';
    while (j < 7) {
        var str_out = '';
        for (var i = 1; i < 8; i++) {
            var tmpCellObject = {};

            if ((firstDay.dayWeek > i && j == 1)) { // если меньше чем 1е число текущего месяца
                var tmpDayMonth = (maximumDaysInPrevMonth + i + 1 - firstDay.dayWeek);
                if (yearToOperate < curDate.getFullYear()) {
                    className = ' class="not_current"';
                }
                else if (yearToOperate == curDate.getFullYear()) {
                    if (monthToOperate <= curDate.getMonth()) {
                        className = ' class="not_current"';
                    }
                    else {
                        className = '';
                    }
                }
                else {
                    className = '';
                }
                tmpCellObject = {
                    className: className,
                    dataFullDate: (tmpDayMonth + '.' + (month === 0 ? 12 : month) + '.' + (month === 0 ? yearToOperate - 1 : yearToOperate)),
                    dataDayMonth: tmpDayMonth,
                }
                ;
            } else if (dayCounter > firstDay.maxDays) { // если должны вывести день следующего месяца
                if (yearToOperate < curDate.getFullYear()) {
                    className = ' class="not_current"';
                }
                else if (yearToOperate == curDate.getFullYear()) {
                    if (monthToOperate < curDate.getMonth()) {
                        className = ' class="not_current"';
                    }
                    else {
                        className = '';
                    }
                }
                else {
                    className = '';
                }
                tmpCellObject = {
                    className: className,
                    dataFullDate: (dayCounterAfter + '.' + (month === 11 ? 1 : month + 2) + '.' + (month == 11 ? yearToOperate + 1 : yearToOperate)),
                    dataDayMonth: dayCounterAfter++,
                };
            } else {//ячейки для текущего месяца
                if (yearToOperate < curDate.getFullYear()) {
                    className = ' class="not_current"';
                }
                else if (yearToOperate == curDate.getFullYear()) {
                    if (monthToOperate < curDate.getMonth()) {
                        className = ' class="not_current"';
                    }
                    else if (monthToOperate == curDate.getMonth()) {
                        if (dayCounter < curDate.getDate()) {
                            className = ' class="not_current"';
                        }
                        else if (dayCounter == curDate.getDate()) {
                            className = ' class="today"';
                        }
                        else {
                            className = '';
                        }
                    }
                    else {
                        className = '';
                    }
                }
                else {
                    className = '';
                }
                //var todayClass = dayCounter == dayMonth ? ' class="today"' : '';
                tmpCellObject = {
                    className: className,
                    dataFullDate: (dayCounter + '.' + (month + 1) + '.' + yearToOperate),
                    dataDayMonth: dayCounter++,
                };
            }
            str_out += buildOneCell(tmpCellObject);
        }
        str_out_week += '<tr>' + str_out + '</tr>';
        j++;
    }
    printMonthHeader(yearToOperate, monthToOperate);
    document.getElementById('calendar_table').children[1].innerHTML = str_out_week;
    console.log(str_out_week);
}

// выводит ячейку с датой предыдущего месяца
function printMonthHeader(year, month) { // 15 ф-я для вывода месяца в шапке календаря
    var text = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    document.getElementById("monthHeader").innerHTML = text[month] + ' ' + year;
}

// формирует содержимое одной ячейки календаря и возвращает строку содержащую тег TD и все его содержимое
function buildOneCell({className = null, dataFullDate = null, dataDayMonth = null, cellText = null}) { //16 ф-я
    // if (! (className && dataWeek && dataDayMonth) )
    if (!className && !dataFullDate && !dataDayMonth) {
        return '<td>&nbsp</td>';
    }
    return '<td onclick = "handleClickCalendarCell(event)"' + className + ' data-fulldate="' + dataFullDate + '" data-daymonth="' + dataDayMonth + '">' +
        (cellText === null ? dataDayMonth : cellText ) + '</td>';
}

// function buildOneCell({ className, dataWeek, dataDaymonth, cellText = null })
// function buildOneCell(props) {
// const { className, dataWeek, dataDaymonth, cellText = null } = props;

// (cellText === null ? cellText : dataDaymonth)
// (cellText ? cellText : dataDaymonth)
// (!cellText ? dataDaymonth : cellText)
// if (cellText === null) { return cellText; } else { return dataDaymonth; }

/* возвращает объект с 2 полями: на какой день недели выпадает первое число месяца и сколько всего в месяце дней*/
function getFirstDayOfMonth(yy, mm) { //16 ф-я
    var firstDayOfCurrentMonth = new Date(yy, mm, 1); // дата на момент первого числа текущего месяца
    var month = firstDayOfCurrentMonth.getMonth(); // месяц от 0 до 11, нужно прибавлять 1
    // var dayMonth = firstDayOfCurrentMonth.getDate();
    var dayWeek = firstDayOfCurrentMonth.getDay(); // от 0 до 6, причем 0 - это воскресение
    dayWeek = (dayWeek === 0) ? 7 : dayWeek;

    // var lastDayOfMonth = new Date(yy, mm +1, 0).getDate();
    return {
        dayWeek, // номер дня недели первого числа текущего месяца
        maxDays: getLastDay(yy, mm), // максимальное количество дней  в текуще месяце (который был передан в качестве параметре )
    }
}

function getLastDay(yy, mm) { // 17 ф-я показать последни йдень месяцы
    return new Date(yy, mm + 1, 0).getDate();
}

function handleClickCalendarCell() { //18 ф-я выбрать день
    var target = event.target;
    var prevCell = STATE.choosen;
    if (prevCell) {
        prevCell.classList.remove('choosen');
    }
    target.classList.add('choosen');
    document.getElementById('reminderData').value = target.getAttribute('data-fulldate');

    STATE.choosen = target;
}

function handleClickCalendarArrows(event) { //показать другие месяцы по клику на кнопки
    console.log('BEFORE: ', STATE);
    event.stopPropagation();
    var target = event.target.closest('.arrows_left,.arrows_right');
    var curMonth = STATE.calendarMonth.getMonth();
    var curYear = STATE.calendarMonth.getFullYear();

    var classes = target.classList;
    var monthForState = 0;
    var yearForState = curYear;
    if (classes[0] == 'arrows_right') {
        monthForState = curMonth === 11 ? 0 : curMonth + 1;
        yearForState = curMonth === 11 ? yearForState + 1 : yearForState;
    } else {
        monthForState = curMonth === 0 ? 11 : curMonth - 1;
        yearForState = curMonth === 0 ? yearForState - 1 : yearForState;
    }

    buildCalendar(yearForState, monthForState);
    STATE.calendarMonth = new Date(yearForState, monthForState);

    console.log("yearForState = ", yearForState, "monthForState = ", monthForState);
    console.log('AFTER ARROW: ', STATE);
}

function decideHide(target) {// функция скрытия календаря, если сделать другую область активной
    if (target.closest('.micalendar')) return true;
    return false;
}