// Chronicles of Aethelgard - anti-OP damage rules (Forge LivingDamageEvent, server side only).
//  * Bosses can never be one-shot: a single hit is capped at a % of the boss' max health.
//  * Tamed dragons fight alongside you but cannot solo bosses (lower cap, and boss hits always hurt them).

global.aethDamageRules = event => {
  let victim = event.getEntity()
  if (victim == null || victim.level.isClientSide()) return

  let A = global.AETH
  let attacker = event.getSource().actual
  let victimType = String(victim.type)
  let attackerType = attacker == null ? '' : String(attacker.type)
  let amount = event.getAmount()

  if (A.bossSet[victimType] === true) {
    let share = attackerType == 'dragonmounts:dragon' ? A.balance.dragonVsBossHitCap : A.balance.bossHitCap
    let cap = victim.getMaxHealth() * share
    if (cap < A.balance.minCap) cap = A.balance.minCap
    if (amount > cap) event.setAmount(cap)
    return
  }

  if (victimType == 'dragonmounts:dragon' && A.bossSet[attackerType] === true) {
    let floor = victim.getMaxHealth() * A.balance.bossVsDragonFloor
    if (amount < floor) event.setAmount(floor)
  }
}

ForgeEvents.onEvent('net.minecraftforge.event.entity.living.LivingDamageEvent', event => {
  try {
    global.aethDamageRules(event)
  } catch (error) {
    // Balance rules must never break combat itself.
  }
})
