/**
 * ==============================================================================
 * Builder - Voxel House & Expanded Yard Builder (Grand Villa Edition)
 * ==============================================================================
 * Expanded house footprint: HX0 = -20, HX1 = 8 (28 blocks wide), HZ0 = -22, HZ1 = -4 (18 blocks deep).
 * Expanded yard bounds: [-30, 28] x [-28, 28] with front gate at x: -13..-12, z = 28.
 * Vibrant, bright emerald green foliage and warm golden oak logs.
 * Surrounding infinite grasslands, Pearl River, and Canton Tower.
 */

import * as THREE from 'three';
import { mergeGeometries } from '../../lib/BufferGeometryUtils.js';

export class WorldBuilder {
  constructor(scene, T) {
    this.scene = scene;
    this.T = T;
    this.interactables = [];
    this.animatedObjects = [];
    this.roofGroup = new THREE.Group();
    this.roofMesh = null;
    this.roofMat = null;
    this.towerSegments = [];

    // 扩建后的宏伟大别墅空间常量 (28格宽 x 18格深)
    this.HX0 = -20;
    this.HX1 = 8;
    this.HZ0 = -22;
    this.HZ1 = -4;
    this.IWX = -6;
    this.IWZ = -13;

    this.initMaterials();
  }

  initMaterials() {
    this.M = {
      grass: new THREE.MeshLambertMaterial({ map: this.T.grassTop }),
      dirt: new THREE.MeshLambertMaterial({ map: this.T.dirt }),
      cobble: new THREE.MeshLambertMaterial({ map: this.T.cobble }),
      path: new THREE.MeshLambertMaterial({ map: this.T.path || this.T.cobble }),
      planks: new THREE.MeshLambertMaterial({ map: this.T.planks }),
      darkPlanks: new THREE.MeshLambertMaterial({ map: this.T.darkPlanks }),
      birch: new THREE.MeshLambertMaterial({ map: this.T.birch }),
      log: new THREE.MeshLambertMaterial({ map: this.T.logSide }),
      roof: new THREE.MeshLambertMaterial({ map: this.T.roof }),
      leaves: new THREE.MeshLambertMaterial({ map: this.T.leaves }),
      hedge: new THREE.MeshLambertMaterial({ map: this.T.hedge || this.T.leaves }),
      bookshelf: new THREE.MeshLambertMaterial({ map: this.T.bookshelf }),
      toyBox: new THREE.MeshLambertMaterial({ map: this.T.toyBox }),
      quartz: new THREE.MeshLambertMaterial({ map: this.T.quartz }),
      poolTile: new THREE.MeshLambertMaterial({ map: this.T.poolTile }),
      farmland: new THREE.MeshLambertMaterial({ map: this.T.farmland || this.T.dirt }),
      glass: new THREE.MeshLambertMaterial({ color: '#c2e7ff', transparent: true, opacity: 0.45 }),
      water: new THREE.MeshLambertMaterial({ map: this.T.water, color: '#bfe3ff', transparent: true, opacity: 0.75 }),
      fence: new THREE.MeshLambertMaterial({ map: this.T.darkPlanks }),
      redWool: new THREE.MeshLambertMaterial({ color: '#e84118' }),
      whiteWool: new THREE.MeshLambertMaterial({ color: '#f5f6fa' }),
      flowerRed: new THREE.MeshLambertMaterial({ color: '#ff4757' }),
      flowerYellow: new THREE.MeshLambertMaterial({ color: '#ffa502' }),
      flowerBlue: new THREE.MeshLambertMaterial({ color: '#4b6fe0' }),
      flowerPink: new THREE.MeshLambertMaterial({ color: '#ff7eb3' }),
      iron: new THREE.MeshLambertMaterial({ color: '#dcdde1' }),
      gold: new THREE.MeshLambertMaterial({ color: '#f1c40f' })
    };
  }

  build() {
    this.geoBuckets = {};
    Object.keys(this.M).forEach(key => {
      this.geoBuckets[key] = [];
    });

    this.buildTerrainAndYard();
    this.buildCottage();
    this.buildYardFeatures();
    this.buildInteractiveObjects();
    this.buildDistantLandmark();

    // 合并几何体，60 FPS 流畅渲染
    Object.keys(this.geoBuckets).forEach(matKey => {
      const list = this.geoBuckets[matKey];
      if (list && list.length > 0) {
        const merged = mergeGeometries(list, false);
        if (merged) {
          const mesh = new THREE.Mesh(merged, this.M[matKey]);
          mesh.receiveShadow = true;
          mesh.castShadow = (matKey !== 'water' && matKey !== 'glass');
          this.scene.add(mesh);
        }
      }
    });

    return {
      interactables: this.interactables,
      animatedObjects: this.animatedObjects,
      roofGroup: this.roofGroup,
      roofMesh: this.roofMesh,
      roofMat: this.roofMat,
      towerSegments: this.towerSegments
    };
  }

  addStaticBlock(matKey, x, y, z, sx = 1, sy = 1, sz = 1) {
    const geo = new THREE.BoxGeometry(sx, sy, sz);
    geo.translate(x, y, z);
    if (this.geoBuckets[matKey]) {
      this.geoBuckets[matKey].push(geo);
    }
  }

  registerInteractable(mesh, targetKey, tooltipText) {
    mesh.userData = { targetKey, tooltipText };
    this.interactables.push(mesh);
  }

  inHouse(x, z) {
    return x > this.HX0 - 0.5 && x < this.HX1 + 0.5 && z > this.HZ0 - 0.5 && z < this.HZ1 + 0.5;
  }

  isPath(x, z) {
    return ((x === -13 || x === -12) && z >= -3 && z <= 28) ||
           ((z === -2 || z === -1) && x >= -13 && x <= 18) ||
           ((x === 1 || x === 2) && z === -3);
  }

