/**
 * ==============================================================================
 * VoxelModel - High-Detail Minecraft Family Humanoid Characters
 * ==============================================================================
 * Features:
 * - 16x16 crystal-clear pixel art textures for Face, Torso, Arms, and Legs.
 * - Detailed facial features: sparkling eyes with pupils & specular highlights,
 *   expressive eyebrows, cute blush cheeks, smiles, and styled hair bangs.
 * - 3D layered hair volume, ponytails, hair-buns, and ribbons.
 * - High-detail clothing: collars, buttons, belts, overalls, sleeves, and shoes.
 * - Crisp floating overhead name-tags with identity and role icons.
 */

import * as THREE from 'three';
import { bus } from '../core/EventBus.js';

// 像素纹理创建辅助函数 (16x16 严格最近邻像素采样)
function createPixelTexture(w, h, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 头部与五官贴图生成器
function generateHeadMaterials(id, colors) {
  const skin = colors.skin;
  const hair = colors.hair;
  const isFemale = colors.isDress;

  // 1. 正面脸部贴图 (Face - 16x16)
  const faceTex = createPixelTexture(16, 16, ctx => {
    // 肤色底色
    ctx.fillStyle = skin;
    ctx.fillRect(0, 0, 16, 16);

    // 额头刘海发型 (前 4 行与两侧鬓角)
    ctx.fillStyle = hair;
    ctx.fillRect(0, 0, 16, 3);
    ctx.fillRect(0, 3, 2, 8);
    ctx.fillRect(14, 3, 2, 8);

    if (id === 'dad') {
      // 爸爸的发型：帅气侧分短发
      ctx.fillRect(2, 3, 7, 2);
      ctx.fillRect(9, 3, 4, 1);
      ctx.fillRect(13, 3, 2, 1);

      // 眉毛 (粗黑有神)
      ctx.fillStyle = '#2b1b11';
      ctx.fillRect(3, 5, 3, 1);
      ctx.fillRect(10, 5, 3, 1);

      // 眼睛：眼白 + 湛蓝瞳孔 + 眼神高光
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, 7, 3, 2);
      ctx.fillRect(10, 7, 3, 2);
      ctx.fillStyle = '#1e3799';
      ctx.fillRect(4, 7, 2, 2);
      ctx.fillRect(10, 7, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 7, 1, 1);
      ctx.fillRect(10, 7, 1, 1);

      // 爸爸的胡渣微笑 (Steve 经典亲切笑容)
      ctx.fillStyle = '#7a422a';
      ctx.fillRect(6, 11, 4, 1);
      ctx.fillRect(5, 12, 6, 1);
      ctx.fillStyle = '#5c3321';
      ctx.fillRect(5, 13, 6, 1);
    } else if (id === 'mom') {
      // 妈妈的发型：温婉栗色斜刘海
      ctx.fillRect(2, 3, 9, 2);
      ctx.fillRect(11, 3, 3, 1);

      // 细弯温柔眉毛
      ctx.fillStyle = '#3e2417';
      ctx.fillRect(3, 5, 3, 1);
      ctx.fillRect(10, 5, 3, 1);

      // 眼睛：眼睫毛 + 翡翠绿双瞳 + 灵动高光
      ctx.fillStyle = '#1f130b';
      ctx.fillRect(3, 6, 4, 1);
      ctx.fillRect(9, 6, 4, 1);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, 7, 3, 2);
      ctx.fillRect(10, 7, 3, 2);

      ctx.fillStyle = '#2ed573';
      ctx.fillRect(4, 7, 2, 2);
      ctx.fillRect(10, 7, 2, 2);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 7, 1, 1);
      ctx.fillRect(10, 7, 1, 1);

      // 少女感粉嫩腮红
      ctx.fillStyle = '#ff758c';
      ctx.fillRect(2, 9, 2, 1);
      ctx.fillRect(12, 9, 2, 1);

      // 亲切温柔粉红微笑
      ctx.fillStyle = '#e84118';
      ctx.fillRect(6, 11, 4, 1);
      ctx.fillStyle = '#ff6b81';
      ctx.fillRect(6, 12, 4, 1);
    } else if (id === 'daughter1') {
      // 大女儿发型：活泼齐刘海 + 红色发夹
      ctx.fillRect(2, 3, 12, 2);
      ctx.fillRect(2, 5, 2, 1);
      ctx.fillRect(12, 5, 2, 1);

      // 俏皮发夹
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(11, 2, 3, 2);

      // 眉毛
      ctx.fillStyle = '#4a2c17';
      ctx.fillRect(3, 5, 3, 1);
      ctx.fillRect(10, 5, 3, 1);

      // 眼睛：元气琥珀金大眼睛 + 双亮点高光
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, 7, 3, 3);
      ctx.fillRect(10, 7, 3, 3);

      ctx.fillStyle = '#f39c12';
      ctx.fillRect(4, 7, 2, 3);
      ctx.fillRect(10, 7, 2, 3);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 7, 1, 1);
      ctx.fillRect(10, 7, 1, 1);
      ctx.fillRect(5, 9, 1, 1);
      ctx.fillRect(11, 9, 1, 1);

      // 脸颊腮红
      ctx.fillStyle = '#ff7f50';
      ctx.fillRect(2, 10, 2, 1);
      ctx.fillRect(12, 10, 2, 1);

      // 开怀大笑嘴巴
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(6, 12, 4, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 12, 2, 1); // 露出小白牙
    } else {
      // 小女儿发型：萌萌小刘海 + 黄色蝴蝶发卡
      ctx.fillRect(2, 3, 12, 2);
      ctx.fillRect(5, 5, 6, 1);

      // 黄色发饰
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(2, 2, 2, 2);

      // 萌萌大圆眼
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, 7, 3, 3);
      ctx.fillRect(10, 7, 3, 3);

      ctx.fillStyle = '#8e44ad';
      ctx.fillRect(4, 7, 2, 3);
      ctx.fillRect(10, 7, 2, 3);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 7, 1, 1);
      ctx.fillRect(10, 7, 1, 1);
      ctx.fillRect(5, 9, 1, 1);
      ctx.fillRect(11, 9, 1, 1);

      // 圆嘟嘟红脸蛋
      ctx.fillStyle = '#ff6b8b';
      ctx.fillRect(2, 10, 2, 2);
      ctx.fillRect(12, 10, 2, 2);

      // 萌趣小嘴
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(7, 12, 2, 1);
      ctx.fillRect(7, 13, 2, 1);
    }
  });

  // 2. 侧面 (左/右)
  const sideTex = createPixelTexture(16, 16, ctx => {
    ctx.fillStyle = hair;
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = skin;
    ctx.fillRect(0, 7, 8, 9);
    // 鬓角自然修剪
    ctx.fillStyle = hair;
    ctx.fillRect(0, 7, 3, 4);
    if (isFemale) {
      // 女性长发垂落感
      ctx.fillRect(5, 7, 11, 9);
    }
  });

  // 3. 顶部 (头发纹理)
  const topTex = createPixelTexture(16, 16, ctx => {
    ctx.fillStyle = hair;
    ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#26150b' : '#57331b';
      ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
    }
  });

  // 4. 背部 (后脑勺头发)
  const backTex = createPixelTexture(16, 16, ctx => {
    ctx.fillStyle = hair;
    ctx.fillRect(0, 0, 16, 16);
    if (!isFemale) {
      ctx.fillStyle = skin;
      ctx.fillRect(0, 12, 16, 4); // 短发脖颈
    }
  });

  const bottomTex = createPixelTexture(16, 16, ctx => {
    ctx.fillStyle = skin;
    ctx.fillRect(0, 0, 16, 16);
  });

  const L = t => new THREE.MeshLambertMaterial({ map: t });
  // BoxGeometry 面的顺序: [+X(右), -X(左), +Y(上), -Y(下), +Z(前脸), -Z(后脑)]
  return [L(sideTex), L(sideTex), L(topTex), L(bottomTex), L(faceTex), L(backTex)];
}

