/**
 * ==============================================================================
 * Textures - Procedural 16x16 Pixel Texture Generator
 * ==============================================================================
 */

import * as THREE from 'three';

export function createProceduralTextures() {
  const T = {};

  const makeTex = (drawFn) => {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 16;
    const ctx = c.getContext('2d');
    drawFn(ctx);
    const texture = new THREE.CanvasTexture(c);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // 草地顶部与泥土
  T.grassTop = makeTex(ctx => {
    ctx.fillStyle = '#5c8e32';
    ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#6da63b' : '#4e7a2b';
      ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
    }
  });

  // 无限广袤草地专用无缝重复纹理 (每格 1x1 严格对齐像素网格)
  const infiniteCanvas = document.createElement('canvas');
  infiniteCanvas.width = 16;
  infiniteCanvas.height = 16;
  const ictx = infiniteCanvas.getContext('2d');
  ictx.fillStyle = '#5c8e32';
  ictx.fillRect(0, 0, 16, 16);
  for (let i = 0; i < 40; i++) {
    ictx.fillStyle = Math.random() > 0.5 ? '#6da63b' : '#4e7a2b';
    ictx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
  }
  const infiniteGrassTex = new THREE.CanvasTexture(infiniteCanvas);
  infiniteGrassTex.magFilter = THREE.NearestFilter;
  infiniteGrassTex.minFilter = THREE.NearestFilter;
  infiniteGrassTex.wrapS = THREE.RepeatWrapping;
  infiniteGrassTex.wrapT = THREE.RepeatWrapping;
  infiniteGrassTex.repeat.set(600, 600);
  infiniteGrassTex.colorSpace = THREE.SRGBColorSpace;
  T.infiniteGrass = infiniteGrassTex;

  T.dirt = makeTex(ctx => {
    ctx.fillStyle = '#866043';
    ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#9c704e' : '#6b4c35';
      ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
    }
  });

  T.grassSide = makeTex(ctx => {
    ctx.fillStyle = '#866043';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#5c8e32';
    ctx.fillRect(0, 0, 16, 3);
    for (let x = 0; x < 16; x++) {
      const h = 3 + Math.floor(Math.random() * 3);
      ctx.fillRect(x, 0, 1, h);
    }
  });

  // 鹅卵石小径
  T.cobble = makeTex(ctx => {
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#949494' : '#575757';
      ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 2, 2);
    }
  });

  // 橡木木板
  T.planks = makeTex(ctx => {
    ctx.fillStyle = '#b88b4a';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#63471f';
    for (let y = 0; y < 16; y += 4) ctx.fillRect(0, y, 16, 1);
    ctx.fillRect(4, 0, 1, 4);
    ctx.fillRect(12, 4, 1, 4);
    ctx.fillRect(6, 8, 1, 4);
    ctx.fillRect(14, 12, 1, 4);
  });

  // 深色木料
  T.darkPlanks = makeTex(ctx => {
    ctx.fillStyle = '#5c3e21';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#3a2614';
    for (let y = 0; y < 16; y += 4) ctx.fillRect(0, y, 16, 1);
  });

  // 白桦木地板 (室内)
  T.birch = makeTex(ctx => {
    ctx.fillStyle = '#d5c496';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#b09f75';
    for (let y = 0; y < 16; y += 4) ctx.fillRect(0, y, 16, 1);
  });

  // 树木原木 (温暖明亮的经典橡木纹理)
  T.logSide = makeTex(ctx => {
    ctx.fillStyle = '#8f653a';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#75502c';
    for (let x = 0; x < 16; x += 3) ctx.fillRect(x, 0, 1, 16);
    ctx.fillStyle = '#a87948';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 2);
    }
  });

  // 树叶 (鲜艳明亮、充满生机的初春翠绿)
  T.leaves = makeTex(ctx => {
    ctx.fillStyle = '#5eb834';
    ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 60; i++) {
      const r = Math.random();
      ctx.fillStyle = r > 0.6 ? '#78d948' : (r > 0.3 ? '#8eed56' : '#4ca426');
      ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
    }
  });

  // 树篱 (鲜活饱满的灌木绿篱)
  T.hedge = makeTex(ctx => {
    ctx.fillStyle = '#4fae26';
    ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 70; i++) {
      const r = Math.random();
      ctx.fillStyle = r > 0.6 ? '#66c434' : (r > 0.3 ? '#79d744' : '#3d941c');
      ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
    }
  });

  // 石英 / 泳池白边
  T.quartz = makeTex(ctx => {
    ctx.fillStyle = '#e8eaed';
    ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = '#d2d6dc';
    ctx.strokeRect(0, 0, 16, 16);
    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
    }
  });

  // 泳池内壁瓷砖
  T.poolTile = makeTex(ctx => {
    ctx.fillStyle = '#1982c4';
    ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = '#42a5f5';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 8, 8);
    ctx.strokeRect(8, 0, 8, 8);
    ctx.strokeRect(0, 8, 8, 8);
    ctx.strokeRect(8, 8, 8, 8);
  });

  // 耕地 / 菜地
  T.farmland = makeTex(ctx => {
    ctx.fillStyle = '#5c3e21';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#422c17';
    for (let y = 0; y < 16; y += 3) {
      ctx.fillRect(0, y, 16, 1);
    }
  });

  // 平整压实的小径
  T.path = makeTex(ctx => {
    ctx.fillStyle = '#a89369';
    ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#b8a379' : '#9b8458';
      ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 2, 2);
    }
  });

  // 动态水面纹理
  T.water = makeTex(ctx => {
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(0, 2, 16, 3);
    ctx.fillRect(0, 10, 16, 3);
    ctx.fillStyle = '#5dade2';
    for (let i = 0; i < 12; i++) {
      ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 2, 1);
    }
  });

  // 屋顶红砖
  T.roof = makeTex(ctx => {
    ctx.fillStyle = '#9c3e2d';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#5e2318';
    for (let y = 0; y < 16; y += 4) ctx.fillRect(0, y, 16, 1);
    ctx.fillRect(4, 0, 1, 4);
    ctx.fillRect(12, 4, 1, 4);
  });

  // 书架
  T.bookshelf = makeTex(ctx => {
    ctx.fillStyle = '#b88b4a';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#22150a';
    ctx.fillRect(1, 2, 14, 5);
    ctx.fillRect(1, 9, 14, 5);
    const colors = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#ecf0f1'];
    for (let x = 2; x < 14; x += 2) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(x, 2, 2, 5);
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(x, 9, 2, 5);
    }
  });

  // 玩具箱 / 宝箱面
  T.toyBox = makeTex(ctx => {
    ctx.fillStyle = '#f6b93b';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#e55039';
    ctx.strokeRect(1, 1, 14, 14);
    ctx.fillStyle = '#fff';
    ctx.fillRect(7, 7, 2, 2);
  });

  return T;
}
