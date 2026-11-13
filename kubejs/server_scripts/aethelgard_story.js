// Chronicles of Aethelgard - story mechanics:
//   starter kit + starting Epic Fight skills, relic drops, the Key ritual,
//   breaking the Seal on an End Portal, and the Abyssal Sovereign's phases.

const A = global.AETH

const broadcast = (server, text) => server.tell(text)

const titleFor = (server, selector, title, subtitle) => {
  server.runCommandSilent('title ' + selector + ' times 10 70 20')
  server.runCommandSilent('title ' + selector + ' subtitle ' + JSON.stringify({ text: subtitle, color: 'gray' }))
  server.runCommandSilent('title ' + selector + ' title ' + JSON.stringify({ text: title, color: 'gold', bold: true }))
}

// ---------------------------------------------------------------------------------------------
// First join: guide book, basic gear and the two core Epic Fight skills (dodge + guard).
// ---------------------------------------------------------------------------------------------
PlayerEvents.loggedIn(event => {
  let player = event.player
  let server = event.server
  let name = player.username

  // Skills are re-applied on every login: harmless if already learned, and it repairs old saves.
  server.scheduleInTicks(60, () => {
    server.runCommandSilent('epicfight skill add ' + name + ' dodge epicfight:roll')
    server.runCommandSilent('epicfight skill add ' + name + ' guard epicfight:guard')
  })

  if (player.stages.has('aeth_starter')) return
  player.stages.add('aeth_starter')

  player.give(Item.of('ftbquests:book'))
  player.give(Item.of('minecraft:iron_sword'))
  player.give(Item.of('minecraft:shield'))
  player.give(Item.of('minecraft:bread', 16))
  player.give(Item.of('minecraft:torch', 16))
  player.give(Item.of('waystones:return_scroll', 2))

  server.scheduleInTicks(260, () => {
    player.tell(Text.of('').append(Text.gold('Chronicles of Aethelgard')).append(Text.gray(' - the Seal is failing.')))
    player.tell(Text.gray('Open your ').append(Text.yellow('Quest Book')).append(Text.gray(' to begin. Press ')).append(Text.yellow('R')).append(Text.gray(' to toggle Battle Mode.')))
    player.tell(Text.gray('You already know how to ').append(Text.aqua('Roll')).append(Text.gray(' and ')).append(Text.aqua('Guard')).append(Text.gray('. Hold the Ultimine key to vein-mine.')))
  })
})

// ---------------------------------------------------------------------------------------------
// Boss deaths: guaranteed Planar Relic + Wyrm Heartscale drops, announced to everyone.
// ---------------------------------------------------------------------------------------------
global.aethBossDrops = (entity, server, claimedBy) => {
  let type = String(entity.type)
  let relic = A.relics[type]
  let dropsScale = A.heartscale[type] === true
  if (relic === undefined && !dropsScale) return false

  if (dropsScale) entity.block.popItem(Item.of('kubejs:wyrm_heartscale'))

  if (relic !== undefined) {
    entity.block.popItem(Item.of(relic))
    entity.block.popItem(Item.of('kubejs:aethelgard_seal_fragment'))
    let relicName = A.relicNames[relic]
    broadcast(server, Text.of('').append(Text.gold('A Warden has fallen. ')).append(Text.lightPurple(relicName)).append(Text.gray(' has been claimed by ' + claimedBy + '\'s party.')))
    server.runCommandSilent('execute at ' + claimedBy + ' run playsound minecraft:ui.toast.challenge_complete master @a[distance=..96] ~ ~ ~ 1 0.8')
  }
  return true
}

EntityEvents.death(event => {
  let entity = event.entity
  let type = String(entity.type)
  if (A.relics[type] === undefined && A.heartscale[type] !== true) return

  // Only reward real fights: a player has to be nearby.
  let near = entity.level.getNearestPlayer(entity, 96)
  if (near == null) return
  global.aethBossDrops(entity, event.server, near.username)
})

// ---------------------------------------------------------------------------------------------
// The ritual: crafting the Key of the Sovereign is a server-wide moment.
// ---------------------------------------------------------------------------------------------
ItemEvents.crafted('kubejs:key_of_the_sovereign', event => {
  let server = event.server
  titleFor(server, '@a', 'The Key is Forged', 'Six relics. One door. Find the Stronghold.')
  server.runCommandSilent('execute as @a at @s run playsound minecraft:block.end_portal.spawn master @s ~ ~ ~ 0.7 0.6')
  broadcast(server, Text.of('').append(Text.lightPurple(event.player.username)).append(Text.gray(' has forged the ')).append(Text.lightPurple('Key of the Sovereign')).append(Text.gray('. Use it on an End Portal Frame.')))
})

// ---------------------------------------------------------------------------------------------
// Breaking the Seal: only the Key opens an End Portal. Eyes of Ender still locate the Stronghold.
// ---------------------------------------------------------------------------------------------
const FRAME = 'minecraft:end_portal_frame'