// 躯干服装贴图
function generateTorsoMaterials(id, colors) {
  const shirt = colors.shirt;
  const pants = colors.pants;
  const skin = colors.skin;

  // 正面衣服 (前片)
  const frontTex = createPixelTexture(16, 16, ctx => {
    ctx.fillStyle = shirt;
    ctx.fillRect(0, 0, 16, 16);

    // 领口
    ctx.fillStyle = skin;
    ctx.fillRect(6, 0, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 2, 1, 2);
    ctx.fillRect(10, 2, 1, 2);

    if (id === 'dad') {
      // 爸爸的工匠衬衫：纽扣、皮带与铜扣
      ctx.fillStyle = '#111';
      ctx.fillRect(7, 4, 2, 1);
      ctx.fillRect(7, 7, 2, 1);
      ctx.fillRect(7, 10, 2, 1);
      // 皮带
      ctx.fillStyle = '#4a2c17';
      ctx.fillRect(0, 13, 16, 3);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(6, 13, 4, 3);
      ctx.fillStyle = '#222';
      ctx.fillRect(7, 14, 2, 1);
    } else if (id === 'mom') {
      // 妈妈的玫瑰毛衣：白蕾丝翻领与腰带
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 1, 6, 2);
      ctx.fillStyle = '#e84118';
      ctx.fillRect(0, 13, 16, 2);
    } else if (id === 'daughter1') {
      // 大女儿背带裤：黄色卫衣 + 蓝色牛仔背带与银色扣
      ctx.fillStyle = '#4a69bd';
      ctx.fillRect(2, 4, 3, 12);
      ctx.fillRect(11, 4, 3, 12);
      ctx.fillRect(2, 9, 12, 7);
      ctx.fillStyle = '#dcdde1';
      ctx.fillRect(3, 8, 1, 1);
      ctx.fillRect(12, 8, 1, 1);
    } else {
      // 小女儿草莓裙：胸前爱心小徽章
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 2, 6, 2);
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(7, 6, 2, 2);
      ctx.fillRect(6, 5, 4, 1);
    }
  });

  const sideTex = createPixelTexture(16, 16, ctx => {
    ctx.fillStyle = shirt;
    ctx.fillRect(0, 0, 16, 16);
  });

  const L = t => new THREE.MeshLambertMaterial({ map: t });
  return [L(sideTex), L(sideTex), L(sideTex), L(sideTex), L(frontTex), L(sideTex)];
}