  getGroundType(x, z) {
    if (x >= this.HX0 && x <= this.HX1 && z >= this.HZ0 && z <= this.HZ1) {
      if (x > this.HX0 && x < this.IWX && z > this.HZ0 && z < this.IWZ) return 'darkPlanks'; // 爸爸研发室
      if (x > this.IWX && x < this.HX1 && z > this.HZ0 && z < this.IWZ) return 'quartz';     // 儿童游乐角/展厅
      if (x > this.IWX && x < this.HX1 && z > this.IWZ && z < this.HZ1) return 'birch';      // 主卧 & 餐厅
      return 'planks'; // 客厅休闲区
    }
    if (x >= 10 && x <= 20 && z >= 4 && z <= 14) return null; // 扩建下沉式清凉泳池
    if (x >= 9 && x <= 21 && z >= 3 && z <= 15) return 'quartz'; // 泳池石英包边
    if (x >= 7 && x <= 23 && z >= 1 && z <= 17) return 'birch';  // 阳光木甲板
    if (this.isPath(x, z)) return 'path';
    if (x >= 13 && x <= 21 && z >= -16 && z <= -8) return 'cobble'; // 户外露台/篝火区
    if (x >= -10 && x <= -3 && z >= 14 && z <= 22) return 'farmland'; // 妈妈的菜园
    return 'grass';
  }