const openPortalAround = (level, x, y, z) => {
  // Collect the frame ring around the clicked frame (a vanilla ring is 5x5 with 12 frames).
  let minX = x, maxX = x, minZ = z, maxZ = z
  let frames = []
  for (let dx = -4; dx <= 4; dx++) {
    for (let dz = -4; dz <= 4; dz++) {
      let block = level.getBlock(x + dx, y, z + dz)
      if (block.id == FRAME) {
        frames.push(block)
        if (x + dx < minX) minX = x + dx
        if (x + dx > maxX) maxX = x + dx
        if (z + dz < minZ) minZ = z + dz
        if (z + dz > maxZ) maxZ = z + dz
      }
    }
  }
  if (frames.length < 12 || maxX - minX != 4 || maxZ - minZ != 4) return false

  frames.forEach(block => {
    let facing = block.properties.facing
    block.set(FRAME, { facing: String(facing), eye: 'true' })
  })
  for (let px = minX + 1; px <= maxX - 1; px++) {
    for (let pz = minZ + 1; pz <= maxZ - 1; pz++) {
      level.getBlock(px, y, pz).set('minecraft:end_portal')
    }
  }
  return true
}

global.aethOpenPortal = openPortalAround

BlockEvents.rightClicked(FRAME, event => {
  if (event.hand != 'MAIN_HAND') return
  let player = event.player
  let item = event.item
  let server = event.server

  if (item.id == 'minecraft:ender_eye') {
    player.statusMessage = Text.red('The Seal rejects ordinary eyes. Only the Key of the Sovereign can open this gate.')
    event.cancel()
    return
  }
  if (item.id != 'kubejs:key_of_the_sovereign') return

  let block = event.block
  if (!openPortalAround(event.level, block.x, block.y, block.z)) {
    player.statusMessage = Text.red('This portal frame is incomplete - the Key needs a full ring of twelve frames.')
    event.cancel()
    return
  }

  // Cutscene + protection for everyone standing nearby, then the announcement.
  let dim = String(event.level.dimension)
  server.players.forEach(other => {
    if (String(other.level.dimension) != dim) return
    if (other.distanceToEntity(player) > 48) return
    other.potionEffects.add('minecraft:resistance', 200, 4, false, false)
    server.runCommandSilent('icinematics play the_unsealing ' + other.username)
  })
  titleFor(server, '@a', 'The Seal is Broken', 'The Abyssal Sovereign stirs beyond the gate')
  server.runCommandSilent('execute at ' + player.username + ' run playsound minecraft:block.end_portal.spawn master @a ~ ~ ~ 1 0.5')
  broadcast(server, Text.of('').append(Text.lightPurple(player.username)).append(Text.gray(' has broken the Seal. Act V begins.')))
  event.cancel()
})

// ---------------------------------------------------------------------------------------------
// The Abyssal Sovereign: the Ender Dragon, renamed, with two extra phases of Cataclysm minions.
// (Health, damage and crystal behaviour come from Savage Ender Dragon - see config/dragonfight.json.)
// ---------------------------------------------------------------------------------------------
const END = 'minecraft:the_end'

const summonNearPlayers = (server, players, entityId, perPlayer) => {
  players.forEach(player => {
    for (let i = 0; i < perPlayer; i++) {
      let angle = Math.random() * Math.PI * 2
      let px = Math.floor(player.x + Math.cos(angle) * 6)
      let pz = Math.floor(player.z + Math.sin(angle) * 6)
      server.runCommandSilent('execute in ' + END + ' run summon ' + entityId + ' ' + px + ' ' + Math.floor(player.y + 1) + ' ' + pz)
    }
  })
}

ServerEvents.tick(event => {
  let server = event.server
  if (server.tickCount % 20 != 0) return

  let end = server.getLevel(END)
  if (end == null) return
  let fighters = end.players
  if (fighters.isEmpty()) return

  end.getEntities().forEach(entity => {
    if (String(entity.type) != 'minecraft:ender_dragon' || !entity.isAlive()) return
    let data = entity.persistentData

    if (!data.getBoolean('aethNamed')) {
      data.putBoolean('aethNamed', true)
      entity.setCustomName(Text.of(A.sovereignName).darkPurple())
    }

    let ratio = entity.health / entity.maxHealth
    let phase = data.getInt('aethPhase')

    if (phase < 1 && ratio <= 0.66) {
      data.putInt('aethPhase', 1)
      titleFor(server, '@a[x=0,y=64,z=0,distance=..400]', 'Phase II', 'The Sovereign calls its guard')
      server.runCommandSilent('execute in ' + END + ' run playsound minecraft:entity.wither.spawn hostile @a 0 70 0 4 0.6')
      summonNearPlayers(server, fighters, 'cataclysm:endermaptera', 2)
      server.runCommandSilent('execute in ' + END + ' run summon cataclysm:ender_golem 0 68 6')
    } else if (phase < 2 && ratio <= 0.33) {
      data.putInt('aethPhase', 2)
      titleFor(server, '@a[x=0,y=64,z=0,distance=..400]', 'Phase III', 'The Seal screams - finish it')
      server.runCommandSilent('execute in ' + END + ' run playsound minecraft:entity.ender_dragon.growl hostile @a 0 70 0 4 0.5')
      summonNearPlayers(server, fighters, 'cataclysm:endermaptera', 3)
      server.runCommandSilent('execute in ' + END + ' run summon cataclysm:ender_golem 6 68 -6')
      fighters.forEach(player => player.potionEffects.add('minecraft:darkness', 100, 0, false, false))
    }
  })
})

EntityEvents.death('minecraft:ender_dragon', event => {
  let server = event.server
  titleFor(server, '@a', 'The Sovereign Falls', 'Aethelgard is free. The Golden Age begins.')
  server.runCommandSilent('execute as @a at @s run playsound minecraft:ui.toast.challenge_complete master @s ~ ~ ~ 1 1')
  broadcast(server, Text.of('').append(Text.gold('The Abyssal Sovereign is dead. ')).append(Text.gray('Act VI - The Golden Age of Aethelgard - is now open in your Quest Book.')))
})
