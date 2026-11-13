// Chronicles of Aethelgard - admin / debugging commands (permission level 2).
//
//   /aethelgard selftest              run the script self-test (safe to run from the console)
//   /aethelgard cutscene <id> <players>  play a cutscene for players (with the usual protection)
//   /aethelgard reset <players>       let players see every intro cutscene again
//   /aethelgard relics <players>      hand out all six Planar Relics (testing / recovery)

const RELIC_ITEMS = [
  'kubejs:frostbound_crown', 'kubejs:overgrown_idol', 'kubejs:sunken_astrolabe',
  'kubejs:cinder_heart', 'kubejs:echoing_sigil', 'kubejs:celestial_eye'
]

const say = (ctx, text) => ctx.source.sendSystemMessage(Text.of(text))

const selfTest = ctx => {
  let server = ctx.source.server
  let level = server.overworld()
  let results = []
  let check = (name, fn) => {
    try {
      let out = fn()
      results.push('PASS ' + name + (out === undefined ? '' : ' -> ' + out))
    } catch (error) {
      results.push('FAIL ' + name + ' -> ' + error)
    }
  }

  check('core data', () => Object.keys(global.AETH.relics).length + ' relic bosses, ' + Object.keys(global.AETH.cutscenes).length + ' boss cutscenes')
  check('custom items', () => {
    let missing = RELIC_ITEMS.concat(['kubejs:key_of_the_sovereign', 'kubejs:wyrm_heartscale', 'kubejs:aethelgard_seal_fragment'])
      .filter(id => Item.of(id).isEmpty())
    if (missing.length > 0) throw 'missing ' + missing
    return 'all registered'
  })
  check('dragon egg item', () => {
    let egg = Item.of('dragonmounts:dragon_egg', '{BlockEntityTag:{Breed:"dragonmounts:fire"}}')
    if (egg.isEmpty()) throw 'empty'
    return egg.hoverName.string
  })
  check('FTB Teams API', () => {
    let api = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI').api()
    let UUID = Java.loadClass('java.util.UUID')
    return 'manager loaded=' + api.isManagerLoaded() + ', same party(random,random)=' + global.aethSameParty(UUID.randomUUID(), UUID.randomUUID())
  })
  check('FTB Quests book', () => {
    let file = Java.loadClass('dev.ftb.mods.ftbquests.quest.ServerQuestFile').INSTANCE
    let quests = 0, tasks = 0, rewards = 0
    let chapters = file.getAllChapters()
    chapters.forEach(chapter => chapter.getQuests().forEach(quest => {
      quests++
      tasks += quest.getTasksAsList().size()
      rewards += quest.getRewards().size()
    }))
    return chapters.size() + ' chapters, ' + quests + ' quests, ' + tasks + ' tasks, ' + rewards + ' rewards, ' + file.getRewardTables().size() + ' reward tables'
  })
  check('MineColonies API', () => {
    Java.loadClass('com.minecolonies.api.entity.citizen.AbstractEntityCitizen')
    Java.loadClass('com.minecolonies.api.colony.permissions.Rank')
    return 'classes reachable'
  })
  check('portal ritual', () => {
    let spawn = level.getSharedSpawnPos()
    let x = spawn.getX(), y = 300, z = spawn.getZ()
    let run = cmd => server.runCommandSilent('execute in minecraft:overworld run ' + cmd)
    // Build a vanilla-shaped ring: 3 frames per side, corners empty.
    for (let i = -1; i <= 1; i++) {
      run('setblock ' + (x + i) + ' ' + y + ' ' + (z - 2) + ' minecraft:end_portal_frame[facing=south]')
      run('setblock ' + (x + i) + ' ' + y + ' ' + (z + 2) + ' minecraft:end_portal_frame[facing=north]')
      run('setblock ' + (x - 2) + ' ' + y + ' ' + (z + i) + ' minecraft:end_portal_frame[facing=east]')
      run('setblock ' + (x + 2) + ' ' + y + ' ' + (z + i) + ' minecraft:end_portal_frame[facing=west]')
    }
    let opened = global.aethOpenPortal(level, x, y, z - 2)
    let centre = String(level.getBlock(x, y, z).id)
    let eye = String(level.getBlock(x + 2, y, z).properties.eye)
    run('fill ' + (x - 2) + ' ' + y + ' ' + (z - 2) + ' ' + (x + 2) + ' ' + y + ' ' + (z + 2) + ' minecraft:air')
    if (!opened || centre != 'minecraft:end_portal' || eye != 'true') throw 'opened=' + opened + ' centre=' + centre + ' eye=' + eye
    return 'ring detected, 12 eyes set, 3x3 portal lit'
  })
  check('boss reward drops', () => {
    let spawn = level.getSharedSpawnPos()
    let boss = level.createEntity('mowziesmobs:frostmaw')
    boss.setPosition(spawn.getX() + 0.5, 310, spawn.getZ() + 0.5)
    let dropped = global.aethBossDrops(boss, server, 'selftest')
    let box = boss.boundingBox.inflate(4)
    let items = level.getEntitiesWithin(box).filter(e => String(e.type) == 'minecraft:item').map(e => String(e.item.id))
    server.runCommandSilent('execute in minecraft:overworld run kill @e[type=minecraft:item,x=' + spawn.getX() + ',y=310,z=' + spawn.getZ() + ',distance=..12]')
    if (!dropped || items.indexOf('kubejs:frostbound_crown') < 0) throw 'drops=' + items
    return items.join(', ')
  })
  check('damage rules', () => {
    if (typeof global.aethDamageRules != 'function') throw 'missing'
    return 'boss cap ' + (global.AETH.balance.bossHitCap * 100) + '%, dragon cap ' + (global.AETH.balance.dragonVsBossHitCap * 100) + '%'
  })
  check('director tick (no players)', () => {
    global.aethDirectorTick(server)
    return 'ok'
  })
  check('recipes', () => {
    let manager = server.getRecipeManager()
    let ids = ['kubejs:ritual/key_of_the_sovereign', 'kubejs:dragon_egg/fire', 'kubejs:dragon_egg/end', 'kubejs:dragon_summoning_staff_early', 'kubejs:warp_stone_cheap']
    let missing = ids.filter(id => !manager.byKey(id).isPresent())
    if (missing.length > 0) throw 'missing ' + missing
    return ids.length + ' story recipes present'
  })

  let failed = 0
  results.forEach(line => {
    if (line.indexOf('FAIL') == 0) failed++
    console.info('[Aethelgard selftest] ' + line)
    say(ctx, line)
  })
  say(ctx, 'Aethelgard selftest: ' + (results.length - failed) + '/' + results.length + ' passed')
  console.info('[Aethelgard selftest] RESULT ' + (results.length - failed) + '/' + results.length + ' passed')
  return failed == 0 ? 1 : 0
}

