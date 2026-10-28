/**
 * ==============================================================================
 * WorldScene - Crystal-Clear Minecraft Aesthetics & Lighting (No Milky Fog!)
 * ==============================================================================
 */

import * as THREE from 'three';
import { OrbitControls } from '../../lib/OrbitControls.js';
import { createProceduralTextures } from './Textures.js';
import { WorldBuilder } from './Builder.js';
import { FamilyManager } from '../entities/FamilyManager.js';
import { PetManager } from '../entities/PetManager.js';
import { bus } from '../core/EventBus.js';
import { state } from '../core/State.js';

export class WorldScene {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    this.familyManager = null;
    this.petManager = null;
    this.builderData = null;
    this.clock = new THREE.Clock();
    this.keys = {};
    this.roofOpacity = 1.0;
    this.wasInside = false;
    this.currentNearbyTarget = null;
    this.moveMarker = null;
    this.moveMarkerT = 0;

    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupScene();
    this.setupLights();

    const textures = createProceduralTextures();
    const builder = new WorldBuilder(this.scene, textures);
    this.builderData = builder.build();

    this.familyManager = new FamilyManager(this.scene);
    const familyMeshes = this.familyManager.getInteractables();
    this.builderData.interactables.push(...familyMeshes);
    this.petManager = new PetManager(this.scene, this.builderData);

    this.bindEvents();
    this.animate();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Neutral 色调映射：中间调不压暗，明亮通透不发闷 (ACES 会整体压灰压暗)
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.container.appendChild(this.renderer.domElement);

