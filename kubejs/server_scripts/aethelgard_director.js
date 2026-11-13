// Chronicles of Aethelgard - cutscene director.
//
// Boss intros: once per second, every player is checked against the story bosses in global.AETH.cutscenes.
// The first time a player gets within range of a living boss, the matching Immersive Cinematics script
// plays for them AND for every other nearby player who has not seen it yet - so the whole party watches
// together and the mod's skip vote applies. Everyone is briefly made invulnerable while the camera is away.
//
// The scripts themselves live in immersive_cinematics/scripts/*.json. They frame the boss with
// entity-relative keyframes, so they work wherever the arena generated.
// The World Awakening intro uses the mod's own "login" trigger (see aethelgard_intro.json);
// The Unsealing is started from aethelgard_story.js when the Key is used.

const CUTSCENES = global.AETH.cutscenes
const PARTY_RADIUS = 48

global.aethPlayCutscene = (server, player, sceneId, seconds) => {
  // Resistance V = full damage immunity (except the void) for the length of the scene + 2s grace.
  player.potionEffects.add('minecraft:resistance', (seconds + 2) * 20, 4, false, false)
  player.potionEffects.add('minecraft:fire_resistance', (seconds + 2) * 20, 0, false, false)
  server.runCommandSilent('icinematics play ' + sceneId + ' ' + player.username)
}

const seenStage = sceneId => 'aeth_seen_' + sceneId

global.aethDirectorTick = server => {
  server.players.forEach(player => {
    if (player.isSpectator() || !player.isAlive()) return
    let level = player.level
    let box = player.boundingBox.inflate(160)
    let fired = false

    level.getEntitiesWithin(box).forEach(entity => {
      if (fired) return
      let scene = CUTSCENES[String(entity.type)]
      if (scene === undefined || !entity.isAlive()) return
      if (player.stages.has(seenStage(scene.id))) return
      if (entity.distanceToEntity(player) > scene.range) return

      fired = true
      server.players.forEach(viewer => {
        if (viewer.level != level || viewer.isSpectator()) return
        if (viewer.distanceToEntity(player) > PARTY_RADIUS) return
        if (viewer.stages.has(seenStage(scene.id))) return
        viewer.stages.add(seenStage(scene.id))
        global.aethPlayCutscene(server, viewer, scene.id, scene.seconds)
      })
    })
  })
}

ServerEvents.tick(event => {
  if (event.server.tickCount % 20 != 10) return
  try {
    global.aethDirectorTick(event.server)
  } catch (error) {
    console.error('[Aethelgard] director error: ' + error)
  }
})

// Keep the world's copy of the cutscene scripts identical to the pack's copy after every start.
// (Immersive Cinematics only copies *new* files on its own; "reload" re-syncs and re-registers triggers.)
ServerEvents.loaded(event => {
  event.server.scheduleInTicks(100, () => {
    event.server.runCommandSilent('icinematics reload')
    console.info('[Aethelgard] cutscene scripts synced')
  })
})
