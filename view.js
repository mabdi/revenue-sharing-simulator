function updateProgramTable() {
    document.getElementById('div_program_t').innerHTML = debug_data["T"];
    document.getElementById('div_program_i').innerHTML = program_data["i"];
    document.getElementById('div_program_I').innerHTML = debug_data["I"];
    document.getElementById('div_program_O').innerHTML = debug_data["O"] //.toFixed(2);
    document.getElementById('div_program_p').innerHTML = program_data["p"].toString().replace(/\B(?<!\.\d*)(?=(\d{18})+(?!\d))/g, ","); //.toFixed(2);
    document.getElementById('div_program_f').innerHTML = program_data["f"] //.toFixed(2);
    document.getElementById('div_program_w').innerHTML = program_data["W"];
}

function newUserJoin(weight) {
    if(weight==null){
        weight= BigInt(prompt("Weight?"))
    }
    appendNewUser(weight);
    viewUpdate();
}

function newIncomeInsert() {
    var myValue = BigInt(document.getElementById('text_income_value').value);
    appendNewIncome(myValue)
    viewUpdate();
}

function createInitialState() {
    return {
        "i": BigInt(0),
        "p": BigInt(0),
        "f": BigInt(0),
        "W": BigInt(0)
        
    }
}

function createInitialDebugState() {
    return {
        "T": BigInt(0),
        "I": BigInt(0),
        "O": BigInt(0)
    }
}

function createInitialIncomes() {
    return []
}

function createInitialUsers() {
    return {}
}

function updateUsersTable() {
    var table = document.getElementById('table_users')
    for (var i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
    }
    for (var rowId in users_data) {
        var rowData = users_data[rowId]
        var row = table.insertRow(1);
        var cell = row.insertCell(0);
        cell.innerHTML = rowData.id
        cell = row.insertCell(1);
        cell.innerHTML = rowData["weight"]
        cell = row.insertCell(2);
        cell.innerHTML = rowData["debt"] //.toFixed(2)
        cell = row.insertCell(3);
        cell.innerHTML = rowData["join_time"]
        cell = row.insertCell(4);
        cell.innerHTML = rowData["final"] //.toFixed(2)
        cell = row.insertCell(5);
        if (rowData["weight"] > 0) {
            var node = document.createElement('input')
            node.setAttribute('type', 'button')
            node.setAttribute('value', 'exit')
            node.setAttribute('onClick', 'userOnExit(' + rowData.id + ')')
            cell.appendChild(node)
            node = document.createElement('input')
            node.setAttribute('type', 'button')
            node.setAttribute('value', 'withdraw')
            node.setAttribute('onClick', 'userOnWithdraw(' + rowData.id + ')')
            cell.appendChild(node)
            node = document.createElement('input')
            node.setAttribute('type', 'button')
            node.setAttribute('value', 'w?')
            node.setAttribute('onClick', 'userOnChangeWeight(' + rowData.id + ')')
            cell.appendChild(node)
            node = document.createElement('input')
            node.setAttribute('type', 'button')
            node.setAttribute('value', 'w++')
            node.setAttribute('onClick', 'userOnChangeWeight(' + rowData.id + ',1)')
            cell.appendChild(node)
            node = document.createElement('input')
            node.setAttribute('type', 'button')
            node.setAttribute('value', 'w--')
            node.setAttribute('onClick', 'userOnChangeWeight(' + rowData.id + ',-1)')
            cell.appendChild(node)
            node = document.createElement('input')
            node.setAttribute('type', 'button')
            node.setAttribute('value', 'query')
            node.setAttribute('onClick', 'userOnQuery(' + rowData.id + ')')
            cell.appendChild(node)
        } else {
            var node = document.createElement('input')
            node.setAttribute('type', 'button')
            node.setAttribute('value', 'join')
            node.setAttribute('onClick', 'userOnJoin(' + rowData.id + ')')
            cell.appendChild(node)
        }

    }

}

function userOnJoin(userId) {
    actionJoin(userId, 1);
    viewUpdate();
}

