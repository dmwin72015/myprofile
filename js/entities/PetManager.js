/**
 * ==============================================================================
 * PetManager - Autonomous Voxel Pets (Shiba Inu JS, Puppy Wangcai & Cat Python)
 * ==============================================================================
 * Features:
 * - 4-legged animated walking & trotting gait with realistic Minecraft limb pivots.
 * - Autonomous AI state machines: wandering, patrolling, resting, eating, sniffing,
 *   rolling on lawn, climbing cat tree, loafing, and playing with toys.
 * - Interactive toy red ball & chew bone.
 * - Proximity awareness: pets look towards nearby family members.
 * - Interactive companion following: clicking/pressing E makes pets happily follow
 *   the player for a stroll with hearts and cute voice reactions!
 */

import * as THREE from 'three';
import { bus } from '../core/EventBus.js';

// 院子地面方块顶部高度 (与 FamilyManager 中角色站立的 y=0.5 一致，宠物原点=脚底)
const GROUND_Y = 0.5;

export class PetManager {
  constructor(scene, builderData) {
    this.scene = scene;
    this.builderData = builderData;
    this.pets = new Map();
    this.toyBall = null;
    this.toyBone = null;

    this.init();
  }

  init() {
    this.createMaterials();
    this.buildShiba();
    this.buildPuppy();
    this.buildCat();
    this.buildToys();
    this.bindEvents();
  }

  createMaterials() {
    this.M = {
      dogFur: new THREE.MeshLambertMaterial({ color: '#e67e22' }),
      dogDark: new THREE.MeshLambertMaterial({ color: '#d35400' }),
      puppyFur: new THREE.MeshLambertMaterial({ color: '#f39c12' }),
      puppyDark: new THREE.MeshLambertMaterial({ color: '#e67e22' }),
      catFur: new THREE.MeshLambertMaterial({ color: '#f39c12' }),
      white: new THREE.MeshLambertMaterial({ color: '#f5f6fa' }),
      pink: new THREE.MeshLambertMaterial({ color: '#ff7675' }),
      black: new THREE.MeshLambertMaterial({ color: '#1e272e' }),
      redCollar: new THREE.MeshLambertMaterial({ color: '#e74c3c' }),
      blueCollar: new THREE.MeshLambertMaterial({ color: '#3498db' }),
      goldBell: new THREE.MeshLambertMaterial({ color: '#f1c40f' })
    };
    this.boxGeo = new THREE.BoxGeometry(1, 1, 1);
  }

  // 1. 🐶 柴犬 · 杰斯 (JS) - 庭院巡视与大门护卫
  buildShiba() {
    const geo = this.boxGeo;
    const M = this.M;
    const group = new THREE.Group();

    // 躯干 (可独立微倾斜)
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.42, 0);

    const body = new THREE.Mesh(geo, M.dogFur);
    body.scale.set(0.52, 0.44, 0.92);
    body.castShadow = true;
    bodyGroup.add(body);

    // 白色胸脯与腹部毛
    const chest = new THREE.Mesh(geo, M.white);
    chest.scale.set(0.42, 0.35, 0.46);
    chest.position.set(0, -0.05, 0.25);
    bodyGroup.add(chest);

    // 红色项圈与金色铃铛
    const collar = new THREE.Mesh(geo, M.redCollar);
    collar.scale.set(0.45, 0.1, 0.45);
    collar.position.set(0, 0.22, 0.38);
    const bell = new THREE.Mesh(geo, M.goldBell);
    bell.scale.set(0.12, 0.12, 0.12);
    bell.position.set(0, 0.16, 0.6);
    bodyGroup.add(collar, bell);