// 手臂贴图 (袖子 + 手部肉色)
function generateArmMaterials(shirtColor, skinColor) {
  const armTex = createPixelTexture(8, 16, ctx => {
    ctx.fillStyle = shirtColor;
    ctx.fillRect(0, 0, 8, 11); // 袖子
    ctx.fillStyle = skinColor;
    ctx.fillRect(0, 11, 8, 5); // 小手
  });
  const handTex = createPixelTexture(8, 8, ctx => {
    ctx.fillStyle = skinColor;
    ctx.fillRect(0, 0, 8, 8);
  });
  const L = t => new THREE.MeshLambertMaterial({ map: t });
  return [L(armTex), L(armTex), L(handTex), L(handTex), L(armTex), L(armTex)];
}

// 腿部贴图 (裤子 + 鞋子)
function generateLegMaterials(pantsColor, shoeColor = '#222') {
  const legTex = createPixelTexture(8, 16, ctx => {
    ctx.fillStyle = pantsColor;
    ctx.fillRect(0, 0, 8, 12); // 裤子
    ctx.fillStyle = shoeColor;
    ctx.fillRect(0, 12, 8, 4);  // 鞋子
  });
  const soleTex = createPixelTexture(8, 8, ctx => {
    ctx.fillStyle = shoeColor;
    ctx.fillRect(0, 0, 8, 8);
  });
  const L = t => new THREE.MeshLambertMaterial({ map: t });
  return [L(legTex), L(legTex), L(soleTex), L(soleTex), L(legTex), L(legTex)];
}

export class VoxelCharacter {
  constructor(memberConfig) {
    this.config = memberConfig;
    this.group = new THREE.Group();
    this.scale = memberConfig.scale || 1.0;

    this.body = null; // 内层身体组：游泳放平与跳水翻滚枢轴
    this.head = null;
    this.leftArm = null;
    this.rightArm = null;
    this.leftLeg = null;
    this.rightLeg = null;
    this.nameSprite = null;

    this.walkCycle = 0;
    this.isWalking = false;
    this.inWater = false;
    this.swimProgress = 0.0;
    this.strokeCycle = 0.0;
    this.mode = 'walk'; // 'walk' | 'dive'
    this.diveTime = 0.0;
    this.petGestureTimer = 0.0;
    this.isRidingBike = false;
    this.bikePedalCycle = 0.0;

    this.build();
  }

