/**
 * ==============================================================================
 * FamilyManager - Smooth Camera-Relative Continuous Movement & Controller
 * ==============================================================================
 */

import * as THREE from 'three';
import { VoxelCharacter } from './VoxelModel.js';
import { BicycleModel } from './BicycleModel.js';
import { bus } from '../core/EventBus.js';
import { state } from '../core/State.js';

// ==========================================
// 房子墙体几何碰撞体集合 (阻止人物穿墙，保留门洞顺畅通行)
// ==========================================
const DOORS = new Set([
  '-13,-4', '-12,-4', // 南面主正门 (通向客厅)
  '1,-4', '2,-4',     // 南面侧门 (通向餐厅/露台)
  '-13,-13', '-12,-13', // 客厅通往研发室
  '1,-13', '2,-13',   // 餐厅通往游乐角
  '-6,-9', '-6,-8',   // 客厅通往餐厅
  '-6,-18', '-6,-17'  // 研发室通往游乐角
]);

const HX0 = -20, HX1 = 8;
const HZ0 = -22, HZ1 = -4;
const IWX = -6, IWZ = -13;

const HOUSE_WALL_BLOCKS = new Set();
for (let x = HX0; x <= HX1; x++) {
  for (let z = HZ0; z <= HZ1; z++) {
    const onX = (x === HX0 || x === HX1 || x === IWX);
    const onZ = (z === HZ0 || z === HZ1 || z === IWZ);
    if (!onX && !onZ) continue;
    const k = `${x},${z}`;
    if (DOORS.has(k)) continue; // 门洞保留通行，不设碰撞
    HOUSE_WALL_BLOCKS.add(k);
  }
}

export class FamilyManager {
  constructor(scene) {
    this.scene = scene;
    this.characters = new Map();
    this.activeId = state.activeMemberId;
    this.stepTimer = 0;
    this.moveSpeed = 6.4; // 移动速度 (方块/秒)
    this.bellCooldown = 0;

    // 🚲 高精度 Minecraft 风格运动单车
    this.bicycle = new BicycleModel(this.scene);

    this.init();
  }

  init() {
    const familyData = state.config.family;
    Object.keys(familyData).forEach(id => {
      const char = new VoxelCharacter(familyData[id]);
      this.characters.set(id, char);
      this.scene.add(char.group);
    });

    bus.on('family:switch', (member) => {
      if (this.bicycle && this.bicycle.isRidden) {
        this.dismountBicycle();
      }
      this.activeId = member.id;
      const targetChar = this.characters.get(member.id);
      if (targetChar) {
        bus.emit('camera:focus', targetChar.group.position);
      }
    });

    bus.on('player:dive', () => {
      if (this.bicycle && this.bicycle.isRidden) {
        this.dismountBicycle();
      }
      const active = this.getActiveCharacter();
      if (active) {
        active.startDive();
      }
    });

    // 🚲 单车上下车切换事件
    bus.on('player:bicycle:toggle', () => {
      this.toggleBicycle();
    });

    bus.on('player:speedboost', ({ speed, duration }) => {
      this.moveSpeed = speed || 11.5;
      clearTimeout(this.speedTimer);
      this.speedTimer = setTimeout(() => {
        this.moveSpeed = 6.4;
        bus.emit('toast:show', { kicker: '🚲 骑行完毕', title: '单车加速效果已结束，恢复正常漫步速度' });
      }, duration || 14000);
    });
  }

  // 切换单车骑行状态 (上车 / 下车)
  toggleBicycle() {
    const active = this.getActiveCharacter();
    if (!active || !this.bicycle) return;

    if (this.bicycle.isRidden) {
      this.dismountBicycle();
    } else {
      const charPos = active.group.position;
      const bikePos = this.bicycle.group.position;
      const d = Math.hypot(charPos.x - bikePos.x, charPos.z - bikePos.z);
      if (d > 4.5) {
        bus.emit('toast:show', {
          kicker: '🚲 单车太远啦',
          title: '请靠近前院路旁的单车后，按 E 键或点击上车！'
        });
        return;
      }
      this.mountBicycle(active);
    }
  }