function userOnExit(userId) {
    actionExit(userId);
    viewUpdate();
}

function userOnQuery(userId) {
    var share = userShare(userId);
    alert(share)
}

function userOnChangeWeight(userId, change) {
    let final = 0n
    if(change == null){
        final = BigInt(prompt("change to:"));
    }else{
        final = users_data[userId]['weight'] + change
    }
    actionChangeWeight(userId, final);
    viewUpdate();
}

function userOnWithdraw(userId) {
    actionWithdraw(userId);
    viewUpdate();
}

function viewUpdate() {
    updateUsersTable();
    updateProgramTable();
    document.getElementById("check_assert").checked= check_assert
    document.getElementById("actions_log").checked= keep_logs
}

function fuzz() {
    document.getElementById('btn_fuzz').disabled = true;
    const MAX_W = 10
    const actions = [
        function(){
            // join user
            appendNewUser(1);
        },
        function(){
            // join a disabled user (w -> 0)
            appendNewUser(0);
        },
        function(){
            // join a user with predefined weight
            let w = Math.floor(Math.random() * MAX_W);
            appendNewUser(w);
        },
        function(){
            // change the weight of a user
            let w = Math.floor(Math.random() * MAX_W);
            let array = Object.keys(users_data)
            if (array.length == 0) 
                return
            let u = array[Math.floor(Math.random() * array.length)];
            actionChangeWeight(u, w)
        },
        function(){
            // new income add
            let v = Math.floor(Math.random() * 200);
            appendNewIncome(v)
        },
        function(){
            // withdraw
            let array = Object.keys(users_data)
            if (array.length == 0) 
                return
            let u = array[Math.floor(Math.random() * array.length)];
            let _u = users_data[u]
            if(_u.weight==0)
                return
            actionWithdraw(u)
        },
        function(){
            // exit user (w -> 0)
            let array = Object.keys(users_data)
            if (array.length == 0) 
                return
            let u = array[Math.floor(Math.random() * array.length)];
            let _u = users_data[u]
            if(_u.weight==0)
                return
            actionExit(u)
        },
        function(){
            // query income 
            let array = Object.keys(users_data)
            if (array.length == 0) 
                return
            let u = array[Math.floor(Math.random() * array.length)];
            userShare(u)
        },
        function(){
            // exit all
            let array = Object.keys(users_data)
            if (array.length == 0) 
                return
            for(let uid in users_data){
                let _u = users_data[uid]
                if(_u.weight>0){
                    actionExit(uid)
                }
            }
        }
    ]
    try {
        const MAX_F = 100000
        for (var i = 0; i < MAX_F; i++) {
            if(i % (MAX_F/10) == 0)
                console.log('fuzzing: '+ (100 * i/MAX_F))
            let action = Math.floor(Math.random() * actions.length);
            actions[action]();
        }
    } catch (err) {
        console.error(err.message)
        console.log(err.stack);
        logState()
    }
    console.log('fuzz completed.')
    viewUpdate();
    document.getElementById('btn_fuzz').disabled = false;
}

function exampleData() {
    appendNewUser(1);
    appendNewUser(1);
    appendNewUser(2);
    appendNewUser(0);
    appendNewIncome(10);
    appendNewIncome(50);
    appendNewIncome(130);
    viewUpdate();
}

function logState() {
    console.log('program_data', program_data)
    console.log('users_data', users_data)
    console.log('actions_list', actions_list)
    console.log('check_assert', check_assert)
    console.log('keep_logs', keep_logs)
    
}

function resetState() {
    debug_data = createInitialDebugState();
    program_data = createInitialState();
    users_data = createInitialUsers();
    actions_list = []
    check_assert = false;
    keep_logs = false;
    viewUpdate();
}

function toggleCheckAssert(){
    check_assert = !check_assert;
}

function toggleActionsLog(){
    keep_logs = !keep_logs
}

check_assert = false;
keep_logs = false;
debug_data = createInitialDebugState();
program_data = createInitialState();
users_data = createInitialUsers();
actions_list = []
viewUpdate();