  // 播放俯身摸摸宠物动作
  playPetGesture(duration = 2.2) {
    this.petGestureTimer = duration;
  }

  build() {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const id = this.config.id;
    const colors = this.config.skinColors || {
      shirt: '#00aaaa',
      pants: '#2d288a',
      hair: '#4a3321',
      skin: '#f2cba8'
    };

    // 内层身体组 (游泳姿态水平旋转中枢)
    this.body = new THREE.Group();
    this.group.add(this.body);

    // 1. 高精度 16x16 头部 (带生动五官、大眼睛、表情腮红)
    this.head = new THREE.Group();
    const headMats = generateHeadMaterials(id, colors);
    const headMesh = new THREE.Mesh(boxGeo, headMats);
    headMesh.scale.set(0.6, 0.6, 0.6);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // 2. 3D 立体发型层次感 (Second Layer Hair Voxels)
    const hairMat = new THREE.MeshLambertMaterial({ color: colors.hair });

    if (id === 'dad') {
      // 爸爸：帅气 3D 侧分发块
      const topHair = new THREE.Mesh(boxGeo, hairMat);
      topHair.scale.set(0.64, 0.18, 0.64);
      topHair.position.set(0, 0.24, 0);
      this.head.add(topHair);

      const bang = new THREE.Mesh(boxGeo, hairMat);
      bang.scale.set(0.5, 0.14, 0.12);
      bang.position.set(-0.04, 0.18, 0.28);
      this.head.add(bang);
    } else if (id === 'mom') {
      // 妈妈：长发披肩与温婉发髻
      const topHair = new THREE.Mesh(boxGeo, hairMat);
      topHair.scale.set(0.64, 0.2, 0.64);
      topHair.position.set(0, 0.22, 0);
      this.head.add(topHair);

      // 后脑与双肩飘逸长发
      const backHair = new THREE.Mesh(boxGeo, hairMat);
      backHair.scale.set(0.64, 0.55, 0.14);
      backHair.position.set(0, -0.08, -0.26);
      this.head.add(backHair);

      const sideL = new THREE.Mesh(boxGeo, hairMat);
      sideL.scale.set(0.12, 0.45, 0.2);
      sideL.position.set(-0.28, -0.05, 0.05);
      this.head.add(sideL);

      const sideR = new THREE.Mesh(boxGeo, hairMat);
      sideR.scale.set(0.12, 0.45, 0.2);
      sideR.position.set(0.28, -0.05, 0.05);
      this.head.add(sideR);
    } else if (id === 'daughter1') {
      // 大女儿：高马尾与红色蝴蝶发夹
      const topHair = new THREE.Mesh(boxGeo, hairMat);
      topHair.scale.set(0.64, 0.2, 0.64);
      topHair.position.set(0, 0.22, 0);
      this.head.add(topHair);

      // 俏皮高马尾
      const ponytail = new THREE.Mesh(boxGeo, hairMat);
      ponytail.scale.set(0.24, 0.45, 0.24);
      ponytail.position.set(0, 0.18, -0.36);
      ponytail.rotation.x = -0.3;
      this.head.add(ponytail);

      const bow = new THREE.Mesh(boxGeo, new THREE.MeshLambertMaterial({ color: '#ff4757' }));
      bow.scale.set(0.3, 0.12, 0.12);
      bow.position.set(0, 0.32, -0.26);
      this.head.add(bow);
    } else {
      // 小女儿：呆萌双丸子头 + 黄色小蝴蝶结
      const topHair = new THREE.Mesh(boxGeo, hairMat);
      topHair.scale.set(0.64, 0.18, 0.64);
      topHair.position.set(0, 0.22, 0);
      this.head.add(topHair);

      // 左丸子
      const bunL = new THREE.Mesh(boxGeo, hairMat);
      bunL.scale.set(0.22, 0.22, 0.22);
      bunL.position.set(-0.28, 0.35, -0.05);
      this.head.add(bunL);

      // 右丸子
      const bunR = new THREE.Mesh(boxGeo, hairMat);
      bunR.scale.set(0.22, 0.22, 0.22);
      bunR.position.set(0.28, 0.35, -0.05);
      this.head.add(bunR);

      // 黄色蝴蝶结
      const bow = new THREE.Mesh(boxGeo, new THREE.MeshLambertMaterial({ color: '#f1c40f' }));
      bow.scale.set(0.2, 0.1, 0.1);
      bow.position.set(-0.24, 0.42, 0.05);
      this.head.add(bow);
    }

    this.head.position.set(0, 1.5 * this.scale, 0);
    this.body.add(this.head);

    // 3. 躯干 (Torso)
    const torsoMats = generateTorsoMaterials(id, colors);
    const torsoMesh = new THREE.Mesh(boxGeo, torsoMats);
    torsoMesh.scale.set(0.6, 0.75, 0.32);
    torsoMesh.position.set(0, 0.85 * this.scale, 0);
    torsoMesh.castShadow = true;
    this.body.add(torsoMesh);

    // 裙摆立体扩展 (女性角色)
    if (colors.isDress) {
      const skirt = new THREE.Mesh(boxGeo, new THREE.MeshLambertMaterial({ color: colors.pants }));
      skirt.scale.set(0.68, 0.32, 0.38);
      skirt.position.set(0, 0.58 * this.scale, 0);
      skirt.castShadow = true;
      this.body.add(skirt);
    }

    // 4. 双臂 (Sleeves + Hands)
    const armMats = generateArmMaterials(colors.shirt, colors.skin);

    this.leftArm = new THREE.Group();
    const lArmMesh = new THREE.Mesh(boxGeo, armMats);
    lArmMesh.scale.set(0.22, 0.75, 0.22);
    lArmMesh.position.set(0, -0.35, 0);
    lArmMesh.castShadow = true;
    this.leftArm.add(lArmMesh);
    this.leftArm.position.set(-0.42 * this.scale, 1.15 * this.scale, 0);
    this.body.add(this.leftArm);

    this.rightArm = new THREE.Group();
    const rArmMesh = new THREE.Mesh(boxGeo, armMats);
    rArmMesh.scale.set(0.22, 0.75, 0.22);
    rArmMesh.position.set(0, -0.35, 0);
    rArmMesh.castShadow = true;
    this.rightArm.add(rArmMesh);
    this.rightArm.position.set(0.42 * this.scale, 1.15 * this.scale, 0);
    this.body.add(this.rightArm);

    // 5. 双腿与鞋子 (Pants + Shoes)
    const shoeColor = id === 'dad' ? '#1e272e' : (id === 'mom' ? '#2f3542' : (id === 'daughter1' ? '#f5f6fa' : '#ff4757'));
    const legMats = generateLegMaterials(colors.pants, shoeColor);

    this.leftLeg = new THREE.Group();
    const lLegMesh = new THREE.Mesh(boxGeo, legMats);
    lLegMesh.scale.set(0.24, 0.75, 0.24);
    lLegMesh.position.set(0, -0.35, 0);
    lLegMesh.castShadow = true;
    this.leftLeg.add(lLegMesh);
    this.leftLeg.position.set(-0.16 * this.scale, 0.75 * this.scale, 0);
    this.body.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    const rLegMesh = new THREE.Mesh(boxGeo, legMats);
    rLegMesh.scale.set(0.24, 0.75, 0.24);
    rLegMesh.position.set(0, -0.35, 0);
    rLegMesh.castShadow = true;
    this.rightLeg.add(rLegMesh);
    this.rightLeg.position.set(0.16 * this.scale, 0.75 * this.scale, 0);
    this.body.add(this.rightLeg);

    // 6. 3D 头顶姓名标签 (Name Tag Sprite)
    this.createNameTag();

    // 缩放整体符合角色身形
    this.group.scale.set(this.scale, this.scale, this.scale);

    // 初始位置设置到生成点
    const sp = this.config.spawn || { x: 0, z: 0 };
    this.group.position.set(sp.x, 0.5, sp.z);

    // 交互点击绑定
    const uData = {
      targetKey: 'family_' + this.config.id,
      tooltipText: `👨‍👩‍👧‍👧 ${this.config.name} (${this.config.role}) · 点击对话`
    };
    this.group.userData = uData;
    this.group.traverse(child => {
      if (child.isMesh) {
        child.userData = uData;
      }
    });
  }