  // 骑上单车
  mountBicycle(active) {
    if (active.inWater) {
      bus.emit('toast:show', {
        kicker: '🌊 无法在水中骑车',
        title: '请先上岸后再骑单车哦！'
      });
      return;
    }
    active.isRidingBike = true;
    this.moveSpeed = 12.0; // 极速飞驰 (近两倍漫步移速)
    this.bicycle.mount(active);
  }

  // 停靠下车
  dismountBicycle() {
    const active = this.getActiveCharacter();
    if (active) {
      active.isRidingBike = false;
    }
    this.moveSpeed = 6.4; // 恢复正常速度
    if (this.bicycle) {
      this.bicycle.dismount();
    }
  }

  getInteractables() {
    const list = [];
    this.characters.forEach((char) => {
      char.group.traverse(child => {
        if (child.isMesh) {
          list.push(child);
        }
      });
    });
    if (this.bicycle) {
      list.push(...this.bicycle.getInteractables());
    }
    return list;
  }

  getActiveCharacter() {
    return this.characters.get(this.activeId) || this.characters.get('dad');
  }

  // 房子墙体 AABB 碰撞盒检测 (阻止穿越房子墙体，radius 为角色碰撞半径)
  checkWallCollision(px, pz, radius = 0.26) {
    const minBX = Math.floor(px - radius + 0.5);
    const maxBX = Math.floor(px + radius + 0.5);
    const minBZ = Math.floor(pz - radius + 0.5);
    const maxBZ = Math.floor(pz + radius + 0.5);

    for (let bx = minBX; bx <= maxBX; bx++) {
      for (let bz = minBZ; bz <= maxBZ; bz++) {
        if (HOUSE_WALL_BLOCKS.has(`${bx},${bz}`)) {
          const bMinX = bx - 0.5;
          const bMaxX = bx + 0.5;
          const bMinZ = bz - 0.5;
          const bMaxZ = bz + 0.5;

          if (px + radius > bMinX && px - radius < bMaxX &&
              pz + radius > bMinZ && pz - radius < bMaxZ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // 每一帧连续平滑移动计算：严格基于当前相机视角水平投影，所见即所得！
  updateMovement(keys, delta, camera) {
    const active = this.getActiveCharacter();
    if (!active) return;

    // 跳水动作进行中时锁定手控移动
    if (active.mode === 'dive') return;

    // 泳池水域判定 (x: 10..20, z: 4..14)
    const pos = active.group.position;
    const inPool = (pos.x >= 10 && pos.x <= 20 && pos.z >= 4 && pos.z <= 14);

    if (inPool && active.isRidingBike) {
      this.dismountBicycle();
      bus.emit('toast:show', {
        kicker: '🚲 单车遇水停靠',
        title: '前方进入泳池深水区，已自动在岸边停好单车！'
      });
    }

    if (inPool && !active.inWater) {
      active.inWater = true;
      if (window.MCAudio) window.MCAudio.playSplash();
      bus.emit('fx:splash', pos.clone());
      bus.emit('toast:show', { kicker: '🏊 扑通入水', title: '【清凉畅游】跳入清凉泳池！舒展双臂欢快游泳中~' });
      bus.emit('fx:hearts');
    } else if (!inPool && active.inWater) {
      active.inWater = false;
      pos.y = 0.5;
      bus.emit('toast:show', { kicker: '🏊 离开泳池', title: '【爬上甲板】水珠晶莹透亮，精力充沛！' });
    }

    // 🚲 骑行状态下按空格键可按响清脆车铃！
    if (active.isRidingBike && keys['Space']) {
      const now = performance.now();
      if (!this.bellCooldown || now - this.bellCooldown > 800) {
        this.bellCooldown = now;
        if (window.MCAudio && window.MCAudio.playBikeBell) {
          window.MCAudio.playBikeBell();
        }
        bus.emit('toast:show', {
          kicker: '🔔 叮铃铃！叮铃铃！',
          title: '【清脆车铃】清风拂面，单车飞驰！前方请注意避让哦~'
        });
        bus.emit('fx:notes', active.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
      }
    }

    let inputForward = 0; // W / S (前后)
    let inputRight = 0;   // D / A (左右)

    if (keys['KeyW'] || keys['ArrowUp']) inputForward += 1;
    if (keys['KeyS'] || keys['ArrowDown']) inputForward -= 1;
    if (keys['KeyA'] || keys['ArrowLeft']) inputRight -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) inputRight += 1;

    if (inputForward !== 0 || inputRight !== 0) {
      // 1. 获取相机在水平 XZ 平面上的前向朝向 (忽略俯仰角)
      const forward = new THREE.Vector3();
      if (camera) {
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
      } else {
        forward.set(0, 0, -1);
      }

      // 2. 获取相机的水平右向 (Forward x World_Up)
      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      // 3. 将输入合成为相对相机的移动方向向量
      const moveDir = new THREE.Vector3();
      moveDir.addScaledVector(forward, inputForward);
      moveDir.addScaledVector(right, inputRight);
      moveDir.normalize();

      const speed = active.inWater ? this.moveSpeed * 0.72 : this.moveSpeed;
      const dist = speed * delta;
      const dx = moveDir.x * dist;
      const dz = moveDir.z * dist;

      const radius = 0.26;
      const oldX = active.group.position.x;
      const oldZ = active.group.position.z;
      const wasColliding = this.checkWallCollision(oldX, oldZ, radius);

      // 1. 尝试沿 X 轴位移 (若撞墙则自动触发沿墙滑动，禁止穿墙)
      if (dx !== 0) {
        const tryX = oldX + dx;
        if (!this.checkWallCollision(tryX, oldZ, radius) || wasColliding) {
          active.group.position.x = tryX;
        }
      }

      // 2. 尝试沿 Z 轴位移 (若撞墙则自动触发沿墙滑动，禁止穿墙)
      if (dz !== 0) {
        const currentX = active.group.position.x;
        const tryZ = oldZ + dz;
        if (!this.checkWallCollision(currentX, tryZ, radius) || wasColliding) {
          active.group.position.z = tryZ;
        }
      }

      // 广阔平原探索边界 (自由漫步大庭院，或走出大门在草原上奔跑、骑车)
      active.group.position.x = Math.max(-75, Math.min(75, active.group.position.x));
      active.group.position.z = Math.max(-75, Math.min(75, active.group.position.z));

      // 4. 自然转向插值 (角色平滑转向面朝移动方向)
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      const currentAngle = active.group.rotation.y;
      let diff = (targetAngle - currentAngle) % (Math.PI * 2);
      if (diff < -Math.PI) diff += Math.PI * 2;
      if (diff > Math.PI) diff -= Math.PI * 2;
      active.group.rotation.y += diff * Math.min(1, delta * 14);

      active.setWalking(true);
      if (this.bicycle) {
        this.bicycle.update(delta, active, true, dist);
      }

      // 脚步声 / 水花划水节拍 (骑车时静音脚步)
      this.stepTimer += delta;
      if (this.stepTimer > (active.inWater ? 0.42 : (active.isRidingBike ? 0.22 : 0.32))) {
        this.stepTimer = 0;
        if (!active.inWater && !active.isRidingBike) {
          if (window.MCAudio) window.MCAudio.playStep();
        } else if (active.inWater) {
          bus.emit('fx:splash', active.group.position.clone());
        }
      }

      bus.emit('camera:follow', active.group.position);
    } else {
      active.setWalking(false);
      this.stepTimer = 0.28;
      if (this.bicycle) {
        this.bicycle.update(delta, active, false, 0);
      }
    }
  }

  update(delta, time, keys, camera) {
    this.updateMovement(keys, delta, camera);
    this.characters.forEach((char, id) => {
      char.update(delta, time, id === this.activeId);
    });
  }
}