    // 增大缩放范围，支持更开阔的全景远眺 (min: 3.5, max: 75.0)
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-10.5, 18, 28);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 0.8;
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 75.0; // 显著增大缩放上限，支持全景大视野远眺
    this.controls.maxPolarAngle = 1.32; // 原版极角限制，防止地底或过平切角
    this.controls.minPolarAngle = 0.25; // 防止正垂直俯视
    this.controls.target.set(-10.5, 1.7, 4.0);
  }

  setupScene() {
    this.scene = new THREE.Scene();
    // 明亮清爽的天蓝与开阔地平线雾气 (#a9dcff, 110 到 340，大幅拉远雾气边缘，远眺不泛白)
    this.daySky = new THREE.Color('#a9dcff');
    this.nightSky = new THREE.Color('#0a0d1a');
    this.scene.background = this.daySky.clone();

    this.dayFog = new THREE.Fog('#a9dcff', 110, 340);
    this.nightFog = new THREE.Fog('#0a0d1a', 70, 220);
    this.scene.fog = this.dayFog;
  }

  setupLights() {
    // 1. 半球环境光：天空明蓝 + 鲜亮草绿反光，大幅提升树木和阴影处的鲜艳度
    this.hemiLight = new THREE.HemisphereLight('#dbeeff', '#6fae3f', 0.85);
    this.scene.add(this.hemiLight);

    // 2. 温暖明媚的阳光：保证像素方块与草坪质感立体生动
    this.sunLight = new THREE.DirectionalLight('#fffdf5', 1.5);
    this.sunLight.position.set(24, 46, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.bias = -0.0003;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 150;
    const d = 42;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    // 3. 室内壁炉与暖光灯
    this.indoorLight = new THREE.PointLight('#ffd6a0', 1.6, 22, 1.2);
    this.indoorLight.position.set(-10, 3.8, -11);
    this.scene.add(this.indoorLight);

    // 4. 庭院露台与花园暖光灯
    this.patioLight = new THREE.PointLight('#ffcc77', 1.5, 20, 1.2);
    this.patioLight.position.set(14, 3.5, -7);
    this.scene.add(this.patioLight);
  }

  bindEvents() {
    bus.on('world:daynight', (isNight) => {
      const targetSky = isNight ? this.nightSky : this.daySky;
      this.scene.background = targetSky;
      this.scene.fog = isNight ? this.nightFog : this.dayFog;
      this.sunLight.intensity = isNight ? 0.15 : 1.5;
      this.hemiLight.intensity = isNight ? 0.2 : 0.85;
      this.indoorLight.intensity = isNight ? 2.5 : 1.4;
      this.patioLight.intensity = isNight ? 2.3 : 1.3;
    });

    bus.on('fx:musicnote', (pos3d) => {
      this.spawnMusicNote(pos3d || new THREE.Vector3(-7, 1.2, -5));
    });

    bus.on('fx:hearts', (pos3d) => {
      this.spawnHearts(pos3d || this.controls.target);
    });

    bus.on('fx:splash', (pos3d) => {
      this.spawnSplash(pos3d || this.controls.target);
    });

    bus.on('world:roof', (showRoof) => {
      if (this.builderData && this.builderData.roofGroup) {
        this.builderData.roofGroup.visible = showRoof;
      }
    });

    bus.on('camera:focus', (pos) => {
      const offset = new THREE.Vector3(0, 9.5, 13.5);
      const targetCam = pos.clone().add(offset);
      this.camera.position.lerp(targetCam, 0.65);
      this.controls.target.copy(pos).add(new THREE.Vector3(0, 1.7, 0));
    });

    bus.on('camera:follow', (pos) => {
      // 每一帧在 animate() 中平滑跟踪
    });

    // 连续按键状态追踪
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // 射线检测交互方块
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.builderData.interactables, true);
      const tooltip = document.getElementById('tooltip');
      if (tooltip) {
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const rootData = hit.userData.tooltipText ? hit.userData : (hit.parent && hit.parent.userData);
          if (rootData && rootData.tooltipText) {
            tooltip.textContent = rootData.tooltipText;
            tooltip.style.display = 'block';
            tooltip.style.left = (e.clientX + 16) + 'px';
            tooltip.style.top = (e.clientY + 16) + 'px';
            return;
          }
        }
        tooltip.style.display = 'none';
      }
    });

    // 区分「点击」与「拖拽旋转视角」，并定义地面拾取平面 (y = 0.5 与草地顶面平齐)
    let pointerDownX = 0;
    let pointerDownY = 0;
    let pointerDownAt = 0;
    window.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      pointerDownAt = performance.now();
    });
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5);

    window.addEventListener('click', (e) => {
      if (e.target.closest('#hud') || e.target.closest('#panelOverlay') || e.target.closest('#loading') || e.target.closest('#familyDock')) return;

      // 拖拽旋转视角时不触发点击交互/移动
      if (Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY) > 6) return;
      if (performance.now() - pointerDownAt > 700) return;

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);

      // 1. 优先响应可交互物体的点击
      const intersects = raycaster.intersectObjects(this.builderData.interactables, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const rootData = hit.userData.targetKey ? hit.userData : (hit.parent && hit.parent.userData);
        if (rootData && rootData.targetKey) {
          if (window.MCAudio) window.MCAudio.playClick();
          bus.emit('interact:trigger', rootData.targetKey);
          return;
        }
      }

      // 2. 点击空地：角色自动走向该位置
      const point = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(groundPlane, point)) return;
      point.x = THREE.MathUtils.clamp(point.x, -75, 75);
      point.z = THREE.MathUtils.clamp(point.z, -75, 75);
      point.y = 0.5;
      this.familyManager.setMoveTarget(point);
      this.showMoveMarker(point);
    });

    // 经典 Minecraft 按 E 键快速触发当前靠近物体的交互
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (this.currentNearbyTarget) {
          if (window.MCAudio) window.MCAudio.playClick();
          bus.emit('interact:trigger', this.currentNearbyTarget);
        }
      }
    });

    // 点击底部靠近交互气泡也可立即触发
    const promptEl = document.getElementById('interactPrompt');
    if (promptEl) {
      promptEl.onclick = () => {
        if (this.currentNearbyTarget) {
          if (window.MCAudio) window.MCAudio.playClick();
          bus.emit('interact:trigger', this.currentNearbyTarget);
        }
      };
    }

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  updateProximityPrompt(activeChar) {
    const charPos = activeChar.group.position;
    let nearestObj = null;
    let minDist = 3.2; // 3.2 格范围内触发交互提示

    if (this.builderData && this.builderData.interactables) {
      for (const obj of this.builderData.interactables) {
        const targetKey = obj.userData ? obj.userData.targetKey : null;
        if (!targetKey) continue;
        if (targetKey === 'family_' + state.activeMemberId) continue; // 排除当前操控的自身角色

        const worldPos = new THREE.Vector3();
        obj.getWorldPosition(worldPos);

        const d = Math.hypot(charPos.x - worldPos.x, charPos.z - worldPos.z);
        if (d < minDist) {
          minDist = d;
          nearestObj = obj;
        }
      }
    }

    const promptEl = document.getElementById('interactPrompt');
    const labelEl = document.getElementById('promptLabel');

    if (nearestObj && nearestObj.userData && nearestObj.userData.tooltipText) {
      this.currentNearbyTarget = nearestObj.userData.targetKey;
      if (promptEl && labelEl) {
        labelEl.textContent = nearestObj.userData.tooltipText;
        promptEl.classList.add('show');
      }
    } else {
      this.currentNearbyTarget = null;
      if (promptEl) promptEl.classList.remove('show');
    }
  }

  spawnMusicNote(pos3d) {
    const note = document.createElement('div');
    note.className = 'music-note-fx';
    const symbols = ['♪', '♫', '♩', '♬'];
    note.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const v = pos3d.clone().project(this.camera);
    const x = (v.x * 0.5 + 0.5) * window.innerWidth + (Math.random() * 40 - 20);
    const y = (-(v.y * 0.5) + 0.5) * window.innerHeight + (Math.random() * 20 - 10);
    note.style.left = `${x}px`;
    note.style.top = `${y}px`;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 1800);
  }

  spawnHearts(pos3d) {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.className = 'music-note-fx';
        heart.style.color = '#ff4757';
        heart.style.textShadow = '0 0 8px rgba(255, 71, 87, 0.8), 2px 2px 0 #000';
        heart.textContent = '💖';
        const v = (pos3d || this.controls.target).clone().project(this.camera);
        const x = (v.x * 0.5 + 0.5) * window.innerWidth + (Math.random() * 60 - 30);
        const y = (-(v.y * 0.5) + 0.5) * window.innerHeight + (Math.random() * 40 - 20);
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1800);
      }, i * 140);
    }
  }

  // 泳池水花飞溅与动态水波涟漪特效
  spawnSplash(pos3d) {
    // 1. 水面 3D 动态扩散同心水波 (Expanding Water Ripple)
    const ringGeo = new THREE.RingGeometry(0.35, 0.55, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const ripple = new THREE.Mesh(ringGeo, ringMat);
    ripple.position.set(pos3d.x, 0.38, pos3d.z);
    this.scene.add(ripple);

    const startTime = performance.now();
    const animRipple = () => {
      const elapsed = (performance.now() - startTime) / 650;
      if (elapsed < 1) {
        const s = 1 + elapsed * 5.5;
        ripple.scale.set(s, 1, s);
        ringMat.opacity = (1 - elapsed) * 0.9;
        requestAnimationFrame(animRipple);
      } else {
        this.scene.remove(ripple);
        ringGeo.dispose();
        ringMat.dispose();
      }
    };
    animRipple();

    // 2. 晶莹水珠与气泡粒子喷射
    const symbols = ['💦', '💧', '🫧', '✨'];
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const drop = document.createElement('div');
        drop.className = 'music-note-fx';
        drop.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        drop.style.fontSize = (18 + Math.random() * 12) + 'px';
        const v = pos3d.clone().project(this.camera);
        const x = (v.x * 0.5 + 0.5) * window.innerWidth + (Math.random() * 80 - 40);
        const y = (-(v.y * 0.5) + 0.5) * window.innerHeight + (Math.random() * 60 - 45);
        drop.style.left = `${x}px`;
        drop.style.top = `${y}px`;
        document.body.appendChild(drop);
        setTimeout(() => drop.remove(), 1200);
      }, i * 35);
    }
  }

  // 鼠标点击移动的目的地光圈标记
  showMoveMarker(pos3d) {
    if (!this.moveMarker) {
      const geo = new THREE.RingGeometry(0.36, 0.5, 32);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({
        color: '#7fe9ff',
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      this.moveMarker = new THREE.Mesh(geo, mat);
      this.moveMarker.renderOrder = 2;
      this.scene.add(this.moveMarker);
    }
    this.moveMarker.position.set(pos3d.x, 0.56, pos3d.z);
    this.moveMarker.visible = true;
    this.moveMarkerT = 0;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. 核心平滑位移计算 (传入相机视口)
    this.familyManager.update(delta, time, this.keys, this.camera);

    // 2. 相机平滑跟随当前操控角色 (保持用户调整的最佳视角不变)
    const activeChar = this.familyManager.getActiveCharacter();
    if (activeChar) {
      const tgt = activeChar.group.position.clone().add(new THREE.Vector3(0, 1.7, 0));
      const d = tgt.sub(this.controls.target).multiplyScalar(Math.min(1, delta * 5));
      this.controls.target.add(d);
      this.camera.position.add(d);

      // 3. 角色进入室内自动透明化屋顶 (扩建大别墅 HX0: -20, HX1: 8, HZ0: -22, HZ1: -4)
      const pos = activeChar.group.position;
      const isInside = (pos.x >= -20.5 && pos.x <= 8.5 && pos.z >= -22.5 && pos.z <= -3.5);

      if (this.wasInside !== isInside) {
        this.wasInside = isInside;
        if (isInside) {
          bus.emit('toast:show', {
            kicker: '🏡 踏入方块小屋',
            title: '屋顶已自动透明！靠近家具按 E 键或点击即可交互！'
          });
        }
      }

      // 室内自动透视；室外遵循 state.showRoof 开关
      const targetOpacity = isInside ? 0.0 : (state.showRoof ? 1.0 : 0.0);
      this.roofOpacity = THREE.MathUtils.lerp(this.roofOpacity, targetOpacity, 0.14);

      if (this.builderData.roofMat) {
        this.builderData.roofMat.opacity = this.roofOpacity;
      }
      if (this.builderData.roofGroup) {
        this.builderData.roofGroup.visible = (this.roofOpacity > 0.02);
      }

      // 4. 靠近物品即时交互提示条 (按 E 或点击)
      this.updateProximityPrompt(activeChar);
    }

    if (this.builderData.animatedObjects) {
      this.builderData.animatedObjects.forEach(obj => obj.update(delta, time));
    }

    if (this.builderData.towerSegments && this.builderData.towerSegments.length > 0) {
      this.builderData.towerSegments.forEach((seg, i) => {
        const hue = (time * 0.12 + i * 0.04) % 1;
        seg.material.color.setHSL(hue, 0.9, state.isNight ? 0.6 : 0.4);
      });
    }

    // 5. 驱动小狗小猫全自主行走、巡视、玩耍与跟随系统
    if (this.petManager) {
      this.petManager.update(delta, time, activeChar);
    }

    // 6. 点击移动目的地光圈：脉动呼吸，到达或取消后自动隐藏
    if (this.moveMarker && this.moveMarker.visible) {
      if (this.familyManager.moveTarget) {
        this.moveMarkerT += delta;
        const pulse = Math.sin(this.moveMarkerT * 9);
        const s = 1 + pulse * 0.14;
        this.moveMarker.scale.set(s, 1, s);
        this.moveMarker.material.opacity = 0.65 + pulse * 0.25;
      } else {
        this.moveMarker.visible = false;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
