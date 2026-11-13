// Chronicles of Aethelgard - party protection (zero friendly fire).
//
// Cancels the whole attack (no damage, no knockback, no stagger) when the attacker and the victim
// are on the same side:
//   * two players in the same FTB Teams party
//   * a player and a pet/dragon owned by them or by a party member (either direction)
//   * pets/dragons of party members hitting each other
//   * MineColonies citizens and guards vs. anyone who is not ranked "hostile" in that colony
// Players who are NOT in the same party can still duel normally.
// This is the safeguard layer on top of the "Teams Friendly Fire Addon" mod.

const $OwnableEntity = Java.loadClass('net.minecraft.world.entity.OwnableEntity')
const $FTBTeamsAPI = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI')

const CITIZEN_TYPES = { 'minecolonies:citizen': true, 'minecolonies:visitor': true }

global.aethSameParty = (uuidA, uuidB) => {
  try {
    let api = $FTBTeamsAPI.api()
    if (!api.isManagerLoaded()) return false
    return api.getManager().arePlayersInSameTeam(uuidA, uuidB)
  } catch (error) {
    return false
  }
}

// The player responsible for an entity: the player itself, or the owner of a tamed mob / dragon.
const responsiblePlayer = (entity, server) => {
  if (entity == null) return null
  if (entity.isPlayer()) return entity
  if (entity instanceof $OwnableEntity) {
    let ownerId = entity.getOwnerUUID()
    if (ownerId != null) return server.getPlayerList().getPlayer(ownerId)
  }
  return null
}

const isCitizen = entity => entity != null && CITIZEN_TYPES[String(entity.type)] === true

// True when `player` is welcome in the colony this citizen belongs to (owner, officer, friend, neutral).
const friendlyToColony = (citizen, player) => {
  try {
    let colony = citizen.getCitizenColonyHandler().getColony()
    if (colony == null) return true
    return !colony.getPermissions().getRank(player).isHostile()
  } catch (error) {
    return false
  }
}

EntityEvents.hurt(event => {
  let victim = event.entity
  if (victim == null || !victim.isLiving()) return

  let attacker = event.source.actual
  if (attacker == null || attacker === victim) return

  let server = event.server
  let attackerPlayer = responsiblePlayer(attacker, server)

  // --- MineColonies citizens and guards ---
  if (isCitizen(victim)) {
    if (attackerPlayer != null && friendlyToColony(victim, attackerPlayer)) event.cancel()
    else if (isCitizen(attacker)) event.cancel()
    return
  }
  if (isCitizen(attacker)) {
    let target = responsiblePlayer(victim, server)
    if (target != null && friendlyToColony(attacker, target)) event.cancel()
    return
  }

  // --- players, pets and dragons ---
  if (attackerPlayer == null) return
  let victimPlayer = responsiblePlayer(victim, server)
  if (victimPlayer == null) return

  let attackerId = attackerPlayer.getUUID()
  let victimId = victimPlayer.getUUID()

  if (attackerId.equals(victimId)) {
    // You vs. your own pet, or your pet vs. you. (Self-inflicted damage has attacker === victim above.)
    event.cancel()
    return
  }

  if (global.aethSameParty(attackerId, victimId)) event.cancel()
})
