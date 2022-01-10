function ensure(boolean) {
    if(!check_assert){
        return
    }
      console.assert(boolean)
      if (!boolean) {
          console.trace();
          throw "assertion failed";
      }
}

function assertPreIncomeAdded(value){
    return null
}

function assertPostIncomeAdded(value, pre){
    if(!check_assert){
        return
    }
    for (let u in users_data) {
        if (users_data[u].weight > 0) {
            ensure(userShare(u) >= 0)
        }
    }
}

function assertPreWeightChange(userId, new_weight){
    if(!check_assert){
        return
    }
  ensure(program_data['i'] >= 0 && program_data['p'] >= 0 && program_data['f'] >= 0 & program_data['W'] >= 0)
  const all_revs = {}
  for(let key in users_data){
    all_revs[key] = userShare(key)
  }
  return {all_revs: all_revs, dbg: {O: debug_data['O']}, program: {f: program_data['f']} }
}

function assertPostWeightChange(userId, new_weight, state){
    if(!check_assert){
        return
    }

  ensure(program_data['i'] >= 0 && program_data['p'] >= 0 && program_data['f'] >= 0 & program_data['W'] >= 0)
  ensure(program_data['i'] == 0 && debug_data['I'] - program_data['f'] - debug_data['O'] == 0)
  
  for(let key in state.all_revs){
    if(key != userId){
        ensure(state.all_revs[key] == userShare(key));
    }else{
        ensure(userShare(key) == 0)
        ensure(debug_data['O'] - state.dbg.O == state.all_revs[key])
        ensure(program_data['f'] - state.program.f == state.all_revs[key])
    }
  };
}