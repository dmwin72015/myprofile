/**
 * ==============================================================================
 * main.js - Master Bootstrap & Application Entry Point
 * ==============================================================================
 */

import { WorldScene } from './world/WorldScene.js';
import { HUDController } from './ui/HUD.js';
import { FamilySwitcher } from './ui/FamilySwitcher.js';
import { PanelManager } from './ui/PanelManager.js';
import { EditorModal } from './ui/EditorModal.js';
import { bus } from './core/EventBus.js';
import { state } from './core/State.js';

class Application {
  constructor() {
    this.worldScene = null;
    this.hud = null;
    this.familySwitcher = null;
    this.panelManager = null;
    this.editorModal = null;
    this.bus = bus;

    this.init();
  }

  init() {
    this.simulateLoading();

    this.worldScene = new WorldScene('canvas3d');
    this.hud = new HUDController();
    this.familySwitcher = new FamilySwitcher('familyDock');
    this.panelManager = new PanelManager();
    this.editorModal = new EditorModal();
  }

  simulateLoading() {
    const loadbar = document.querySelector('#loadbar i');
    const loadtxt = document.getElementById('loadtxt');
    const enterBtn = document.getElementById('enter');
    const splashEl = document.getElementById('splash');

    const splashes = state.config.splashes || ["充满爱与欢笑的四口之家！"];
    if (splashEl) {
      splashEl.textContent = splashes[Math.floor(Math.random() * splashes.length)];
    }

    let p = 0;
    const timer = setInterval(() => {
      p += Math.random() * 25 + 12;
      if (p >= 100) {
        p = 100;
        clearInterval(timer);
        if (loadtxt) loadtxt.textContent = '方块世界生成完毕！';
        if (enterBtn) {
          enterBtn.style.display = 'inline-flex';
          enterBtn.onclick = () => {
            if (window.MCAudio) {
              window.MCAudio.ensureContext();
              window.MCAudio.playLevelUp();
            }
            document.getElementById('loading').classList.add('hide');
            bus.emit('banner:show', {
              title: '🏡 温馨四口之家 · 方块小屋',
              sub: '按 WASD 或点击地面漫游 · 点击家庭成员卡片切换角色'
            });
            setTimeout(() => {
              bus.emit('toast:show', { kicker: '🏆 达成进度！', title: '【欢迎光临】四口之家的温馨方块小屋！' });
            }, 1000);
          };
        }
      }
      if (loadbar) loadbar.style.width = p + '%';
    }, 110);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new Application();
});
