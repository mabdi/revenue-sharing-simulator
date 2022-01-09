const DECIMALS = 18;
const UNITS = 10**DECIMALS;

function appendNewUser(weight) {
  if(keep_logs){actions_list.push('appendNewUser:' + weight)}
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
  if (program_data['W'] == 0) 
      return
  if (value<=0)
    return
  if(keep_logs){actions_list.push('appendNewIncome:' + value)}
  actionIncomeAdded(value)
}

function actionWithdraw(userId) {
  if(keep_logs){actions_list.push('actionWithdraw:' + userId)}
  weight_change(userId, users_data[userId].weight)
}

function actionChangeWeight(userId, new_weight) {
  if(keep_logs){actions_list.push('actionChangeWeight:' + userId + ": " + new_weight)}
  weight_change(userId, new_weight)
}

function actionIncomeAdded(value) {
  let assertPre = assertPreIncomeAdded(value)
  if(keep_logs){actions_list.push('actionIncomeAdded:' + value)}
  program_data['M'] += 1
  program_data['i'] += value
  program_data['I'] += value
  assertPostIncomeAdded(value, assertPre)
}

function actionExit(userId) {
  if(keep_logs){actions_list.push('actionExit:' + userId)}
  weight_change(userId, 0)
}

function weight_change(userId, new_weight) {
  let preState = assertPreWeightChange(userId, new_weight)
  
  program_data['M'] += 1
  if (program_data['W'] > 0 && program_data['i']) {
      program_data['f'] += program_data['i']
      program_data['p'] += parseInt( (program_data['i']*UNITS) / program_data['W'])
      program_data['i'] = 0
  }
  if (users_data[userId].weight > 0) {
      let r = parseInt( (users_data[userId].weight * program_data['p'] / UNITS) - users_data[userId].debt )
      if (r > 0) {
          users_data[userId].final += r
          program_data['f'] -= r
          if(program_data['f']<0){
            console.assert(false)
          }
          program_data['O'] += r
          users_data[userId].debt = parseInt( users_data[userId].weight * program_data['p'] / UNITS)
      } else {
          users_data[userId].debt = parseInt( users_data[userId].weight * program_data['p'] / UNITS)
      }
  }
  let weight_delta = new_weight - users_data[userId].weight
  users_data[userId].weight = new_weight
  users_data[userId].debt = parseInt( users_data[userId].weight * program_data['p'] / UNITS )
  program_data['W'] += weight_delta

  assertPostWeightChange(userId, new_weight, preState)
}

function userShare(userId) {
  let _u = users_data[userId]
  let _p = program_data['p']
  if (program_data['i'] > 0 && program_data['W'] > 0) {
      _p += parseInt( (program_data['i'] * UNITS) / program_data['W'])
  }
  return parseInt( (_u.weight * _p / UNITS) - _u.debt)
}
