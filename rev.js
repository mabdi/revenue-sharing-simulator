function ensure(boolean) {
  console.assert(boolean)
  if (!boolean) {
      console.trace();
      throw "assertion failed";
  }
}

function appendNewUser(weight) {
  actions_list.push('appendNewUser:' + weight)
  var id = Object.keys(users_data).length;
  users_data[id] = {
      'id': id,
      'join_time': program_data["M"],
      'debt': 0,
      'final': 0,
      'weight': 0
  }
  weight_change(id, weight)
}

function appendNewIncome(value) {
  let array = Object.keys(users_data)
  if (array.length == 0) 
      return
  actions_list.push('appendNewIncome:' + value)
  incomes_data.push({
      id: incomes_data.length,
      value: value
  })
  actionIncomeAdded(value)
}

function actionWithdraw(userId) {
  actions_list.push('actionWithdraw:' + userId)
  weight_change(userId, users_data[userId].weight)
}

function actionChangeWeight(userId, new_weight) {
  actions_list.push('actionChangeWeight:' + userId + ": " + new_weight)
  weight_change(userId, new_weight)
}

function actionIncomeAdded(value) {
  actions_list.push('actionIncomeAdded:' + value)
  program_data['M'] += 1
  program_data['i'] += value

  for (let u in users_data) {
      if (users_data[u].weight > 0) {
          ensure(userShare(u) > 0)
      }
  }
}

function actionExit(userId) {
  actions_list.push('actionExit:' + userId)
  weight_change(userId, 0)
}

function weight_change(userId, new_weight) {
  ensure(program_data['M'] >= 0 && program_data['i'] >= 0 && program_data['p'] >= 0 && program_data['f'] >= 0 & program_data['W'] >= 0)
  const all_revs = {}
  for(let key in users_data){
    if(key == userId){
      all_revs[key] = 0;
    }else{
      all_revs[key] = userShare(key);
    }
  };

  program_data['M'] += 1
  if (program_data['W'] > 0 && program_data['i']) {
      program_data['f'] += program_data['i']
      program_data['p'] += program_data['f'] / program_data['W']
      program_data['i'] = 0
  }
  if (users_data[userId].weight > 0) {
      let r = users_data[userId].weight * program_data['p'] - users_data[userId].debt
      if (r > 0) {
          users_data[userId].final += r
          program_data['f'] -= r
          // ensure( program_data['f'] >= 0 )
          users_data[userId].debt = users_data[userId].weight * program_data['p']
      } else {
          users_data[userId].debt = users_data[userId].weight * program_data['p']
      }
  }
  let weight_delta = new_weight - users_data[userId].weight
  users_data[userId].weight = new_weight
  users_data[userId].debt = users_data[userId].weight * program_data['p']
  program_data['W'] += weight_delta
  ensure(userShare(userId) == 0)
  ensure(program_data['M'] >= 0 && program_data['i'] >= 0 && program_data['p'] >= 0 && program_data['f'] >= 0 & program_data['W'] >= 0)

  
  for(let key in all_revs){
    if(key != userId){
      ensure(all_revs[key] == userShare(key));
    }
  };
}

function userShare(userId) {
  let _u = users_data[userId]
  let _f = program_data['f']
  let _p = program_data['p']
  if (program_data['i'] > 0 && program_data['W'] > 0) {
      _f += program_data['i']
      _p += _f / program_data['W']
  }
  return _u.weight * _p - _u.debt
}
