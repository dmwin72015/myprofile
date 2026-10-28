/**
 * ==============================================================================
 * BicycleModel - High-Detail Minecraft Voxel Sports Bicycle
 * ==============================================================================
 * Features:
 * - Geometric voxel frame with top tube, down tube, fork, and chainstay.
 * - Articulated rotating front & rear wheels with rubber tires and metallic hubs.
 * - Handlebars with hand grips, golden bell, front basket with flower decoration.
 * - Leather saddle seat, crankset and rotating pedals.
 * - Retractable kickstand for realistic parking.
 * - Synchronized mounting, dismounting, dynamic pedaling, and wheel spinning!
 */

import * as THREE from 'three';
import { bus } from '../core/EventBus.js';

export class BicycleModel {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.isRidden = false;
    this.rider = null;

    // 旋转部件
    this.wheelF = null;
    this.wheelR = null;
    this.crank = null;
    this.kickstand = null;

    // 默认停放位置 (前院石砖主干道旁 x: -10.5, z: 7.5)
    this.parkedPos = new THREE.Vector3(-10.5, 0, 7.5);
    this.parkedRotY = -0.35;

    this.init();
  }

  init() {
    this.build();
    this.park(this.parkedPos.x, this.parkedPos.z, this.parkedRotY);
    this.scene.add(this.group);
  }

  build() {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    // 材质定义
    const frameMat = new THREE.MeshLambertMaterial({ color: '#00b894' }); // 运动薄荷绿车架
    const frameAccent = new THREE.MeshLambertMaterial({ color: '#0984e3' }); // 活力天蓝点缀
    const tireMat = new THREE.MeshLambertMaterial({ color: '#2d3436' });  // 橡胶黑车胎
    const metalMat = new THREE.MeshLambertMaterial({ color: '#dfe6e9' }); // 银色金属车辐与轮毂
    const seatMat = new THREE.MeshLambertMaterial({ color: '#5d4127' });  // 棕色复古皮鞍
    const gripMat = new THREE.MeshLambertMaterial({ color: '#1e272e' });  // 握把防滑胶
    const bellMat = new THREE.MeshLambertMaterial({ color: '#f1c40f' });  // 金色车铃
    const basketMat = new THREE.MeshLambertMaterial({ color: '#d35400' });// 藤编置物前篮
    const flowerMat = new THREE.MeshLambertMaterial({ color: '#ff7675' });// 装饰小花

    // 1. 车身主框架 (Main Frame)
    const frameGroup = new THREE.Group();

    // 下斜主梁 (Bottom Tube)
    const downTube = new THREE.Mesh(boxGeo, frameMat);
    downTube.scale.set(0.1, 0.1, 0.95);
    downTube.position.set(0, 0.52, 0.15);
    downTube.rotation.x = 0.35;
    downTube.castShadow = true;
    frameGroup.add(downTube);

    // 上水平管 (Top Tube)
    const topTube = new THREE.Mesh(boxGeo, frameMat);
    topTube.scale.set(0.1, 0.08, 0.72);
    topTube.position.set(0, 0.72, 0.06);
    topTube.castShadow = true;
    frameGroup.add(topTube);

    // 座管 (Seat Tube)
    const seatTube = new THREE.Mesh(boxGeo, frameMat);
    seatTube.scale.set(0.1, 0.55, 0.1);
    seatTube.position.set(0, 0.58, -0.22);
    seatTube.rotation.x = -0.15;
    frameGroup.add(seatTube);

    // 后平叉 (Rear Chainstay)
    const chainStay = new THREE.Mesh(boxGeo, frameAccent);
    chainStay.scale.set(0.16, 0.08, 0.55);
    chainStay.position.set(0, 0.36, -0.48);
    frameGroup.add(chainStay);

    // 前叉 (Front Fork)
    const frontFork = new THREE.Mesh(boxGeo, frameAccent);
    frontFork.scale.set(0.16, 0.56, 0.1);
    frontFork.position.set(0, 0.56, 0.52);
    frontFork.rotation.x = -0.25;
    frameGroup.add(frontFork);

    // 2. 车座 (Leather Saddle)
    const saddle = new THREE.Mesh(boxGeo, seatMat);
    saddle.scale.set(0.24, 0.08, 0.34);
    saddle.position.set(0, 0.84, -0.25);
    saddle.castShadow = true;
    frameGroup.add(saddle);

    // 3. 车把与车头操控区 (Handlebar, Grips, Bell, Basket)
    const stem = new THREE.Mesh(boxGeo, metalMat);
    stem.scale.set(0.08, 0.28, 0.08);
    stem.position.set(0, 0.88, 0.44);
    frameGroup.add(stem);

    const handlebar = new THREE.Mesh(boxGeo, metalMat);
    handlebar.scale.set(0.72, 0.08, 0.08);
    handlebar.position.set(0, 1.0, 0.42);
    frameGroup.add(handlebar);

    // 左右防滑握把
    [-0.34, 0.34].forEach(gx => {
      const grip = new THREE.Mesh(boxGeo, gripMat);
      grip.scale.set(0.1, 0.1, 0.14);
      grip.position.set(gx, 1.0, 0.43);
      frameGroup.add(grip);
    });

    // 金色小铜铃 (Golden Bell)
    const bell = new THREE.Mesh(boxGeo, bellMat);
    bell.scale.set(0.09, 0.09, 0.09);
    bell.position.set(0.24, 1.06, 0.42);
    frameGroup.add(bell);

    // 前车篮与装饰小花
    const basket = new THREE.Mesh(boxGeo, basketMat);
    basket.scale.set(0.38, 0.22, 0.24);
    basket.position.set(0, 0.86, 0.6);
    const flower = new THREE.Mesh(boxGeo, flowerMat);
    flower.scale.set(0.18, 0.12, 0.18);
    flower.position.set(0, 0.98, 0.6);
    frameGroup.add(basket, flower);

    // 4. 前后车轮制作 (Articulated Wheels)
    const makeWheel = (pz) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(0, 0.35, pz);

      // 外层橡胶轮胎
      const tire = new THREE.Mesh(boxGeo, tireMat);
      tire.scale.set(0.12, 0.7, 0.7);
      tire.castShadow = true;
      wheelGroup.add(tire);

      // 银色轮毂中心
      const hub = new THREE.Mesh(boxGeo, metalMat);
      hub.scale.set(0.16, 0.28, 0.28);
      wheelGroup.add(hub);

      // 十字车辐
      const spoke1 = new THREE.Mesh(boxGeo, metalMat);
      spoke1.scale.set(0.13, 0.58, 0.05);
      const spoke2 = new THREE.Mesh(boxGeo, metalMat);
      spoke2.scale.set(0.13, 0.05, 0.58);
      wheelGroup.add(spoke1, spoke2);

      return wheelGroup;
    };

    this.wheelF = makeWheel(0.68);
    this.wheelR = makeWheel(-0.68);
    frameGroup.add(this.wheelF, this.wheelR);

    // 5. 中轴曲柄与脚踏板 (Crankset & Pedals)
    this.crank = new THREE.Group();
    this.crank.position.set(0, 0.35, -0.15);

    const crankAxis = new THREE.Mesh(boxGeo, metalMat);
    crankAxis.scale.set(0.38, 0.06, 0.06);
    this.crank.add(crankAxis);

    const pedalL = new THREE.Mesh(boxGeo, gripMat);
    pedalL.scale.set(0.12, 0.05, 0.12);
    pedalL.position.set(-0.22, -0.12, 0);
    const pedalR = new THREE.Mesh(boxGeo, gripMat);
    pedalR.scale.set(0.12, 0.05, 0.12);
    pedalR.position.set(0.22, 0.12, 0);
    this.crank.add(pedalL, pedalR);
    frameGroup.add(this.crank);

    // 6. 停车脚撑 (Kickstand)
    this.kickstand = new THREE.Mesh(boxGeo, metalMat);
    this.kickstand.scale.set(0.06, 0.35, 0.06);
    this.kickstand.position.set(-0.16, 0.2, -0.2);
    this.kickstand.rotation.z = 0.5; // 停车时撑地
    frameGroup.add(this.kickstand);

    this.group.add(frameGroup);

    // 交互点击绑定
    const uData = {
      targetKey: 'bicycle',
      tooltipText: '🚲 运动山地单车 (点击或按 E 骑上单车 · 飞速穿行)'
    };
    this.group.userData = uData;
    this.group.traverse(child => {
      if (child.isMesh) child.userData = uData;
    });
  }

  // 停放单车到指定地面
  park(x, z, rotY = 0) {
    this.isRidden = false;
    this.rider = null;
    this.group.position.set(x, 0, z);
    this.group.rotation.set(0, rotY, -0.09); // 停靠时稍微倾斜靠在脚撑上
    if (this.kickstand) this.kickstand.rotation.z = 0.55;
    this.updateInteractableText();
  }

  // 骑上单车 (Mount)
  mount(character) {
    this.isRidden = true;
    this.rider = character;
    this.group.rotation.set(0, character.group.rotation.y, 0); // 立正车身
    if (this.kickstand) this.kickstand.rotation.z = 0.0; // 收起脚撑

    if (window.MCAudio && window.MCAudio.playBikeBell) {
      window.MCAudio.playBikeBell();
    }

    bus.emit('toast:show', {
      kicker: '🚲 骑上单车！',
      title: '【踩上脚踏板】按 WASD 飞速骑行，按空格吹响清脆车铃，再次点击或按 E 键可停下单车！'
    });
    bus.emit('banner:show', {
      title: '🚲 飞速单车骑行模式',
      sub: '按 WASD 疾驰 · 空格叮铃铃 · 按 E 键随时下车'
    });
    bus.emit('fx:hearts', character.group.position);

    this.updateInteractableText();
  }

  // 停靠下车 (Dismount)
  dismount() {
    if (!this.isRidden || !this.rider) return;
    const rider = this.rider;
    const charPos = rider.group.position.clone();
    const rotY = rider.group.rotation.y;

    // 角色下车退到单车身侧 0.55 格处
    const sideX = Math.cos(rotY + Math.PI / 2) * 0.55;
    const sideZ = Math.sin(rotY + Math.PI / 2) * 0.55;
    rider.group.position.x += sideX;
    rider.group.position.z += sideZ;
    rider.isRidingBike = false;

    // 单车平稳停放在角色脚边并展开脚撑
    this.park(charPos.x, charPos.z, rotY);

    if (window.MCAudio && window.MCAudio.playClick) {
      window.MCAudio.playClick();
    }

    bus.emit('toast:show', {
      kicker: '🚲 停好单车',
      title: '已放下脚撑停好单车！恢复正常漫步速度。'
    });
  }

  updateInteractableText() {
    const text = this.isRidden
      ? '🚲 正在骑行中 (点击或按 E 键停好单车)'
      : '🚲 运动山地单车 (点击或按 E 骑上单车 · 飞速穿行)';
    this.group.userData.tooltipText = text;
    this.group.traverse(child => {
      if (child.isMesh) child.userData.tooltipText = text;
    });
  }

  getInteractables() {
    const list = [];
    this.group.traverse(child => {
      if (child.isMesh) list.push(child);
    });
    return list;
  }

  // 每一帧同步驱动车身位移、轮胎转动与曲柄踩踏
  update(delta, activeChar, isWalking, moveDist) {
    if (this.isRidden && this.rider) {
      // 1. 同步贴合角色当前位置与朝向
      this.group.position.copy(this.rider.group.position);
      this.group.rotation.y = this.rider.group.rotation.y;

      // 转弯时自然微倾斜车身
      this.group.rotation.z = 0;

      // 2. 运动时滚轮与脚踏板极速旋转
      if (isWalking) {
        const rotSpeed = moveDist * 3.8;
        if (this.wheelF) this.wheelF.rotation.x += rotSpeed;
        if (this.wheelR) this.wheelR.rotation.x += rotSpeed;
        if (this.crank) this.crank.rotation.x += rotSpeed;
      }
    }
  }
}