  // 渲染精致的 Minecraft 风格悬浮姓名标签
  createNameTag() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // 半透明深色圆角底框
    ctx.fillStyle = 'rgba(17, 24, 39, 0.75)';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(8, 8, 240, 48, 12);
    } else {
      ctx.rect(8, 8, 240, 48);
    }
    ctx.fill();

    // 外边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 文本
    ctx.font = 'bold 24px "Noto Sans SC", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.config.name, 128, 32);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    this.nameSprite = new THREE.Sprite(spriteMat);
    this.nameSprite.scale.set(1.4, 0.35, 1);
    this.nameSprite.position.set(0, 2.15, 0);
    this.head.add(this.nameSprite);
  }

  // 开始跳水动作
  startDive() {
    if (this.mode === 'dive') return;
    this.mode = 'dive';
    this.diveTime = 0;
    this.group.position.set(15, 1.5, 15.6);
    this.group.rotation.set(0, Math.PI, 0); // 朝向 -Z 泳池中心
  }

  // 动画步进 (行走、游泳或跳水)
  update(delta, time, isControlled) {
    // 1. 跳水模式驱动
    if (this.mode === 'dive') {
      this.diveTime += delta;
      if (this.diveTime < 0.45) {
        // 小跑走向跳水板边缘
        const t = this.diveTime / 0.45;
        this.group.position.z = 15.6 - t * 1.4; // 15.6 -> 14.2
        this.group.position.y = 1.45 + Math.abs(Math.sin(this.diveTime * 18)) * 0.08;
        this.leftLeg.rotation.x = Math.sin(this.diveTime * 16) * 0.7;
        this.rightLeg.rotation.x = -this.leftLeg.rotation.x;
      } else {
        // 高高腾空跃起，空中 360 度前空翻翻腾入水！
        const p = Math.min(1, (this.diveTime - 0.45) / 0.85);
        this.group.position.z = 14.2 - p * 4.5; // 飞跃至 z = 9.7 (泳池中心)
        this.group.position.y = 1.45 + Math.sin(p * Math.PI) * 2.5 - p * 1.25;
        this.group.rotation.x = -p * Math.PI * 2; // 360 度空中潇洒翻腾
        this.leftArm.rotation.x = -Math.PI;
        this.rightArm.rotation.x = -Math.PI;
        this.leftLeg.rotation.x = 0;
        this.rightLeg.rotation.x = 0;

        if (p >= 1) {
          this.mode = 'walk';
          this.inWater = true;
          this.group.rotation.x = 0;
          this.group.position.set(15, 0.2, 9.7);
          if (window.MCAudio) window.MCAudio.playSplash();
          bus.emit('fx:splash', this.group.position.clone());
          bus.emit('toast:show', {
            kicker: '🤿 完美入水！',
            title: '【跳水板高空翻腾 360 度】起跳轻盈，完美压住水花！裁判亮分：10分满分！'
          });
          bus.emit('fx:hearts');
        }
      }
      return;
    }

    // 2. 游泳模式驱动
    if (this.inWater) {
      // 泳姿平滑放平
      this.swimProgress = THREE.MathUtils.lerp(this.swimProgress, 1.0, 0.15);
      this.body.rotation.x = this.swimProgress * (Math.PI / 2 * 0.88);
      this.body.position.z = -0.55 * this.scale * this.swimProgress;
      this.body.position.y = -0.15 * this.scale * this.swimProgress;

      if (this.nameSprite) {
        this.nameSprite.position.y = 2.15 - 1.2 * this.swimProgress;
      }

      // 泳池水面波浪轻微浮动
      const targetY = 0.2 + Math.sin(time * 3) * 0.04;
      this.group.position.y += (targetY - this.group.position.y) * Math.min(1, delta * 10);

      if (this.isWalking) {
        // 自由泳持续循环划臂与打腿
        this.strokeCycle += delta * 7;
        this.leftArm.rotation.x = this.strokeCycle % (Math.PI * 2);
        this.rightArm.rotation.x = (this.strokeCycle + Math.PI) % (Math.PI * 2);
        this.leftArm.rotation.z = -0.15;
        this.rightArm.rotation.z = 0.15;
        const kick = Math.sin(this.strokeCycle * 2.4) * 0.45;
        this.leftLeg.rotation.x = kick;
        this.rightLeg.rotation.x = -kick;
        this.head.rotation.x = -0.55; // 抬头换气
      } else {
        // 水中轻柔踩水浮动
        this.strokeCycle += delta * 2;
        this.leftArm.rotation.x = Math.sin(this.strokeCycle) * 0.25;
        this.rightArm.rotation.x = -Math.sin(this.strokeCycle) * 0.25;
        const kick = Math.sin(this.strokeCycle * 1.5) * 0.2;
        this.leftLeg.rotation.x = kick;
        this.rightLeg.rotation.x = -kick;
        this.head.rotation.x = -0.3;
      }
    } else {
      // 3. 陆地正常行走、骑行单车与待机
      this.swimProgress = THREE.MathUtils.lerp(this.swimProgress, 0.0, 0.2);
      if (this.nameSprite) {
        this.nameSprite.position.y = 2.15;
      }

      if (this.isRidingBike) {
        // === 🚲 飞速单车骑行姿态 ===
        this.body.position.set(0, 0.12 * this.scale, -0.22 * this.scale);
        this.body.rotation.set(0.22, 0, 0); // 身体前倾破风
        this.head.rotation.set(-0.16, 0, 0); // 抬头注视前路

        // 双手自然前伸握紧车把
        this.leftArm.rotation.set(-0.85, 0.18, 0.05);
        this.rightArm.rotation.set(-0.85, -0.18, -0.05);

        if (this.isWalking) {
          // 踩踏脚踏板驱动单车飞驰
          this.bikePedalCycle = (this.bikePedalCycle || 0) + delta * 14;
          const pedal = Math.sin(this.bikePedalCycle) * 0.45;
          this.leftLeg.rotation.set(pedal - 0.25, 0, 0);
          this.rightLeg.rotation.set(-pedal - 0.25, 0, 0);
        } else {
          // 停下单车时单脚踏板、单脚微踏地
          this.leftLeg.rotation.set(-0.32, 0, 0);
          this.rightLeg.rotation.set(0.15, 0, 0);
        }
      } else {
        this.body.rotation.x = this.swimProgress * 1.35;
        this.body.position.z = -0.55 * this.scale * this.swimProgress;
        this.body.position.y = 0;

        if (this.isWalking) {
          this.petGestureTimer = 0;
          this.walkCycle += delta * 14;
          const angle = Math.sin(this.walkCycle) * 0.7;
          this.leftArm.rotation.set(angle, 0, 0);
          this.rightArm.rotation.set(-angle, 0, 0);
          this.leftLeg.rotation.set(-angle, 0, 0);
          this.rightLeg.rotation.set(angle, 0, 0);
          this.head.rotation.set(0, 0, 0);
        } else if (this.petGestureTimer > 0) {
          this.petGestureTimer -= delta;
          this.body.rotation.x = 0.22;
          this.rightArm.rotation.set(-1.25 + Math.sin(time * 8) * 0.12, 0, -0.22);
          this.leftArm.rotation.set(0.2, 0, 0);
          this.head.rotation.set(0.32, 0, 0);
          this.leftLeg.rotation.set(0, 0, 0);
          this.rightLeg.rotation.set(0, 0, 0);
        } else {
          this.body.rotation.set(0, 0, 0);
          this.leftArm.rotation.set(Math.sin(time * 2.5 + this.scale) * 0.08, 0, 0);
          this.rightArm.rotation.set(-Math.sin(time * 2.5 + this.scale) * 0.08, 0, 0);
          this.leftLeg.rotation.set(0, 0, 0);
          this.rightLeg.rotation.set(0, 0, 0);
          this.head.rotation.set(0, 0, 0);

          if (!isControlled) {
            this.head.rotation.y = Math.sin(time * 1.2 + this.scale * 3) * 0.22;
          }
        }
      }
    }
  }

  setWalking(walking) {
    this.isWalking = walking;
    if (!walking) {
      this.walkCycle = 0;
    }
  }
}