    // 柴犬经典双卷尾 (Pivot at root)
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.18, -0.44);
    const tail = new THREE.Mesh(geo, M.dogFur);
    tail.scale.set(0.14, 0.28, 0.2);
    tail.position.set(0, 0.12, -0.06);
    tail.rotation.x = -0.55;
    tailPivot.add(tail);
    bodyGroup.add(tailPivot);

    // 头部 (Pivot at neck)
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.4, 0.48);

    const headMesh = new THREE.Mesh(geo, M.dogFur);
    headMesh.scale.set(0.44, 0.42, 0.42);
    headMesh.position.set(0, 0.05, 0.04);
    headMesh.castShadow = true;
    headPivot.add(headMesh);

    // 尖尖的柴犬耳朵
    [-0.14, 0.14].forEach(ex => {
      const ear = new THREE.Mesh(geo, M.dogDark);
      ear.scale.set(0.12, 0.16, 0.1);
      ear.position.set(ex, 0.3, 0);
      headPivot.add(ear);
    });

    // 白色口鼻部、黑鼻头与粉色小舌头
    const snout = new THREE.Mesh(geo, M.white);
    snout.scale.set(0.24, 0.18, 0.22);
    snout.position.set(0, -0.06, 0.28);
    const nose = new THREE.Mesh(geo, M.black);
    nose.scale.set(0.08, 0.06, 0.06);
    nose.position.set(0, 0, 0.38);
    const tongue = new THREE.Mesh(geo, M.pink);
    tongue.scale.set(0.08, 0.03, 0.1);
    tongue.position.set(0, -0.14, 0.3);
    headPivot.add(snout, nose, tongue);

    bodyGroup.add(headPivot);
    group.add(bodyGroup);

    // 4 条独立可摆动的犬腿 (Pivot at hip/shoulder joints)
    const makeLeg = (px, pz) => {
      const pivot = new THREE.Group();
      pivot.position.set(px, 0.28, pz);
      const legMesh = new THREE.Mesh(geo, M.dogFur);
      legMesh.scale.set(0.15, 0.26, 0.15);
      legMesh.position.set(0, -0.13, 0);
      legMesh.castShadow = true;
      const pawMesh = new THREE.Mesh(geo, M.white);
      pawMesh.scale.set(0.17, 0.08, 0.17);
      pawMesh.position.set(0, -0.23, 0.02);
      pivot.add(legMesh, pawMesh);
      group.add(pivot);
      return pivot;
    };

    const legFL = makeLeg(-0.19, 0.28);
    const legFR = makeLeg(0.19, 0.28);
    const legBL = makeLeg(-0.19, -0.28);
    const legBR = makeLeg(0.19, -0.28);

    group.position.set(-22.5, GROUND_Y, 0.2);
    group.rotation.y = -Math.PI / 4;
    this.scene.add(group);

    // 交互绑定
    const uData = { targetKey: 'pet_dog', tooltipText: '🐶 柴犬 · 杰斯 (JS) - 汪汪！摇着卷尾巴在庭院巡视' };
    group.userData = uData;
    group.traverse(child => { if (child.isMesh) child.userData = uData; });
    this.builderData.interactables.push(group);

    // 柴犬特色巡逻路径与兴趣点
    const waypoints = [
      { pos: new THREE.Vector3(-22.5, GROUND_Y, 0.5), action: 'sniff', duration: 4.5, desc: '闻花香与刨地' },
      { pos: new THREE.Vector3(-24.5, GROUND_Y, -1.0), action: 'eat', duration: 6.0, desc: '吃狗粮与饮水' },
      { pos: new THREE.Vector3(-17.2, GROUND_Y, 8.0), action: 'sit', duration: 5.5, desc: '在紫藤长椅旁看风景' },
      { pos: new THREE.Vector3(-14.0, GROUND_Y, 4.0), action: 'drink', duration: 4.0, desc: '在水景喷泉旁喝泉水' },
      { pos: new THREE.Vector3(-12.5, GROUND_Y, 18.0), action: 'guard', duration: 7.0, desc: '正南大门守卫望风' },
      { pos: new THREE.Vector3(-18.5, GROUND_Y, 5.5), action: 'spin', duration: 3.5, desc: '在虞美人花丛中转圈圈' },
      { pos: new THREE.Vector3(-8.0, GROUND_Y, 1.5), action: 'sit', duration: 5.0, desc: '在正门等待主人回家' }
    ];

    this.pets.set('dog', {
      id: 'dog',
      group,
      bodyGroup,
      headPivot,
      tailPivot,
      legFL,
      legFR,
      legBL,
      legBR,
      baseY: GROUND_Y,
      state: 'patrol',
      stateTimer: 2.0,
      currentWpIndex: 0,
      waypoints,
      walkPhase: 0,
      speed: 1.9,
      followTimer: 0,
      action: 'idle'
    });
  }

  // 2. 🐾 金毛幼犬 · 旺财 (Puppy) - 活泼奔跑、推红球与草坪打滚
  buildPuppy() {
    const geo = this.boxGeo;
    const M = this.M;
    const group = new THREE.Group();

    // 幼犬身躯
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.3, 0);

    const body = new THREE.Mesh(geo, M.puppyFur);
    body.scale.set(0.38, 0.32, 0.6);
    body.castShadow = true;
    bodyGroup.add(body);

    // 蓝色小项圈
    const collar = new THREE.Mesh(geo, M.blueCollar);
    collar.scale.set(0.32, 0.08, 0.32);
    collar.position.set(0, 0.16, 0.26);
    bodyGroup.add(collar);

    // 欢快小短尾 (高频摇动)
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.12, -0.3);
    const tail = new THREE.Mesh(geo, M.puppyFur);
    tail.scale.set(0.08, 0.2, 0.08);
    tail.position.set(0, 0.08, -0.05);
    tail.rotation.x = -0.65;
    tailPivot.add(tail);
    bodyGroup.add(tailPivot);

    // 幼犬头部 (带大耳朵与可爱歪头)
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.26, 0.32);

    const headMesh = new THREE.Mesh(geo, M.puppyFur);
    headMesh.scale.set(0.36, 0.34, 0.34);
    headMesh.position.set(0, 0.05, 0.02);
    headMesh.castShadow = true;
    headPivot.add(headMesh);

    // 耷拉的深金黄色垂耳
    [-0.18, 0.18].forEach(ex => {
      const ear = new THREE.Mesh(geo, M.puppyDark);
      ear.scale.set(0.1, 0.2, 0.1);
      ear.position.set(ex, 0.12, -0.02);
      headPivot.add(ear);
    });

    // 圆润小黑鼻
    const nose = new THREE.Mesh(geo, M.black);
    nose.scale.set(0.08, 0.06, 0.08);
    nose.position.set(0, 0, 0.2);
    headPivot.add(nose);

    bodyGroup.add(headPivot);
    group.add(bodyGroup);

    // 4 条萌动短腿
    const makeLeg = (px, pz) => {
      const pivot = new THREE.Group();
      pivot.position.set(px, 0.2, pz);
      const legMesh = new THREE.Mesh(geo, M.puppyFur);
      legMesh.scale.set(0.12, 0.2, 0.12);
      legMesh.position.set(0, -0.1, 0);
      legMesh.castShadow = true;
      pivot.add(legMesh);
      group.add(pivot);
      return pivot;
    };

    const legFL = makeLeg(-0.14, 0.2);
    const legFR = makeLeg(0.14, 0.2);
    const legBL = makeLeg(-0.14, -0.2);
    const legBR = makeLeg(0.14, -0.2);

    group.position.set(-20.2, GROUND_Y, 2.0);
    group.rotation.y = -Math.PI / 3;
    this.scene.add(group);

    // 交互绑定
    const uData = { targetKey: 'pet_puppy', tooltipText: '🐾 金毛幼犬 · 旺财 (Puppy) - 呜汪！活泼地追球跑与打滚撒欢' };
    group.userData = uData;
    group.traverse(child => { if (child.isMesh) child.userData = uData; });
    this.builderData.interactables.push(group);

    // 幼犬活跃兴趣点
    const waypoints = [
      { pos: new THREE.Vector3(-20.8, GROUND_Y, 2.6), action: 'play_ball', duration: 4.5, desc: '推红球玩耍' },
      { pos: new THREE.Vector3(-19.5, GROUND_Y, 2.2), action: 'chew_bone', duration: 5.0, desc: '啃磨牙肉骨头' },
      { pos: new THREE.Vector3(-16.5, GROUND_Y, 4.0), action: 'roll', duration: 4.0, desc: '草坪四脚朝天打滚' },
      { pos: new THREE.Vector3(-22.0, GROUND_Y, 0.8), action: 'spin', duration: 3.5, desc: '找杰斯哥哥贴贴撒娇' },
      { pos: new THREE.Vector3(-15.0, GROUND_Y, 8.5), action: 'bow', duration: 4.0, desc: '小狗伸懒腰作揖' },
      { pos: new THREE.Vector3(-11.5, GROUND_Y, 5.0), action: 'run', duration: 3.0, desc: '在小径上欢快冲刺' }
    ];

    this.pets.set('puppy', {
      id: 'puppy',
      group,
      bodyGroup,
      headPivot,
      tailPivot,
      legFL,
      legFR,
      legBL,
      legBR,
      baseY: GROUND_Y,
      state: 'patrol',
      stateTimer: 1.5,
      currentWpIndex: 0,
      waypoints,
      walkPhase: 0,
      speed: 2.6,
      followTimer: 0,
      action: 'idle'
    });
  }

  // 3. 🐱 橘猫 · 派森 (Python) - 客厅地毯、猫爬架登高与优雅慢步
  buildCat() {
    const geo = this.boxGeo;
    const M = this.M;
    const group = new THREE.Group();

    // 猫咪身躯 (纤细优雅)
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.28, 0);

    const body = new THREE.Mesh(geo, M.catFur);
    body.scale.set(0.38, 0.32, 0.68);
    body.castShadow = true;
    bodyGroup.add(body);

    // 纯白肚皮毛
    const belly = new THREE.Mesh(geo, M.white);
    belly.scale.set(0.28, 0.1, 0.5);
    belly.position.set(0, -0.12, 0);
    bodyGroup.add(belly);

    // 柔软猫尾 (长而可 S 型摆动)
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.08, -0.34);
    const tail = new THREE.Mesh(geo, M.catFur);
    tail.scale.set(0.09, 0.09, 0.44);
    tail.position.set(0, 0.08, -0.18);
    tail.rotation.x = 0.45;
    const tailTip = new THREE.Mesh(geo, M.white);
    tailTip.scale.set(0.1, 0.1, 0.12);
    tailTip.position.set(0, 0.08, -0.38);
    tailPivot.add(tail, tailTip);
    bodyGroup.add(tailPivot);

    // 猫头 (圆润可爱，粉内耳)
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.24, 0.34);

    const headMesh = new THREE.Mesh(geo, M.catFur);
    headMesh.scale.set(0.35, 0.33, 0.33);
    headMesh.position.set(0, 0.04, 0.02);
    headMesh.castShadow = true;
    headPivot.add(headMesh);

    // 尖尖猫耳 (带粉色耳廓)
    [-0.12, 0.12].forEach(ex => {
      const ear = new THREE.Mesh(geo, M.catFur);
      ear.scale.set(0.09, 0.12, 0.08);
      ear.position.set(ex, 0.22, 0);
      const earInner = new THREE.Mesh(geo, M.pink);
      earInner.scale.set(0.05, 0.08, 0.02);
      earInner.position.set(ex, 0.22, 0.04);
      headPivot.add(ear, earInner);
    });

    // 白色胡须区与粉色小鼻尖
    const muzzle = new THREE.Mesh(geo, M.white);
    muzzle.scale.set(0.18, 0.11, 0.1);
    muzzle.position.set(0, -0.04, 0.18);
    const nose = new THREE.Mesh(geo, M.pink);
    nose.scale.set(0.06, 0.04, 0.04);
    nose.position.set(0, -0.01, 0.23);
    headPivot.add(muzzle, nose);

    bodyGroup.add(headPivot);
    group.add(bodyGroup);

    // 4 条优雅猫腿 (带白手套/白袜袜)
    const makeLeg = (px, pz) => {
      const pivot = new THREE.Group();
      pivot.position.set(px, 0.18, pz);
      const legMesh = new THREE.Mesh(geo, M.catFur);
      legMesh.scale.set(0.11, 0.18, 0.11);
      legMesh.position.set(0, -0.09, 0);
      legMesh.castShadow = true;
      const sockMesh = new THREE.Mesh(geo, M.white);
      sockMesh.scale.set(0.12, 0.06, 0.12);
      sockMesh.position.set(0, -0.15, 0.01);
      pivot.add(legMesh, sockMesh);
      group.add(pivot);
      return pivot;
    };

    const legFL = makeLeg(-0.13, 0.22);
    const legFR = makeLeg(0.13, 0.22);
    const legBL = makeLeg(-0.13, -0.22);
    const legBR = makeLeg(0.13, -0.22);

    group.position.set(-16, GROUND_Y, -6);
    group.rotation.y = Math.PI / 4;
    this.scene.add(group);

    // 交互绑定
    const uData = { targetKey: 'pet_cat', tooltipText: '🐱 橘猫 · 派森 (Python) - 喵呜~ 优雅散步、揣手手打呼噜' };
    group.userData = uData;
    group.traverse(child => { if (child.isMesh) child.userData = uData; });
    this.builderData.interactables.push(group);

    // 猫咪兴趣点 (室内壁炉、猫爬架、沙发与紫藤长廊)
    const waypoints = [
      { pos: new THREE.Vector3(-16.0, GROUND_Y, -6.0), action: 'loaf', duration: 7.0, desc: '壁炉前地毯揣手手' },
      { pos: new THREE.Vector3(-13.5, GROUND_Y, -8.0), action: 'stretch', duration: 5.0, desc: '沙发旁优雅伸懒腰' },
      { pos: new THREE.Vector3(-19.0, 1.35, -2.0), action: 'climb', duration: 6.5, desc: '跳上猫爬架居高临下' },
      { pos: new THREE.Vector3(-8.5, GROUND_Y, -4.5), action: 'loaf', duration: 6.0, desc: '窗边看小鸟' },
      { pos: new THREE.Vector3(-17.0, GROUND_Y, 8.5), action: 'groom', duration: 5.5, desc: '紫藤花架下洗脸舔爪' },
      { pos: new THREE.Vector3(-11.5, GROUND_Y, -2.5), action: 'sit', duration: 4.5, desc: '台阶上晒太阳' }
    ];

    this.pets.set('cat', {
      id: 'cat',
      group,
      bodyGroup,
      headPivot,
      tailPivot,
      legFL,
      legFR,
      legBL,
      legBR,
      baseY: GROUND_Y,
      state: 'patrol',
      stateTimer: 3.0,
      currentWpIndex: 0,
      waypoints,
      walkPhase: 0,
      speed: 1.5,
      followTimer: 0,
      action: 'loaf'
    });
  }

  // 狗狗玩具：磨牙肉骨头与弹力红球
  buildToys() {
    const geo = this.boxGeo;
    const M = this.M;

    // 骨头
    this.toyBone = new THREE.Mesh(geo, M.white);
    this.toyBone.scale.set(0.45, 0.12, 0.14);
    this.toyBone.position.set(-19.5, GROUND_Y + 0.08, 2.2);
    this.toyBone.rotation.y = 0.5;
    this.scene.add(this.toyBone);

    // 弹力红球
    const redMat = new THREE.MeshLambertMaterial({ color: '#e84118' });
    this.toyBall = new THREE.Mesh(geo, redMat);
    this.toyBall.scale.set(0.26, 0.26, 0.26);
    this.toyBall.position.set(-20.8, GROUND_Y + 0.13, 2.6);
    this.scene.add(this.toyBall);
  }

  bindEvents() {
    // 监听各类召唤、抚摸、摇尾巴与喂食指令
    bus.on('pet:summon', (data) => {
      this.summon((data && data.petId) || 'all');
    });

    bus.on('pet:caress', (data) => {
      this.caress(data && data.petId);
    });

    bus.on('pet:wag', (data) => {
      this.wagTail(data && data.petId);
    });

    bus.on('pet:feed', (data) => {
      this.feed(data && data.petId);
    });

    bus.on('pet:interact', (targetKey) => {
      const petId = targetKey.replace('pet_', '');
      bus.emit('pet:open_quick_menu', { petId });
    });
  }

  // 1. 📢 召唤宠物 (支持指定宠物或全体一键召唤)
  summon(petId = 'all') {
    if (window.MCAudio && window.MCAudio.playWhistle) {
      window.MCAudio.playWhistle();
    }
    const targetPets = petId === 'all' ? Array.from(this.pets.values()) : [this.pets.get(petId)].filter(Boolean);

    targetPets.forEach((pet, i) => {
      pet.state = 'sprinting_to_player';
      pet.followTimer = 35.0; // 陪伴 35 秒
      pet.walkPhase = 0;
      setTimeout(() => {
        bus.emit('fx:hearts', pet.group.position);
      }, i * 200);
    });

    if (petId === 'all') {
      bus.emit('toast:show', {
        kicker: '🔔 吹响萌宠召唤哨',
        title: '【全员集合！】小狗和小猫听到哨声，立刻从庭院各处飞奔向你跑来！'
      });
    } else {
      const names = { dog: '柴犬 · 杰斯', puppy: '金毛幼犬 · 旺财', cat: '橘猫 · 派森' };
      bus.emit('toast:show', {
        kicker: '📢 召唤宠物',
        title: `【${names[petId] || '萌宠'}】竖起耳朵听到了你的呼唤，迈开小碎步飞速朝你奔来！`
      });
    }
  }

  // 2. ✋ 温柔抚摸 (歪头享受、全身酥软、舒服呼噜与汪汪撒娇)
  caress(petId) {
    const pet = this.pets.get(petId);
    if (!pet) return;

    pet.state = 'acting';
    pet.action = 'petted';
    pet.stateTimer = 4.2;
    pet.followTimer = 25.0;
    this.resetLegs(pet);

    if (window.app && window.app.worldScene && window.app.worldScene.familyManager) {
      const activeChar = window.app.worldScene.familyManager.getActiveCharacter();
      if (activeChar && activeChar.playPetGesture) activeChar.playPetGesture(2.5);
    }

    if (petId === 'cat') {
      if (window.MCAudio) {
        if (window.MCAudio.playPurr) window.MCAudio.playPurr();
        setTimeout(() => { if (window.MCAudio.playMeow) window.MCAudio.playMeow(); }, 350);
      }
      bus.emit('toast:show', {
        kicker: '✋ 温柔抚摸 · 派森',
        title: '🐱 派森舒服地眯起猫瞳，喉咙里发出治愈的咕噜咕噜声，软绵绵地把下巴垫在你的手心里~'
      });
    } else if (petId === 'puppy') {
      if (window.MCAudio && window.MCAudio.playBark) window.MCAudio.playBark(1.5);
      bus.emit('toast:show', {
        kicker: '✋ 宠溺揉揉 · 旺财',
        title: '🐾 旺财开心地翻出圆滚滚的肚皮求挠挠，四只小短腿欢快地蹬啊蹬，尾巴快摇成小螺旋桨了！'
      });
    } else {
      if (window.MCAudio && window.MCAudio.playBark) window.MCAudio.playBark(1.0);
      bus.emit('toast:show', {
        kicker: '✋ 亲昵摸头 · 杰斯',
        title: '🐕 杰斯把毛茸茸的大脑门贴在你的掌心，咧开嘴露出标志性柴犬治愈微笑，卷尾巴热烈摇晃！'
      });
    }

    bus.emit('fx:hearts', pet.group.position);
    bus.emit('fx:musicnote', pet.group.position);
    bus.emit('stats:update', { hearts: 10 });
  }

  // 3. 🐕 逗它摇尾巴 (极速螺旋桨式高频摇摆 + 扭屁股舞)
  wagTail(petId) {
    const pet = this.pets.get(petId);
    if (!pet) return;

    pet.state = 'acting';
    pet.action = 'wag_extreme';
    pet.stateTimer = 5.0;
    this.resetLegs(pet);

    if (petId === 'cat') {
      if (window.MCAudio && window.MCAudio.playMeow) window.MCAudio.playMeow();
      bus.emit('toast:show', {
        kicker: '🐈 逗它摇尾巴 · 派森',
        title: '🐱 派森高高竖起毛茸茸的长尾巴，优雅地打着小卷儿甩来甩去，眼神里充满自信与惬意！'
      });
    } else if (petId === 'puppy') {
      if (window.MCAudio && window.MCAudio.playBark) window.MCAudio.playBark(1.55);
      bus.emit('toast:show', {
        kicker: '🎾 逗它摇尾巴 · 旺财',
        title: '🐾 旺财开启超高速摇尾模式！小屁股欢快扭动，两只大耳朵扑闪扑闪，原地起跳蹦高高！'
      });
    } else {
      if (window.MCAudio && window.MCAudio.playBark) window.MCAudio.playBark(1.05);
      bus.emit('toast:show', {
        kicker: '🐕 逗它摇尾巴 · 杰斯',
        title: '🐶 杰斯的尾巴像螺旋桨一样高速甩动！开心地迈着欢快小碎步在原地连转三圈！'
      });
    }

    bus.emit('fx:hearts', pet.group.position);
    bus.emit('fx:musicnote', pet.group.position);
  }

  // 4. 🍖 喂食爱心零食
  feed(petId) {
    const pet = this.pets.get(petId);
    if (!pet) return;

    pet.state = 'acting';
    pet.action = 'eat';
    pet.stateTimer = 4.5;
    this.resetLegs(pet);

    if (window.MCAudio && window.MCAudio.playEat) window.MCAudio.playEat();

    const treats = {
      dog: '🥩 多汁风干黑椒牛肉粒',
      puppy: '🦴 奶香高钙磨牙小骨头',
      cat: '🐟 鲜美冻干金枪鱼柳'
    };

    bus.emit('toast:show', {
      kicker: '🍖 奖励爱心小零食',
      title: `【品尝美味】给小家伙喂了一块${treats[petId] || '小零食'}！吃得津津有味，心满意足！`
    });

    bus.emit('fx:hearts', pet.group.position);
  }

  // 每一帧驱动全部宠物的心智 AI、动作姿态与腿部迈步循环
  update(delta, time, activeChar) {
    const activePlayerPos = activeChar ? activeChar.group.position : null;

    this.pets.forEach((pet) => {
      // 0. 听到哨声飞奔向玩家身边
      if (pet.state === 'sprinting_to_player') {
        if (!activePlayerPos) {
          pet.state = 'patrol';
          return;
        }
        const offsetAngle = pet.id === 'dog' ? 0.7 : (pet.id === 'puppy' ? -0.7 : 0);
        const targetPos = activePlayerPos.clone();
        targetPos.x += Math.cos(activeChar.group.rotation.y + offsetAngle) * 1.5;
        targetPos.z += Math.sin(activeChar.group.rotation.y + offsetAngle) * 1.5;

        const dist = Math.hypot(targetPos.x - pet.group.position.x, targetPos.z - pet.group.position.z);
        if (dist > 1.3) {
          this.moveTowards(pet, targetPos, delta, time, true);
        } else {
          // 顺利到达玩家身边，开始欢快撒娇
          this.resetLegs(pet);
          pet.state = 'acting';
          pet.action = 'wag_extreme';
          pet.stateTimer = 4.0;
          if (pet.id === 'cat') {
            if (window.MCAudio && window.MCAudio.playMeow) window.MCAudio.playMeow();
          } else {
            if (window.MCAudio && window.MCAudio.playBark) window.MCAudio.playBark(pet.id === 'puppy' ? 1.45 : 1.0);
          }
        }
        return;
      }

      // 1. 跟随玩家模式驱动
      if (pet.followTimer > 0 && activePlayerPos) {
        pet.followTimer -= delta;
        const targetPos = activePlayerPos.clone();
        // 稍微保持在玩家身侧或斜后方 1.6 米处，不挡路
        const offsetAngle = pet.id === 'dog' ? 0.7 : (pet.id === 'puppy' ? -0.7 : 0);
        targetPos.x += Math.cos(activeChar.group.rotation.y + offsetAngle) * 1.6;
        targetPos.z += Math.sin(activeChar.group.rotation.y + offsetAngle) * 1.6;

        this.moveTowards(pet, targetPos, delta, time, true);

        if (pet.followTimer <= 0) {
          pet.state = 'patrol';
          pet.stateTimer = 2.0;
        }
        return;
      }

      // 2. 自主漫步与行为模式
      if (pet.state === 'patrol') {
        const wp = pet.waypoints[pet.currentWpIndex];
        const dist = Math.hypot(wp.pos.x - pet.group.position.x, wp.pos.z - pet.group.position.z);

        if (dist > 0.35) {
          // 移动向当前路标
          this.moveTowards(pet, wp.pos, delta, time, false);
        } else {
          // 到达目标，开启专属活动
          pet.state = 'acting';
          pet.action = wp.action;
          pet.stateTimer = wp.duration || 4.5;
          // 复位腿部姿态
          this.resetLegs(pet);
        }
      } else if (pet.state === 'acting') {
        // 执行行为动作 (吃/喝/打滚/伸懒腰/揣手手)
        pet.stateTimer -= delta;
        this.performAction(pet, delta, time, activePlayerPos);

        if (pet.stateTimer <= 0) {
          // 切换到下一个路标
          pet.currentWpIndex = (pet.currentWpIndex + 1) % pet.waypoints.length;
          pet.state = 'patrol';
        }
      }
    });
  }

  // 朝目标移动，带自然转身插值与 4 腿自然交替迈步
  moveTowards(pet, targetPos, delta, time, isRunning) {
    const p = pet.group.position;
    const dx = targetPos.x - p.x;
    const dz = targetPos.z - p.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 0.2) {
      this.resetLegs(pet);
      // 停下时面向玩家或目标
      return;
    }

    // 1. 平滑旋转朝向目标
    const targetAngle = Math.atan2(dx, dz);
    let diff = (targetAngle - pet.group.rotation.y) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    pet.group.rotation.y += diff * Math.min(1, delta * 8.0);

    // 2. 水平位移
    const currentSpeed = isRunning ? pet.speed * 1.45 : pet.speed;
    const moveDist = Math.min(dist, currentSpeed * delta);
    p.x += (dx / dist) * moveDist;
    p.z += (dz / dist) * moveDist;

    // 高度平滑匹配 (地面站立 / 猫咪登高猫爬架)
    const targetY = targetPos.y || GROUND_Y;
    p.y += (targetY - p.y) * Math.min(1, delta * 6.0);

    // 3. 四腿迈步循环与轻微起伏
    const cycleSpeed = isRunning ? 16 : 10;
    pet.walkPhase += delta * cycleSpeed;
    const legAngle = Math.sin(pet.walkPhase) * (isRunning ? 0.75 : 0.55);

    // 对角步态 (Diagonal Gait)
    pet.legFL.rotation.x = legAngle;
    pet.legFR.rotation.x = -legAngle;
    pet.legBL.rotation.x = -legAngle;
    pet.legBR.rotation.x = legAngle;

    // 走路轻微颠簸跳跃感
    pet.bodyGroup.position.y = (pet.id === 'dog' ? 0.42 : (pet.id === 'puppy' ? 0.3 : 0.28)) + Math.abs(Math.sin(pet.walkPhase)) * 0.035;

    // 尾巴欢快摆动
    const tailSpeed = pet.id === 'puppy' ? 15 : (pet.id === 'dog' ? 10 : 4);
    pet.tailPivot.rotation.y = Math.sin(time * tailSpeed) * 0.5;

    // 头部自然平视微抬
    pet.headPivot.rotation.x = -0.05;
    pet.headPivot.rotation.z = Math.sin(pet.walkPhase * 0.5) * 0.05;
    pet.bodyGroup.rotation.z = 0;
  }

  // 专属活动动作演出
  performAction(pet, delta, time, activePlayerPos) {
    const action = pet.action;

    // 如果玩家在附近 (< 3.2米)，宠物好奇地将头转向玩家
    if (activePlayerPos) {
      const dPlayer = Math.hypot(activePlayerPos.x - pet.group.position.x, activePlayerPos.z - pet.group.position.z);
      if (dPlayer < 3.2) {
        const lookDir = Math.atan2(activePlayerPos.x - pet.group.position.x, activePlayerPos.z - pet.group.position.z);
        const relAngle = lookDir - pet.group.rotation.y;
        pet.headPivot.rotation.y = THREE.MathUtils.lerp(pet.headPivot.rotation.y, Math.max(-0.6, Math.min(0.6, relAngle)), 0.1);
        pet.tailPivot.rotation.y = Math.sin(time * 12) * 0.6; // 看到主人尾巴狂摇
      } else {
        pet.headPivot.rotation.y = THREE.MathUtils.lerp(pet.headPivot.rotation.y, 0, 0.1);
      }
    }

    if (action === 'petted') {
      // 被摸摸：惬意低头微仰、身躯轻柔晃动、尾巴高频摇晃
      pet.headPivot.rotation.x = -0.15;
      pet.headPivot.rotation.z = Math.sin(time * 3) * 0.15 + 0.1;
      pet.tailPivot.rotation.y = Math.sin(time * 20) * 0.75;
      pet.bodyGroup.rotation.z = Math.sin(time * 5) * 0.08;
      pet.bodyGroup.position.y = (pet.id === 'dog' ? 0.38 : (pet.id === 'puppy' ? 0.26 : 0.22));
      return;
    } else if (action === 'wag_extreme') {
      // 极速摇尾巴与开心的扭屁股舞
      pet.tailPivot.rotation.y = Math.sin(time * 24) * 0.85;
      pet.bodyGroup.rotation.z = Math.sin(time * 12) * 0.16;
      if (pet.id === 'dog') {
        pet.group.rotation.y += delta * 3.5; // 兴奋转圈
        pet.bodyGroup.position.y = 0.42 + Math.abs(Math.sin(time * 10)) * 0.06;
      } else if (pet.id === 'puppy') {
        pet.bodyGroup.position.y = 0.3 + Math.abs(Math.sin(time * 12)) * 0.12; // 蹦蹦跳跳
        pet.headPivot.rotation.z = Math.sin(time * 8) * 0.25;
      } else if (pet.id === 'cat') {
        pet.tailPivot.rotation.x = -0.25; // 尾巴高竖
        pet.headPivot.rotation.x = -0.1 + Math.sin(time * 2) * 0.05;
      }
      return;
    }

    if (action === 'eat' || action === 'drink') {
      // 低头吃狗粮或喝泉水
      pet.headPivot.rotation.x = 0.45 + Math.sin(time * 6) * 0.08;
      pet.tailPivot.rotation.y = Math.sin(time * 9) * 0.35;
      this.resetLegs(pet);
    } else if (action === 'sniff') {
      // 闻花香、鼻翼贴地吸气
      pet.headPivot.rotation.x = 0.35 + Math.sin(time * 5) * 0.06;
      pet.headPivot.rotation.z = Math.sin(time * 2.5) * 0.1;
      pet.tailPivot.rotation.y = Math.sin(time * 8) * 0.45;
      this.resetLegs(pet);
    } else if (action === 'sit' || action === 'guard') {
      // 坐姿：后腿微屈，挺起胸脯
      pet.legBL.rotation.x = 0.6;
      pet.legBR.rotation.x = 0.6;
      pet.legFL.rotation.x = 0.05;
      pet.legFR.rotation.x = 0.05;
      pet.bodyGroup.position.y = (pet.id === 'dog' ? 0.36 : 0.24);
      pet.bodyGroup.rotation.x = -0.15;
      pet.headPivot.rotation.x = 0.12;
      pet.tailPivot.rotation.y = Math.sin(time * 6) * 0.4;
    } else if (action === 'spin') {
      // 兴奋原地 360 度转圈圈
      pet.group.rotation.y += delta * 4.0;
      pet.tailPivot.rotation.y = Math.sin(time * 16) * 0.7;
      pet.legFL.rotation.x = Math.sin(time * 14) * 0.4;
      pet.legFR.rotation.x = -pet.legFL.rotation.x;
      pet.legBL.rotation.x = -pet.legFL.rotation.x;
      pet.legBR.rotation.x = pet.legFL.rotation.x;
    } else if (action === 'roll') {
      // 幼犬草坪四脚朝天打滚撒欢
      const roll = Math.sin(time * 3.5);
      pet.bodyGroup.rotation.z = roll * 1.5; // 侧躺或仰面
      pet.bodyGroup.position.y = 0.18;
      pet.legFL.rotation.z = Math.sin(time * 8) * 0.5 + 0.3;
      pet.legFR.rotation.z = -Math.sin(time * 8) * 0.5 - 0.3;
      pet.legBL.rotation.z = Math.sin(time * 8) * 0.5 + 0.3;
      pet.legBR.rotation.z = -Math.sin(time * 8) * 0.5 - 0.3;
      pet.tailPivot.rotation.y = Math.sin(time * 14) * 0.6;
    } else if (action === 'bow') {
      // 小狗伸懒腰作揖：前腿伸平下趴，屁股撅起
      pet.legFL.rotation.x = -0.6;
      pet.legFR.rotation.x = -0.6;
      pet.legBL.rotation.x = 0.2;
      pet.legBR.rotation.x = 0.2;
      pet.bodyGroup.rotation.x = -0.28;
      pet.tailPivot.rotation.x = 0.3;
      pet.tailPivot.rotation.y = Math.sin(time * 12) * 0.6;
    } else if (action === 'play_ball') {
      // 扑腾红球
      if (this.toyBall) {
        this.toyBall.position.x = -20.8 + Math.sin(time * 4) * 0.35;
        this.toyBall.rotation.z += delta * 3;
      }
      pet.headPivot.rotation.x = 0.2 + Math.abs(Math.sin(time * 6)) * 0.15;
      pet.tailPivot.rotation.y = Math.sin(time * 16) * 0.65;
      pet.legFL.rotation.x = Math.sin(time * 8) * 0.35;
      pet.legFR.rotation.x = -pet.legFL.rotation.x;
    } else if (action === 'chew_bone') {
      // 趴在骨头前啃骨头
      pet.bodyGroup.position.y = 0.18;
      pet.legFL.rotation.x = -0.5;
      pet.legFR.rotation.x = -0.5;
      pet.legBL.rotation.x = 0.5;
      pet.legBR.rotation.x = 0.5;
      pet.headPivot.rotation.x = 0.38 + Math.sin(time * 7) * 0.08;
      pet.tailPivot.rotation.y = Math.sin(time * 7) * 0.3;
    } else if (action === 'loaf') {
      // 猫咪揣手手 (Loaf / 农民揣)
      pet.bodyGroup.position.y = (pet.group.position.y > 0.5 ? 1.48 : 0.18);
      pet.bodyGroup.rotation.x = 0;
      pet.bodyGroup.rotation.z = 0;
      pet.legFL.rotation.x = 0.7;
      pet.legFR.rotation.x = 0.7;
      pet.legBL.rotation.x = -0.7;
      pet.legBR.rotation.x = -0.7;
      // 惬意闭眼呼噜呼噜：胸部轻柔呼吸浮动与慢节拍甩尾
      pet.bodyGroup.scale.y = 1.0 + Math.sin(time * 2.5) * 0.03;
      pet.headPivot.rotation.x = -0.1 + Math.sin(time * 1.5) * 0.04;
      pet.tailPivot.rotation.y = Math.sin(time * 2.2) * 0.3;
    } else if (action === 'stretch') {
      // 优雅猫伸懒腰：前胸贴地，后背拱起
      pet.legFL.rotation.x = -0.7;
      pet.legFR.rotation.x = -0.7;
      pet.legBL.rotation.x = 0.4;
      pet.legBR.rotation.x = 0.4;
      pet.bodyGroup.rotation.x = -0.32;
      pet.tailPivot.rotation.x = 0.6;
      pet.tailPivot.rotation.y = Math.sin(time * 4) * 0.2;
    } else if (action === 'climb') {
      // 站在猫爬架高处望远
      this.resetLegs(pet);
      pet.headPivot.rotation.y = Math.sin(time * 1.2) * 0.35;
      pet.tailPivot.rotation.y = Math.sin(time * 2.5) * 0.25;
    } else if (action === 'groom') {
      // 洗脸舔爪爪
      pet.legFL.rotation.x = 0.8 + Math.sin(time * 8) * 0.2;
      pet.headPivot.rotation.x = 0.2;
      pet.headPivot.rotation.z = 0.25;
      pet.tailPivot.rotation.y = Math.sin(time * 3) * 0.2;
    }
  }

  resetLegs(pet) {
    pet.legFL.rotation.set(0, 0, 0);
    pet.legFR.rotation.set(0, 0, 0);
    pet.legBL.rotation.set(0, 0, 0);
    pet.legBR.rotation.set(0, 0, 0);
    pet.bodyGroup.rotation.set(0, 0, 0);
    pet.bodyGroup.position.y = (pet.id === 'dog' ? 0.42 : (pet.id === 'puppy' ? 0.3 : 0.28));
  }
}