  buildTerrainAndYard() {
    // 1. 无限大草原向四周各铺展 350 格，采用与院内完全一致的 16x16 像素草地材质与绝对网格 UV
    const makeTerrainPlane = (x0, x1, z0, z1) => {
      const w = x1 - x0, d = z1 - z0;
      const segX = Math.max(1, Math.min(70, Math.round(w / 10)));
      const segZ = Math.max(1, Math.min(70, Math.round(d / 10)));
      const g = new THREE.PlaneGeometry(w, d, segX, segZ);
      g.rotateX(-Math.PI / 2);

      const pos = g.attributes.position;
      const uvs = g.attributes.uv;
      const cx = (x0 + x1) / 2;
      const cz = (z0 + z1) / 2;

      // 绝对世界坐标 UV 映射：每 1x1 方块严格映射一个完整贴图周期，与院内地块像素级无缝拼接
      for (let i = 0; i < pos.count; i++) {
        const worldX = cx + pos.getX(i);
        const worldZ = cz + pos.getZ(i);
        uvs.setXY(i, worldX + 0.5, 0.5 - worldZ);
      }
      uvs.needsUpdate = true;

      const m = new THREE.Mesh(g, this.M.grass);
      m.position.set(cx, 0.5, cz); // 高度与院内草地方块顶部 y = 0.5 严丝合缝平齐
      m.receiveShadow = true;
      this.scene.add(m);
    };
    makeTerrainPlane(-350, 350, -350, -28.5);
    makeTerrainPlane(-350, 350, 28.5, 350);
    makeTerrainPlane(-350, -30.5, -28.5, 28.5);
    makeTerrainPlane(28.5, 350, -28.5, 28.5);

    // 远方珠江碧水流淌 (z = -82)
    const riverGeo = new THREE.PlaneGeometry(700, 20);
    riverGeo.rotateX(-Math.PI / 2);
    const river = new THREE.Mesh(riverGeo, this.M.water);
    river.position.set(0, 0.505, -82);
    this.scene.add(river);

    // 2. 扩建大庭院地块内铺设 (x: -30..28, z: -28..28)
    for (let x = -30; x <= 28; x++) {
      for (let z = -28; z <= 28; z++) {
        const gt = this.getGroundType(x, z);
        if (gt) {
          this.addStaticBlock(gt, x, 0, z);
        }
      }
    }

    // 3. 豪华下沉式泳池池底与水面 (11 x 11 格)
    for (let x = 10; x <= 20; x++) {
      for (let z = 4; z <= 14; z++) {
        this.addStaticBlock('poolTile', x, -1, z);
      }
    }
    const waterGeo = new THREE.PlaneGeometry(11, 11);
    waterGeo.rotateX(-Math.PI / 2);
    const poolWater = new THREE.Mesh(waterGeo, this.M.water);
    poolWater.position.set(15, 0.36, 9);
    poolWater.receiveShadow = true;
    this.scene.add(poolWater);

    // 泳池跳水板
    this.addStaticBlock('quartz', 15, 0.5, 15);
    this.addStaticBlock('quartz', 15, 0.5, 16);
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 2.6), new THREE.MeshLambertMaterial({ color: '#3498db' }));
    board.position.set(15, 0.95, 14.5);
    this.scene.add(board);
    this.registerInteractable(board, 'diving_board', '🤿 泳池跳水板 · 腾空 360 度花样跳水！(点击或按 E 跳水)');

    // 4. 外围鲜亮树篱 (保留正南前院大门 x = -13, -12; z = 28)
    for (let x = -30; x <= 28; x++) {
      this.addStaticBlock('hedge', x, 1, -28);
      if (x !== -13 && x !== -12) {
        this.addStaticBlock('hedge', x, 1, 28);
      }
    }
    for (let z = -28; z <= 28; z++) {
      this.addStaticBlock('hedge', -30, 1, z);
      this.addStaticBlock('hedge', 28, 1, z);
    }

    // 前院大门典雅石木立柱
    this.addStaticBlock('log', -14, 1.5, 28, 0.7, 2.2, 0.7);
    this.addStaticBlock('log', -11, 1.5, 28, 0.7, 2.2, 0.7);
    this.addStaticBlock('gold', -14, 2.7, 28, 0.3, 0.3, 0.3);
    this.addStaticBlock('gold', -11, 2.7, 28, 0.3, 0.3, 0.3);
  }

  buildCottage() {
    // 门洞坐标 (大门直通主路，各房间内外动线顺畅通达)
    const DOORS = new Set([
      '-13,-4', '-12,-4', // 南面主正门 (通向客厅)
      '1,-4', '2,-4',     // 南面侧门 (通向餐厅/露台)
      '-13,-13', '-12,-13', // 客厅通往研发室
      '1,-13', '2,-13',   // 餐厅通往游乐角
      '-6,-9', '-6,-8',   // 客厅通往餐厅
      '-6,-18', '-6,-17'  // 研发室通往游乐角
    ]);

    // 观景全景大飘窗
    const WINDOWS = new Set([
      '-17,-4', '-16,-4', '-9,-4', '-8,-4', '5,-4', '6,-4',
      '8,-18', '8,-17', '8,-9', '8,-8',
      '-20,-18', '-20,-17', '-20,-9', '-20,-8',
      '-15,-22', '-14,-22', '1,-22', '2,-22'
    ]);

    // 建造主体内外墙与立柱 (高度 y = 1..3)
    for (let x = this.HX0; x <= this.HX1; x++) {
      for (let z = this.HZ0; z <= this.HZ1; z++) {
        const onX = x === this.HX0 || x === this.HX1 || x === this.IWX;
        const onZ = z === this.HZ0 || z === this.HZ1 || z === this.IWZ;
        if (!onX && !onZ) continue;

        const k = x + ',' + z;
        const outer = x === this.HX0 || x === this.HX1 || z === this.HZ0 || z === this.HZ1;
        const pillar = onX && onZ;

        for (let y = 1; y <= 3; y++) {
          if (DOORS.has(k) && y <= 2) continue; // 留出门洞
          let t = pillar ? 'log' : (outer ? 'planks' : 'birch');
          if (!pillar && WINDOWS.has(k) && y === 2) t = 'glass';
          if (z === this.HZ0 && x >= -5 && x <= 5) t = 'quartz';
          this.addStaticBlock(t, x, y, z);
        }
      }
    }

    // 宏伟人字形红砖坡顶 (合并为独立网格，进屋自动透明！)
    const roofGeos = [];
    for (let k = 0; k < 11; k++) {
      const z0 = -23 + k, z1 = -3 - k;
      if (z0 > z1) break;
      for (let x = -21; x <= 9; x++) {
        const g1 = new THREE.BoxGeometry(1, 1, 1);
        g1.translate(x, 4 + k, z0);
        roofGeos.push(g1);
        const g2 = new THREE.BoxGeometry(1, 1, 1);
        g2.translate(x, 4 + k, z1);
        roofGeos.push(g2);
      }
      for (let z = z0 + 1; z < z1; z++) {
        const g3 = new THREE.BoxGeometry(1, 1, 1);
        g3.translate(this.HX0, 4 + k, z);
        roofGeos.push(g3);
        const g4 = new THREE.BoxGeometry(1, 1, 1);
        g4.translate(this.HX1, 4 + k, z);
        roofGeos.push(g4);
      }
    }

    // 圆石壁炉烟囱
    for (let y = 4; y <= 12; y++) {
      const cg = new THREE.BoxGeometry(1, 1, 1);
      cg.translate(-16, y, -19);
      roofGeos.push(cg);
    }

    const mergedRoof = mergeGeometries(roofGeos, false);
    this.roofMat = new THREE.MeshLambertMaterial({
      map: this.T.roof,
      transparent: true,
      opacity: 1.0
    });
    this.roofMesh = new THREE.Mesh(mergedRoof, this.roofMat);
    this.roofMesh.castShadow = true;
    this.roofGroup.add(this.roofMesh);
    this.scene.add(this.roofGroup);
  }

  buildYardFeatures() {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    // 1. 鲜艳翠绿、层叠饱满的树木造型
    const makeTree = (tx, tz) => {
      // 橡木树干
      for (let y = 1; y <= 4; y++) this.addStaticBlock('log', tx, y, tz, 0.85, 1.0, 0.85);

      // 第一层与第二层浓密树冠 (5x5)
      for (let lx = -2; lx <= 2; lx++) {
        for (let lz = -2; lz <= 2; lz++) {
          for (let ly of [4, 5]) {
            if (Math.abs(lx) === 2 && Math.abs(lz) === 2) continue; // 去除四角，圆润自然
            this.addStaticBlock('leaves', tx + lx, ly, tz + lz);
          }
        }
      }
      // 第三层树冠 (3x3)
      for (let lx = -1; lx <= 1; lx++) {
        for (let lz = -1; lz <= 1; lz++) {
          this.addStaticBlock('leaves', tx + lx, 6, tz + lz);
        }
      }
      // 树梢十字顶 (y = 7)
      this.addStaticBlock('leaves', tx, 7, tz);
      this.addStaticBlock('leaves', tx + 1, 7, tz);
      this.addStaticBlock('leaves', tx - 1, 7, tz);
      this.addStaticBlock('leaves', tx, 7, tz + 1);
      this.addStaticBlock('leaves', tx, 7, tz - 1);
    };

    // 庭院内葱郁树林点缀
    const yardTrees = [
      [-26, 16], [-20, 24], [-3, 25], [5, 22], [24, 22],
      [-26, -24], [-10, -25], [12, -24], [24, -14], [-26, -12],
      [18, 23], [24, -2], [2, -25], [-27, 2], [24, 8]
    ];
    yardTrees.forEach(([x, z]) => makeTree(x, z));

    // 庭院外大平原散落野生绿树，远眺充满生机
    const wildTrees = [
      [-42, -32], [-48, 18], [36, 26], [42, -20], [-20, 36],
      [-55, -12], [50, 14], [32, 40], [-34, 38], [40, -38],
      [-60, 28], [52, -28], [-12, -45], [16, -46]
    ];
    wildTrees.forEach(([x, z]) => makeTree(x, z));

    // 2. 🏡 豪华双层萌犬木屋 (杰斯 & 旺财的家)
    // 4 根橡木转角立柱
    this.addStaticBlock('log', -26.5, 1.5, -2.0, 0.6, 2.2, 0.6);
    this.addStaticBlock('log', -24.5, 1.5, -2.0, 0.6, 2.2, 0.6);
    this.addStaticBlock('log', -26.5, 1.5, 0.0, 0.6, 2.2, 0.6);
    this.addStaticBlock('log', -24.5, 1.5, 0.0, 0.6, 2.2, 0.6);

    // 狗窝木板墙体 (正面留出门洞)
    this.addStaticBlock('planks', -25.5, 1.2, -2.0, 2.4, 1.8, 0.4);
    this.addStaticBlock('planks', -26.5, 1.2, -1.0, 0.4, 1.8, 2.0);
    this.addStaticBlock('planks', -24.5, 1.2, -1.0, 0.4, 1.8, 2.0);
    this.addStaticBlock('planks', -25.5, 2.1, 0.0, 2.4, 0.6, 0.4); // 门楣

    // 内部舒适红羊毛地毯
    this.addStaticBlock('redWool', -25.5, 0.45, -1.0, 2.0, 0.1, 1.8);

    // 狗屋红色阶梯人字屋顶
    this.addStaticBlock('roof', -25.5, 2.6, -1.0, 3.2, 0.4, 2.8);
    this.addStaticBlock('roof', -25.5, 3.0, -1.0, 2.4, 0.4, 2.8);
    this.addStaticBlock('darkPlanks', -25.5, 3.3, -1.0, 1.4, 0.25, 2.9); // 屋脊

    // 狗屋专属名牌
    const dogSignCanvas = document.createElement('canvas');
    dogSignCanvas.width = 128; dogSignCanvas.height = 48;
    const dsCtx = dogSignCanvas.getContext('2d');
    dsCtx.fillStyle = '#f5cd79';
    dsCtx.fillRect(0, 0, 128, 48);
    dsCtx.strokeStyle = '#5d4127';
    dsCtx.lineWidth = 4;
    dsCtx.strokeRect(2, 2, 124, 44);
    dsCtx.font = 'bold 15px sans-serif';
    dsCtx.fillStyle = '#3a2010';
    dsCtx.textAlign = 'center';
    dsCtx.fillText('🐾 杰斯 & 旺财', 64, 29);
    const dogSignTex = new THREE.CanvasTexture(dogSignCanvas);
    const dogSignMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.45, 0.08),
      new THREE.MeshLambertMaterial({ map: dogSignTex })
    );
    dogSignMesh.position.set(-25.5, 2.1, 0.25);
    this.scene.add(dogSignMesh);
    this.registerInteractable(dogSignMesh, 'dog_villa', '🏡 萌犬豪华狗窝 (杰斯与旺财的家 · 点击查看)');

    // 户外宠物双盆餐吧 (水盆 + 狗粮肉骨头)
    this.addStaticBlock('darkPlanks', -23.8, 0.2, -1.2, 1.2, 0.35, 0.6);
    this.addStaticBlock('water', -24.2, 0.4, -1.2, 0.4, 0.1, 0.4); // 饮水盆
    this.addStaticBlock('redWool', -23.4, 0.4, -1.2, 0.4, 0.1, 0.4); // 狗粮盆
    this.addStaticBlock('whiteWool', -23.4, 0.5, -1.2, 0.25, 0.12, 0.15); // 肉骨头

    // 3. 猫咪爬架
    this.addStaticBlock('log', -19, 1.2, -2, 0.3, 2.4, 0.3);
    this.addStaticBlock('darkPlanks', -19, 1.3, -2, 0.9, 0.1, 0.9);
    this.addStaticBlock('darkPlanks', -19, 2.5, -2, 0.9, 0.1, 0.9);

    // 4. 🌺 宏伟多层次景观大花坛群 (West Yard x: -24..-16, z: 4..12)
    // 石质与木质围合基底
    for (let x = -24; x <= -17; x++) {
      this.addStaticBlock('cobble', x, 0.3, 4, 1, 0.6, 0.3);
      this.addStaticBlock('cobble', x, 0.3, 10, 1, 0.6, 0.3);
    }
    for (let z = 4; z <= 10; z++) {
      this.addStaticBlock('cobble', -24, 0.3, z, 0.3, 0.6, 1);
      this.addStaticBlock('cobble', -17, 0.3, z, 0.3, 0.6, 1);
    }
    // 花坛内部肥沃土壤
    for (let x = -23; x <= -18; x++) {
      for (let z = 5; z <= 9; z++) {
        this.addStaticBlock('dirt', x, 0.35, z, 1, 0.4, 1);
      }
    }

    // 缤纷花卉大阵列 (虞美人、向日葵、郁金香、矢车菊、白雏菊、紫绒球)
    const richFlowers = [
      { x: -23, z: 5, t: 'flowerRed' }, { x: -22, z: 5, t: 'flowerYellow' }, { x: -21, z: 5, t: 'flowerBlue' }, { x: -20, z: 5, t: 'flowerPink' }, { x: -19, z: 5, t: 'whiteWool' }, { x: -18, z: 5, t: 'flowerRed' },
      { x: -23, z: 7, t: 'flowerBlue' }, { x: -22, z: 7, t: 'flowerPink' }, { x: -21, z: 7, t: 'flowerYellow' }, { x: -20, z: 7, t: 'flowerRed' }, { x: -19, z: 7, t: 'flowerBlue' }, { x: -18, z: 7, t: 'flowerPink' },
      { x: -23, z: 9, t: 'flowerYellow' }, { x: -22, z: 9, t: 'flowerRed' }, { x: -21, z: 9, t: 'whiteWool' }, { x: -20, z: 9, t: 'flowerBlue' }, { x: -19, z: 9, t: 'flowerYellow' }, { x: -18, z: 9, t: 'flowerRed' },
      // 花坛外围自然点缀花丛
      { x: -16, z: 4.5, t: 'flowerPink' }, { x: -15, z: 7, t: 'flowerYellow' }, { x: -16, z: 9.5, t: 'flowerRed' },
      { x: -7, z: 6, t: 'flowerYellow' }, { x: -5, z: 8, t: 'flowerRed' }, { x: -4, z: 6, t: 'flowerPink' }, { x: -6, z: 9, t: 'flowerBlue' }
    ];
    richFlowers.forEach(f => {
      this.addStaticBlock(f.t, f.x, 0.75, f.z, 0.4, 0.7, 0.4);
    });

    // 浪漫紫藤花架长廊 (Pergola)
    const pergolaPillars = [[-19, 7.5], [-15.5, 7.5], [-19, 10.5], [-15.5, 10.5]];
    pergolaPillars.forEach(([px, pz]) => {
      this.addStaticBlock('log', px, 1.8, pz, 0.35, 3.5, 0.35);
    });
    // 顶部网格木梁
    this.addStaticBlock('darkPlanks', -17.25, 3.6, 7.5, 3.8, 0.25, 0.35);
    this.addStaticBlock('darkPlanks', -17.25, 3.6, 10.5, 3.8, 0.25, 0.35);
    for (let rx = -19; rx <= -15.5; rx += 1.1) {
      this.addStaticBlock('planks', rx, 3.8, 9, 0.2, 0.2, 3.4);
      this.addStaticBlock('leaves', rx, 3.9, 9, 0.5, 0.35, 3.4);
    }
    // 凉亭垂挂暖光宫灯
    this.addStaticBlock('gold', -17.25, 3.3, 9, 0.25, 0.35, 0.25);
    const pergolaLight = new THREE.PointLight('#ffd6a0', 1.2, 12, 1.2);
    pergolaLight.position.set(-17.25, 3.0, 9);
    this.scene.add(pergolaLight);

    // 白色田园休闲长椅 (在花架下)
    const benchGroup = new THREE.Group();
    const benchMat = new THREE.MeshLambertMaterial({ color: '#f5f6fa' });
    const bSeat = new THREE.Mesh(boxGeo, benchMat);
    bSeat.scale.set(1.8, 0.15, 0.6);
    bSeat.position.set(0, 0.45, 0);
    const bBack = new THREE.Mesh(boxGeo, benchMat);
    bBack.scale.set(1.8, 0.55, 0.12);
    bBack.position.set(0, 0.75, -0.25);
    benchGroup.add(bSeat, bBack);
    benchGroup.position.set(-17.25, 0, 9);
    this.scene.add(benchGroup);
    this.registerInteractable(bSeat, 'garden_bench', '🪑 田园花架长椅 (在紫藤花架下闻闻花香 · 坐下小憩)');

    // 妈妈的园艺工坊操作台 (Potting Bench)
    const pottingTable = new THREE.Mesh(boxGeo, this.M.darkPlanks);
    pottingTable.scale.set(1.6, 0.8, 0.9);
    pottingTable.position.set(-25, 0.4, 6);
    this.scene.add(pottingTable);
    // 陶土小花盆与洒水壶
    this.addStaticBlock('flowerRed', -25.4, 0.95, 6, 0.28, 0.32, 0.28);
    this.addStaticBlock('leaves', -25.4, 1.15, 6, 0.2, 0.2, 0.2); // 小幼苗
    this.addStaticBlock('iron', -24.6, 0.95, 6, 0.3, 0.28, 0.35); // 洒水壶
    this.registerInteractable(pottingTable, 'flower_smell', '🌺 妈妈的花圃与园艺台 (深吸一口馥郁花香 · 获得好心情)');

    // 庭院石砌水景喷泉 (Stone Garden Fountain)
    const fCenter = new THREE.Vector3(-14, 0, 4.5);
    this.addStaticBlock('quartz', fCenter.x, 0.25, fCenter.z, 2.6, 0.5, 2.6);
    this.addStaticBlock('cobble', fCenter.x, 0.25, fCenter.z, 3.2, 0.4, 3.2);
    this.addStaticBlock('quartz', fCenter.x, 0.7, fCenter.z, 0.6, 0.9, 0.6); // 喷泉中心柱
    this.addStaticBlock('quartz', fCenter.x, 1.15, fCenter.z, 1.2, 0.15, 1.2); // 上层水盆
    const fWater = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.1, 2.4),
      this.M.water
    );
    fWater.position.set(fCenter.x, 0.48, fCenter.z);
    this.scene.add(fWater);
    this.registerInteractable(fWater, 'garden_fountain', '⛲ 庭院水景喷泉 (聆听清脆叮咚泉水)');

    // 5. 菜园农作物生长架
    for (let x = -10; x <= -3; x += 2) {
      for (let z of [15, 19]) {
        this.addStaticBlock('fence', x, 0.9, z, 0.2, 1.8, 0.2);
        this.addStaticBlock('leaves', x, 1.8, z, 0.6, 0.5, 0.6);
      }
    }

    // 6. 户外露台 / 啤酒花园 / 篝火区 (x: 13..21, z: -16..-8)
    this.addStaticBlock('planks', 17, 0.75, -12, 3.6, 0.15, 1.4);
    this.addStaticBlock('log', 15.6, 0.35, -12, 0.2, 0.7, 1.0);
    this.addStaticBlock('log', 18.4, 0.35, -12, 0.2, 0.7, 1.0);
    this.addStaticBlock('darkPlanks', 17, 0.45, -13.2, 3.6, 0.1, 0.4);
    this.addStaticBlock('darkPlanks', 17, 0.45, -10.8, 3.6, 0.1, 0.4);

    // 美式美酒与 BBQ 烤肉炉
    const bbqPedestal = new THREE.Mesh(boxGeo, this.M.cobble);
    bbqPedestal.scale.set(1.4, 0.85, 1.0);
    bbqPedestal.position.set(19.5, 0.42, -9);
    this.scene.add(bbqPedestal);
    const bbqGrillTop = new THREE.Mesh(boxGeo, new THREE.MeshLambertMaterial({ color: '#1e272e' }));
    bbqGrillTop.scale.set(1.2, 0.12, 0.85);
    bbqGrillTop.position.set(19.5, 0.9, -9);
    this.scene.add(bbqGrillTop);
    // 烤肉串
    this.addStaticBlock('redWool', 19.3, 0.98, -9, 0.6, 0.08, 0.15);
    this.addStaticBlock('gold', 19.3, 0.98, -8.7, 0.6, 0.08, 0.15);
    this.registerInteractable(bbqGrillTop, 'bbq_grill', '🥩 美式庭院烤肉架 (滋滋作响的热腾腾黑椒肉串 · 补充爱心)');

    // 露台大遮阳伞
    this.addStaticBlock('iron', 17, 1.8, -12, 0.1, 3.8, 0.1);
    this.addStaticBlock('flowerRed', 17, 3.8, -12, 2.8, 0.15, 2.8);
    this.addStaticBlock('whiteWool', 17, 3.95, -12, 1.8, 0.15, 1.8);

    // 户外篝火
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 0.22), this.M.log);
      log.rotation.y = (i * Math.PI) / 4;
      log.position.set(17, 0.55, -8.5);
      this.scene.add(log);
    }
    const fireLight = new THREE.PointLight('#ff8a33', 1.5, 14, 1.2);
    fireLight.position.set(17, 1.6, -8.5);
    this.scene.add(fireLight);

    const flameGeo = new THREE.BoxGeometry(0.22, 0.35, 0.22);
    const flames = [];
    for (let i = 0; i < 4; i++) {
      const fMat = new THREE.MeshBasicMaterial({ color: i % 2 ? '#ffb300' : '#ff5722' });
      const fMesh = new THREE.Mesh(flameGeo, fMat);
      fMesh.position.set(17 + (Math.random() - 0.5) * 0.4, 0.75, -8.5 + (Math.random() - 0.5) * 0.4);
      this.scene.add(fMesh);
      flames.push(fMesh);
    }
    this.animatedObjects.push({
      update: (delta, time) => {
        flames.forEach((f, idx) => {
          f.scale.y = 0.8 + Math.sin(time * 8 + idx) * 0.35;
          f.position.y = 0.75 + Math.sin(time * 6 + idx * 1.5) * 0.08;
        });
        fireLight.intensity = 1.3 + Math.sin(time * 9) * 0.25;
      }
    });

    // 7. 女儿们的儿童游乐区：双人秋千架 + 彩虹滑滑梯 + 大沙坑
    this.addStaticBlock('darkPlanks', 13.5, 1.8, 8, 0.35, 3.5, 0.35);
    this.addStaticBlock('darkPlanks', 17.5, 1.8, 8, 0.35, 3.5, 0.35);
    this.addStaticBlock('darkPlanks', 15.5, 3.6, 8, 4.4, 0.35, 0.35);
    this.addStaticBlock('planks', 14.5, 0.5, 8, 0.7, 0.15, 0.5);
    this.addStaticBlock('planks', 16.5, 0.5, 8, 0.7, 0.15, 0.5);

    // 彩虹滑滑梯 (Children's Rainbow Slide)
    // 爬梯与滑梯平台
    this.addStaticBlock('planks', 18.5, 1.0, 5.0, 0.3, 2.0, 0.8); // 楼梯
    this.addStaticBlock('quartz', 18.5, 2.0, 6.0, 1.2, 0.2, 1.2); // 顶部平台
    this.addStaticBlock('fence', 18.5, 2.5, 6.0, 1.2, 0.8, 1.2); // 护栏
    // 顺滑下滑道 (倾斜蓝色滑道)
    const slideMesh = new THREE.Mesh(
      boxGeo,
      new THREE.MeshLambertMaterial({ color: '#3498db' })
    );
    slideMesh.scale.set(0.9, 0.15, 2.6);
    slideMesh.position.set(18.5, 1.0, 7.8);
    slideMesh.rotation.x = -0.55;
    this.scene.add(slideMesh);
    this.registerInteractable(slideMesh, 'slide_play', '🌈 彩虹儿童滑滑梯 (咻——！滑下获得童年快乐能量)');

    // 大号沙坑
    this.addStaticBlock('planks', 15.5, 0.2, 16.5, 3.8, 0.4, 3.8);
    this.addStaticBlock('dirt', 15.5, 0.3, 16.5, 3.0, 0.3, 3.0);
  }

  buildInteractiveObjects() {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    // ==========================================
    // 房间 1: 爸爸的红石研发室 (NW: x: -20..-6, z: -22..-13)
    // ==========================================

    // 1. 💻 研发电脑桌与双联屏 (Desk x: -14..-10, z: -21)
    const desk = new THREE.Mesh(boxGeo, this.M.darkPlanks);
    desk.scale.set(4.0, 0.8, 1.3);
    desk.position.set(-13.5, 0.4, -21);
    this.scene.add(desk);
    this.registerInteractable(desk, 'computer', '💻 爸爸的工作电脑 (全栈红石工作台 · 点击进入)');

    // 研发工位座椅
    const chair = new THREE.Mesh(boxGeo, new THREE.MeshLambertMaterial({ color: '#2f3640' }));
    chair.scale.set(0.7, 0.75, 0.7);
    chair.position.set(-13.5, 0.45, -19.5);
    this.scene.add(chair);

    // 双屏幕与动态编译代码
    const codeCanvas = document.createElement('canvas');
    codeCanvas.width = 128; codeCanvas.height = 64;
    const codeCtx = codeCanvas.getContext('2d');
    const codeTex = new THREE.CanvasTexture(codeCanvas);
    codeTex.magFilter = THREE.NearestFilter;
    const monitorMat = new THREE.MeshBasicMaterial({ map: codeTex });

    const mon1 = new THREE.Mesh(boxGeo, monitorMat);
    mon1.scale.set(1.15, 0.7, 0.06);
    mon1.position.set(-14.3, 1.3, -20.9);
    this.scene.add(mon1);

    const mon2 = new THREE.Mesh(boxGeo, monitorMat);
    mon2.scale.set(1.15, 0.7, 0.06);
    mon2.position.set(-12.7, 1.3, -20.9);
    this.scene.add(mon2);

    const codeLines = [
      '// Villa Engine 60FPS Pro Max',
      'const family = new FamilySystem();',
      'world.expandFootprint({ scale: 1.4 });',
      'Build: SUCCESS · 0 Errors · Vivid'
    ];
    this.animatedObjects.push({
      update: () => {
        codeCtx.fillStyle = '#111318';
        codeCtx.fillRect(0, 0, 128, 64);
        codeCtx.font = '9px monospace';
        codeCtx.fillStyle = '#7cdb04';
        codeLines.forEach((l, i) => codeCtx.fillText(l, 6, 12 + i * 12));
        if (Math.sin(Date.now() * 0.008) > 0) {
          codeCtx.fillStyle = '#00ffff';
          codeCtx.fillRect(100, 48, 6, 2);
        }
        codeTex.needsUpdate = true;
      }
    });

    // 2. 🦆 调试小黄鸭 (Rubber Duck Debugging)
    const duckMat = new THREE.MeshLambertMaterial({ color: '#ffd23f' });
    const duck = new THREE.Mesh(boxGeo, duckMat);
    duck.scale.set(0.35, 0.35, 0.4);
    duck.position.set(-15.2, 0.95, -20.8);
    this.scene.add(duck);
    this.registerInteractable(duck, 'rubber_duck', '🦆 调试小黄鸭 (嘎嘎！给小黄鸭讲 Bug 思路立清)');

    // 3. 📋 研发室白板 · 全家 TODO
    const boardMat = new THREE.MeshLambertMaterial({ color: '#f5f6fa' });
    const board = new THREE.Mesh(boxGeo, boardMat);
    board.scale.set(2.6, 1.3, 0.08);
    board.position.set(-13.5, 2.3, -13.6);
    this.scene.add(board);
    this.registerInteractable(board, 'whiteboard', '📋 白板 · 全家 TODO (查看家庭备忘与小愿望)');

    // 4. 📚 西侧墙面附魔技能书架 (x = -19.4, z: -21..-15)
    const shelf = new THREE.Mesh(boxGeo, this.M.bookshelf);
    shelf.scale.set(0.9, 2.6, 5.6);
    shelf.position.set(-19.4, 1.6, -17.5);
    this.scene.add(shelf);
    this.registerInteractable(shelf, 'skills', '📚 附魔书架 (全栈技术栈与学识宝库)');

    // ==========================================
    // 房间 2: 客厅 & 休闲区 (SW: x: -20..-6, z: -13..-4)
    // ==========================================

    // 5. 🛋️ 客厅温馨豪华长沙发
    const sofaMat = new THREE.MeshLambertMaterial({ color: '#b03a2e' });
    const sofa = new THREE.Mesh(boxGeo, sofaMat);
    sofa.scale.set(1.4, 0.7, 4.2);
    sofa.position.set(-15.5, 0.45, -8.5);
    this.scene.add(sofa);
    this.registerInteractable(sofa, 'sofa_rest', '🛋️ 客厅小沙发 (坐一会儿歇歇脚)');

    // 客厅茶几
    const teaTable = new THREE.Mesh(boxGeo, this.M.darkPlanks);
    teaTable.scale.set(1.2, 0.4, 2.6);
    teaTable.position.set(-13.5, 0.25, -8.5);
    this.scene.add(teaTable);

    // 6. 🎵 客厅留声唱片机
    const jukeMat = new THREE.MeshLambertMaterial({ color: '#574b90' });
    const jukebox = new THREE.Mesh(boxGeo, jukeMat);
    jukebox.scale.set(0.9, 0.9, 0.9);
    jukebox.position.set(-7, 0.45, -5);
    this.scene.add(jukebox);
    this.registerInteractable(jukebox, 'jukebox', '🎵 留声唱片机 (播放 C418 治愈音乐)');

    // 7. 🧊 精酿啤酒与冰饮双门冰箱
    const fridgeMat = new THREE.MeshLambertMaterial({ color: '#dfe4ea' });
    const fridge = new THREE.Mesh(boxGeo, fridgeMat);
    fridge.scale.set(1.1, 2.3, 1.1);
    fridge.position.set(-8, 1.15, -12);
    this.scene.add(fridge);
    this.registerInteractable(fridge, 'fridge', '🧊 冰箱 · 拿冰饮 (点击打开冰箱 · 补充爱心体力)');

    // ==========================================
    // 房间 3: 儿童游乐角与作品展厅 (NE: x: -6..8, z: -22..-13)
    // ==========================================

    // 8. 🕹️ 复古街机工坊 (大女儿最爱)
    const arcadeMat = new THREE.MeshLambertMaterial({ color: '#2c3e50' });
    const arcade = new THREE.Mesh(boxGeo, arcadeMat);
    arcade.scale.set(1.2, 2.3, 1.2);
    arcade.position.set(5.5, 1.15, -21);
    this.scene.add(arcade);
    this.registerInteractable(arcade, 'arcade', '🕹️ 街机工坊 (大女儿常玩的贪吃蛇)');

    // 9. 📦 精选作品宝箱 / 玩具箱
    const chest = new THREE.Mesh(boxGeo, new THREE.MeshLambertMaterial({ color: '#a07034' }));
    chest.scale.set(1.8, 0.8, 0.9);
    chest.position.set(2, 0.4, -16);
    this.scene.add(chest);
    this.registerInteractable(chest, 'chest', '📦 精选作品宝箱 (开源项目与精选展柜)');

    // 10. 🧸 玩具收纳箱
    const toyBox = new THREE.Mesh(boxGeo, this.M.toyBox);
    toyBox.scale.set(1.2, 0.7, 0.9);
    toyBox.position.set(-2, 0.35, -21);
    this.scene.add(toyBox);
    this.registerInteractable(toyBox, 'toy_box', '🧸 小女儿的玩具箱 (积木与宝物)');

    // ==========================================
    // 房间 4: 主卧 & 独立餐厅 & 咖啡吧 (SE: x: -6..8, z: -13..-4)
    // ==========================================

    // 11. 🛏️ 主卧大床 · 睡一觉 (点击入睡、切换昼夜！)
    const bed = new THREE.Mesh(boxGeo, this.M.redWool);
    bed.scale.set(2.4, 0.6, 2.0);
    bed.position.set(5, 0.35, -11);
    this.scene.add(bed);
    this.registerInteractable(bed, 'bed_sleep', '🛏️ 大床 · 睡一觉 (点击入睡 · 迎来明媚日出)');

    // 12. ☕ 妈妈的特调咖啡吧台
    const bar = new THREE.Mesh(boxGeo, this.M.darkPlanks);
    bar.scale.set(2.8, 0.9, 0.9);
    bar.position.set(6, 0.45, -6);
    this.scene.add(bar);
    this.registerInteractable(bar, 'coffee', '☕ 妈妈的咖啡吧 (治愈系特调)');

    // 13. 🖼️ 全家福合影相框
    const photoFrame = new THREE.Mesh(boxGeo, this.M.gold);
    photoFrame.scale.set(1.6, 2.0, 0.08);
    photoFrame.position.set(-2, 2.3, -12.45);
    this.scene.add(photoFrame);
    this.registerInteractable(photoFrame, 'family_photo', '🖼️ 全家福合影 (四口之家的温馨回忆)');

    // 14. 🎂 独立四人餐桌与妈妈手作草莓蛋糕
    const table = new THREE.Mesh(boxGeo, this.M.darkPlanks);
    table.scale.set(2.6, 0.75, 1.8);
    table.position.set(0, 0.38, -8.5);
    this.scene.add(table);

    // 4 把餐椅 (围绕餐桌)
    const makeChair = (cx, cz, s = 1.0) => {
      const seat = new THREE.Mesh(boxGeo, this.M.planks);
      seat.scale.set(0.6 * s, 0.45 * s, 0.6 * s);
      seat.position.set(cx, 0.23 * s, cz);
      this.scene.add(seat);
    };
    makeChair(0, -9.8, 1.0);    // 爸爸的椅子
    makeChair(0, -7.2, 0.95);   // 妈妈的椅子
    makeChair(-1.7, -8.5, 0.82); // 大女儿悦悦的椅子
    makeChair(1.7, -8.5, 0.70);  // 小女儿恬恬的小椅子

    // 餐桌正中央的手作草莓奶油蛋糕
    const cakeGeo = new THREE.BoxGeometry(0.75, 0.35, 0.75);
    const cake = new THREE.Mesh(cakeGeo, new THREE.MeshLambertMaterial({ color: '#f5f6fa' }));
    cake.position.set(0, 0.92, -8.5);
    const berry = new THREE.Mesh(boxGeo, new THREE.MeshLambertMaterial({ color: '#e84118' }));
    berry.scale.set(0.22, 0.16, 0.22);
    berry.position.set(0, 0.22, 0);
    cake.add(berry);
    this.scene.add(cake);
    this.registerInteractable(cake, 'table_cake', '🎂 四人餐桌 · 妈妈手作草莓蛋糕 (点击品尝 · 补充爱心)');

    // ==========================================
    // 庭院户外交互物体
    // ==========================================

    // 15. ✉️ 门前末影信箱 (南面大门旁)
    const mailBox = new THREE.Mesh(boxGeo, new THREE.MeshLambertMaterial({ color: '#3a7bd5' }));
    mailBox.scale.set(0.6, 0.6, 0.7);
    mailBox.position.set(-11, 1.3, -3.5);
    this.scene.add(mailBox);
    this.registerInteractable(mailBox, 'mailbox', '✉️ 末影信箱 (联系与留言)');

    // 17. 🎠 庭院双人秋千
    const swingSeat = new THREE.Mesh(boxGeo, this.M.planks);
    swingSeat.scale.set(1.8, 0.2, 0.6);
    swingSeat.position.set(15.0, 0.6, 8);
    this.scene.add(swingSeat);
    this.registerInteractable(swingSeat, 'swing', '🎠 庭院秋千 (坐在秋千上快乐摆动)');

    // 18. 🌺 妈妈的花圃
    const flowerBed = new THREE.Mesh(boxGeo, this.M.flowerRed);
    flowerBed.scale.set(1.8, 0.5, 1.8);
    flowerBed.position.set(-20, 0.4, 7);
    this.scene.add(flowerBed);
    this.registerInteractable(flowerBed, 'flower_smell', '🌺 妈妈的花圃 (轻嗅花香 · 获得好心情)');
  }

  buildDistantLandmark() {
    // 广州塔（小蛮腰）在远方天际线优雅伫立 (x = 32, z = -60)
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const towerX = 32, towerZ = -60;

    for (let ty = 1; ty <= 46; ty++) {
      const t = ty / 46;
      const r = t < 0.62 ? 1.7 + 4.4 * Math.pow((0.62 - t) / 0.62, 2) : 1.7 + 3.2 * Math.pow((t - 0.62) / 0.38, 2);
      const segMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      const segMesh = new THREE.Mesh(boxGeo, segMat);
      segMesh.scale.set(r * 1.6, 1.0, r * 1.6);
      segMesh.position.set(towerX, ty, towerZ);
      this.scene.add(segMesh);
      this.towerSegments.push(segMesh);
    }

    // 塔尖天线
    for (let ty = 47; ty <= 64; ty++) {
      const spireMat = new THREE.MeshBasicMaterial({ color: '#cfd6dd' });
      const spire = new THREE.Mesh(boxGeo, spireMat);
      spire.scale.set(0.6, 1.0, 0.6);
      spire.position.set(towerX, ty, towerZ);
      this.scene.add(spire);
    }
  }
}
