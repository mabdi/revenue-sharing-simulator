function ensure(boolean){
	console.assert(boolean)
  if(!boolean){
  	throw "assertion failed"; 
  }
}

function actionWithdraw(userId){
  weight_change(userId, users_data[userId].weight)
}

function actionChangeWeight(userId, new_weight){
  weight_change(userId, new_weight)
}

function actionIncomeAdded(value){
  program_data['M'] += 1
	program_data['i'] += value

	for(let u in users_data){
    ensure( userShare(u) > 0 )	
  }
}

function actionExit(userId){
  weight_change(userId, 0)
}

function weight_change(userId, new_weight){
	ensure(program_data['M']>=0 && program_data['i']>=0 && 
  	program_data['p']>=0 && program_data['f']>=0 &
    program_data['W']>=0)
    
	program_data['M'] += 1
  if(program_data['W']>0 && program_data['i']){
  	program_data['f'] += program_data['i']
    program_data['p'] += program_data['f'] / program_data['W']
    program_data['i'] = 0
    
   	ensure(program_data['M']>=0 && program_data['i']>=0 && 
  		program_data['p']>=0 && program_data['f']>=0 &
    	program_data['W']>=0)
  }
  if(users_data[userId].weight>0){
      let r = users_data[userId].weight * program_data['p'] - users_data[userId].debt
      if(r>0){
				users_data[userId].final += r
      	program_data['f'] -= r
        ensure( program_data['f'] >= 0 )
      	users_data[userId].debt = users_data[userId].weight * program_data['p']
      }else{
      	users_data[userId].debt = users_data[userId].weight * program_data['p']
      }
      ensure(program_data['M']>=0 && program_data['i']>=0 && 
  		program_data['p']>=0 && program_data['f']>=0 &
    	program_data['W']>=0)
  }
  let weight_delta = new_weight - users_data[userId].weight
  users_data[userId].weight = new_weight  
  users_data[userId].debt = users_data[userId].weight * program_data['p']
  program_data['W'] += weight_delta
  ensure( userShare(userId) == 0 )
  ensure(program_data['M']>=0 && program_data['i']>=0 && 
  		program_data['p']>=0 && program_data['f']>=0 &
    	program_data['W']>=0)
}

function userShare(userId){
	 let _u = users_data[userId]
	 let _f = program_data['f']
	 let _p = program_data['p']
   if(program_data['i'] >0 && program_data['W']>0){
   		_f += program_data['i']
      _p += _f / program_data['W']
   }
   return _u.weight * _p - _u.debt
}

// ======================

function updateProgramTable(){
	document.getElementById('div_program_m').innerHTML = JSON.stringify(program_data["M"]);
  document.getElementById('div_program_i').innerHTML = JSON.stringify(program_data["i"]);
  document.getElementById('div_program_p').innerHTML = JSON.stringify(program_data["p"]);
  document.getElementById('div_program_f').innerHTML = JSON.stringify(program_data["f"]);
  document.getElementById('div_program_w').innerHTML = JSON.stringify(program_data["W"]); 
}

function appendNewUser(weight){
	var id = Object.keys(users_data).length;
  var debt = 0;
  users_data[id] = {
  	'id': id,
    'join_time': program_data["M"],
    'debt': 0,
    'final': 0,
    'weight': 0
  }
  weight_change(id, weight)
}

function appendNewIncome(value){
	incomes_data.push({
  	id: incomes_data.length,
    value: value
  })
	actionIncomeAdded(value)
}

function newUserJoin(){
	appendNewUser(1);
  viewUpdate();
}

function newIncomeInsert(){
	var myValue = parseInt(document.getElementById('text_income_value').value);
	appendNewIncome(myValue)  
  viewUpdate();
}

function createInitialState(){
	return {"i":0, "p":0, "f":0, "W":0, "M":0}
}

function createInitialIncomes(){
	return []
}

function createInitialUsers(){
	return {}
}

function updateIncomesTable(){
	var table = document.getElementById('table_incomes')
  for(var i = table.rows.length - 1; i> 0; i--){
  	table.deleteRow(i);
  }
  for(var rowData of incomes_data){
  	var row = table.insertRow(1);
    var cell = row.insertCell(0);
    cell.innerHTML = JSON.stringify(rowData.id)
    cell = row.insertCell(1);
    cell.innerHTML = JSON.stringify(rowData["value"])
  }
}

