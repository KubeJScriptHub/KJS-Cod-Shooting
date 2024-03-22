const gunType1 = { //设置
    fireSpeed: 3, //子弹初速度（与伤害正相关）
    cooldownTick: 3, //开火冷却（刻）
    reloadTick: 40, //装填时间（刻）
    maxAmmo: 30, //每个弹夹子弹数
    ammoSpread1: 0.3, //未蹲下散布
    ammoSpread2: 0.1, //蹲下散布

    ammoId: "minecraft:arrow", //子弹id
    gunId: "kubejs:cod_wand", //枪械id
    reloadItemId: "minecraft:cod", //弹夹id

    firingSound:"minecraft:entity.generic.splash", //开火音效
    firingText:"鳕鱼活力：", //子弹提示
    reloadingSound:"minecraft:entity.cod.flop", //换弹音效
    reloadingText:"正在更换鳕鱼...", //换弹提示
    emptySound:"minecraft:entity.cod.death", //子弹耗尽音效
    emptyText:"这条鳕鱼陷入了昏迷", //子弹耗尽提示
    firingParticle:"minecraft:bubble_pop", //开火时粒子
}

onEvent('item.right_click', event => { //开火（事件）
    let player = event.player
    let handitem = event.player.mainHandItem
    if (event.player.mainHandItem.id == gunType1.gunId && player.minecraftPlayer.getCooldowns().getCooldownPercent(handitem, 1) == 0) {
        if (event.player.persistentData.ammo1 > 0) { //如果弹夹不为空
            gunFire(gunType1, event); //执行开火函数
            event.player.persistentData.ammo1 -= 1 //扣除子弹（注意：如果注册多把枪，请确保nbt变量名不同，在此处是ammo1）
            event.player.runCommandSilent(`title @s actionbar "${ammoType.firingText}${event.player.persistentData.ammo1}/${gunType1.maxAmmo}"`) //子弹显示
        }
        else {
            fireFail(gunType1, event); //开火失败
        }
    }
})

onEvent('item.right_click', event => { //换弹（事件）
    let player = event.player
    let handitem = event.player.offHandItem
    //如果主手持弹夹，副手持枪右键
    if (event.player.mainHandItem.id == gunType1.reloadItemId && event.player.offHandItem.id == "kubejs:event_item_1" && player.minecraftPlayer.getCooldowns().getCooldownPercent(handitem, 1) == 0) {
        gunReload(gunType1, event); //执行换弹函数
        event.player.persistentData.ammo1 = gunType1.maxAmmo //补满子弹
    }
})

function gunFire(ammoType, event) { //开火（函数）
    let player = event.player
    let pos = event.player.block
    let yaw = event.player.yaw * 0.01745
    let pitch = event.player.pitch * 0.01745 //获取坐标和俯仰角（角度制转弧度制）
    let offsetX = Math.sin(yaw) * 2 * -1
    let offsetZ = Math.cos(yaw) * 2 //偏移正交分解

    if (event.player.crouching == false) { //如果没蹲下
        let mx = Math.sin(yaw) * (Math.cos(pitch)) * ammoType.fireSpeed * -1 + ammoType.ammoSpread1 * (Math.random()-0.5)
        let my = -1 * (Math.sin(pitch)) * ammoType.fireSpeed + ammoType.ammoSpread1 * Math.random()
        let mz = Math.cos(yaw) * (Math.cos(pitch)) * ammoType.fireSpeed + ammoType.ammoSpread1 * (Math.random()-0.5) //速度正交分解
        event.server.runCommandSilent(`summon ${ammoType.ammoId} ${pos.x + offsetX} ${pos.y + 1.5} ${pos.z + offsetZ} {Tags:["${player + "ammo"}"],Motion:[${mx},${my},${mz}],ownerName:${player},life:1195,NoGravity:1b}`)
    }
    else if (event.player.crouching == true) { //如果蹲下了
        let mx = Math.sin(yaw) * (Math.cos(pitch)) * ammoType.fireSpeed * -1 + ammoType.ammoSpread2 * (Math.random()-0.5)
        let my = -1 * (Math.sin(pitch)) * ammoType.fireSpeed + ammoType.ammoSpread2 * Math.random()
        let mz = Math.cos(yaw) * (Math.cos(pitch)) * ammoType.fireSpeed + ammoType.ammoSpread2 * (Math.random()-0.5) //速度正交分解
        event.server.runCommandSilent(`summon ${ammoType.ammoId} ${pos.x + offsetX} ${pos.y + 1.5} ${pos.z + offsetZ} {Tags:["${player + "ammo"}"],Motion:[${mx},${my},${mz}],ownerName:${player},life:1195,NoGravity:1b}`)
    }
    event.player.runCommandSilent(`particle ${ammoType.firingParticle} ~${offsetX * 0.2} ~1.8 ~${offsetZ * 0.2} 0.2 0.2 0.2 0 4`) //粒子
    event.player.runCommandSilent(`playsound ${ammoType.firingSound} voice @a[distance=..20] ~ ~ ~ 1 1 0`)     //音效
    event.player.addItemCooldown(event.player.mainHandItem.id, ammoType.cooldownTick)
}

function fireFail(ammoType, event) { //开火失败
    event.player.runCommandSilent(`playsound ${ammoType.emptySound} voice @a[distance=..20] ~ ~ ~ 1 1 0`)
    event.player.runCommandSilent(`title @s actionbar "${ammoType.emptyText}"`) //子弹显示
    event.player.addItemCooldown(event.player.mainHandItem.id, ammoType.cooldownTick)
}

function gunReload(ammoType, event) { //换弹（函数）
    let player = event.player
    event.player.mainHandItem.count -= 1
    event.player.addItemCooldown(event.player.offHandItem.id, ammoType.reloadTick)
    event.player.runCommandSilent(`playsound ${ammoType.reloadingSound} voice @a[distance=..20] ~ ~ ~ 200 1 0`)
    event.server.runCommandSilent(`kill @e[tag=${player + "ammo"}]`)
    event.player.runCommandSilent(`title @s actionbar "${ammoType.reloadingText}"`)
}