ServerEvents.commandRegistry(event => {
  let { commands: Commands, arguments: Arguments } = event

  event.register(
    Commands.literal('aethelgard')
      .requires(source => source.hasPermission(2))
      .then(Commands.literal('selftest').executes(ctx => selfTest(ctx)))
      .then(Commands.literal('cutscene')
        .then(Commands.argument('id', Arguments.STRING.create(event))
          .then(Commands.argument('players', Arguments.PLAYERS.create(event))
            .executes(ctx => {
              let id = Arguments.STRING.getResult(ctx, 'id')
              let players = Arguments.PLAYERS.getResult(ctx, 'players')
              players.forEach(player => global.aethPlayCutscene(ctx.source.server, player, id, 8))
              say(ctx, 'Playing cutscene ' + id + ' for ' + players.size() + ' player(s)')
              return 1
            }))))
      .then(Commands.literal('reset')
        .then(Commands.argument('players', Arguments.PLAYERS.create(event))
          .executes(ctx => {
            let players = Arguments.PLAYERS.getResult(ctx, 'players')
            players.forEach(player => {
              Object.keys(global.AETH.cutscenes).forEach(type => player.stages.remove('aeth_seen_' + global.AETH.cutscenes[type].id))
            })
            say(ctx, 'Boss intro cutscenes reset for ' + players.size() + ' player(s)')
            return 1
          })))
      .then(Commands.literal('relics')
        .then(Commands.argument('players', Arguments.PLAYERS.create(event))
          .executes(ctx => {
            let players = Arguments.PLAYERS.getResult(ctx, 'players')
            players.forEach(player => RELIC_ITEMS.forEach(id => player.give(Item.of(id))))
            say(ctx, 'Gave all six Planar Relics to ' + players.size() + ' player(s)')
            return 1
          })))
  )
})