function updateUsersTable(){
	var table = document.getElementById('table_users')
  for(var i = table.rows.length - 1; i> 0; i--){
  	table.deleteRow(i);
  }
  for(var rowId in users_data){
  	var rowData = users_data[rowId]
  	var row = table.insertRow(1);
    var cell = row.insertCell(0);
    cell.innerHTML = JSON.stringify(rowData.id)
    cell = row.insertCell(1);
    cell.innerHTML = JSON.stringify(rowData["join_time"])
		cell = row.insertCell(2);
    cell.innerHTML = rowData["debt"].toFixed(2)
    cell = row.insertCell(3);
    cell.innerHTML = rowData["final"].toFixed(2)
    cell = row.insertCell(4);
    cell.innerHTML = JSON.stringify(rowData["weight"])
		cell = row.insertCell(5);
    if(rowData["weight"]>0){
    	var node = document.createElement('input')
    	node.setAttribute('type','button')
    	node.setAttribute('value','exit')
      node.setAttribute('onClick','userOnExit('+rowData.id+')')
			cell.appendChild(node)
      node = document.createElement('input')
      node.setAttribute('type','button')
      node.setAttribute('value','withdraw')
      node.setAttribute('onClick','userOnWithdraw('+rowData.id+')')
      cell.appendChild(node)
      node = document.createElement('input')
      node.setAttribute('type','button')
      node.setAttribute('value','w++')
      node.setAttribute('onClick','userOnChangeWeight('+rowData.id+',1)')
      cell.appendChild(node)
      node = document.createElement('input')
      node.setAttribute('type','button')
      node.setAttribute('value','w--')
      node.setAttribute('onClick','userOnChangeWeight('+rowData.id+',-1)')
      cell.appendChild(node)
      node = document.createElement('input')
      node.setAttribute('type','button')
      node.setAttribute('value','query')
      node.setAttribute('onClick','userOnQuery('+rowData.id+')')
      cell.appendChild(node)
    }else{
    	var node = document.createElement('input')
    	node.setAttribute('type','button')
    	node.setAttribute('value','join')
      node.setAttribute('onClick','userOnJoin('+rowData.id+')')
			cell.appendChild(node)
    }
    
  }
  
}

function userOnJoin(userId){
	actionJoin(userId, 1);
  viewUpdate();
}

function userOnExit(userId){
	actionExit(userId);
  viewUpdate();
}

function userOnQuery(userId){
	var share = userShare(userId);
  alert(share)
}

function userOnChangeWeight(userId, change){
	actionChangeWeight(userId, users_data[userId]['weight']+ change);
  viewUpdate();
}

function userOnWithdraw(userId){
	actionWithdraw(userId);
  viewUpdate();
}

function viewUpdate(){
  updateUsersTable();
  updateProgramTable();
  updateIncomesTable();
}

function fuzz(){
	let seq = ''
  try{
  	for(var i =0; i < 1000000; i++){
      let action = Math.floor(Math.random() * 10);
      seq = seq + action      
      if(action < 2){
        appendNewUser(1);
      }
      if(action == 2){
        let w = Math.floor(Math.random() * 2);
        appendNewUser(w);
      }
      if(action == 3){
        let w = Math.floor(Math.random() * 2);
        let array = Object.keys(users_data)
        let u = array[Math.floor(Math.random() * array.length)];
        actionChangeWeight(u ,w)
      }
      if(action == 4){
        let v = Math.floor(Math.random() * 200);
        actionIncomeAdded(v)
      }
      if(action == 5){
        let v = Math.floor(Math.random() * 200);
        actionIncomeAdded(v)
      }
    }
  }catch(err){
  	console.error(err.message)
    console.error(seq)
  }
}

function exampleData(){
	appendNewUser(1);
  appendNewUser(1);
  appendNewUser(2);
  appendNewUser(0);
  appendNewIncome(10);
  appendNewIncome(50);
  appendNewIncome(130);
  viewUpdate();
}

function logState(){
	console.log('program_data', program_data)
  console.log('incomes_data', incomes_data)
  console.log('users_data', users_data)
}

function resetState(){
	program_data = createInitialState();
	incomes_data = createInitialIncomes();
	users_data = createInitialUsers();
  viewUpdate();
}

program_data = createInitialState();
incomes_data = createInitialIncomes();
users_data = createInitialUsers();
viewUpdate();