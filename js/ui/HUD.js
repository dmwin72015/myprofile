/**
 * ==============================================================================
 * HUD - Minecraft Game HUD & Overlay Controller
 * ==============================================================================
 */

import { state } from '../core/State.js';
import { bus } from '../core/EventBus.js';

export class HUDController {
  constructor() {
    this.activeHotbarSlot = 0;
    this.init();
  }

  init() {
    this.renderStats();
    this.renderHotbar();
    this.bindButtons();
    this.bindChat();

    // 监听事件
    bus.on('banner:show', ({ title, sub }) => this.showTitleBanner(title, sub));
    bus.on('toast:show', ({ kicker, title }) => this.showToast(kicker, title));
    bus.on('world:daynight', (isNight) => {
      const bDay = document.getElementById('bDay');
      if (bDay) bDay.textContent = isNight ? '☀️' : '🌙';
    });
    bus.on('stats:update', ({ hearts }) => {
      const heartsEl = document.getElementById('hearts');
      if (heartsEl && typeof hearts === 'number') {
        heartsEl.innerHTML = Array(hearts).fill('<span>❤️</span>').join('');
      }
    });
    bus.on('stats:xp', () => {
      const lv = document.getElementById('xplv');
      if (lv) lv.textContent = parseInt(lv.textContent, 10) + 1;
    });
    bus.on('config:updated', () => {
      this.renderHotbar();
    });
  }

  renderStats() {
    const hearts = document.getElementById('hearts');
    if (hearts) {
      hearts.innerHTML = Array(10).fill('<span>❤️</span>').join('');
      hearts.onclick = () => {
        if (window.MCAudio) window.MCAudio.playHurt();
        hearts.style.transform = 'scale(0.85)';
        setTimeout(() => {
          hearts.style.transform = '';
          if (window.MCAudio) window.MCAudio.playOrb();
        }, 300);
      };
    }

    const mugs = document.getElementById('coffeeMugs');
    if (mugs) {
      mugs.innerHTML = Array(10).fill('<span>☕</span>').join('');
      mugs.onclick = () => {
        if (window.MCAudio) window.MCAudio.playEat();
      };
    }

    const xp = document.getElementById('xp');
    if (xp) {
      xp.onclick = () => {
        if (window.MCAudio) window.MCAudio.playLevelUp();
        const lv = document.getElementById('xplv');
        if (lv) lv.textContent = parseInt(lv.textContent, 10) + 1;
      };
    }
  }

  renderHotbar() {
    const hotbarEl = document.getElementById('hotbar');
    if (!hotbarEl) return;

    hotbarEl.innerHTML = state.config.hotbar.map((item, idx) => `
      <div class="hotbar-slot ${idx === this.activeHotbarSlot ? 'active' : ''}" data-idx="${idx}" data-target="${item.target}" title="${item.name}: ${item.hint}">
        <span class="num">${idx + 1}</span>
        <span>${item.icon}</span>
      </div>
    `).join('');

    hotbarEl.querySelectorAll('.hotbar-slot').forEach(slot => {
      slot.onclick = () => {
        const idx = parseInt(slot.dataset.idx, 10);
        this.selectHotbar(idx);
      };
    });
  }

  selectHotbar(idx) {
    if (idx < 0 || idx >= state.config.hotbar.length) return;
    this.activeHotbarSlot = idx;
    if (window.MCAudio) window.MCAudio.playPop();

    document.querySelectorAll('.hotbar-slot').forEach((s, i) => {
      s.classList.toggle('active', i === idx);
    });

    const item = state.config.hotbar[idx];
    if (item && item.target) {
      bus.emit('interact:trigger', item.target);
    }
  }

  bindButtons() {
    const bDay = document.getElementById('bDay');
    if (bDay) {
      bDay.onclick = () => {
        if (window.MCAudio) window.MCAudio.playClick();
        const isNight = state.toggleDayNight();
        bDay.textContent = isNight ? '☀️' : '🌙';
        this.showToast('🌟 天气环境', isNight ? '已切换至月夜星空' : '已切换至明媚白昼');
      };
    }

    const bRoof = document.getElementById('bRoof');
    if (bRoof) {
      bRoof.onclick = () => {
        if (window.MCAudio) window.MCAudio.playChest();
        const show = state.toggleRoof();
        bRoof.textContent = show ? '🏠' : '🛖';
        this.showToast('🛖 视角控制', show ? '已盖上屋顶' : '已掀开屋顶查看室内全景');
      };
    }

    const bSound = document.getElementById('bSound');
    if (bSound) {
      bSound.onclick = () => {
        const enabled = state.toggleSfx();
        bSound.textContent = enabled ? '🔊' : '🔇';
      };
    }

    const bPets = document.getElementById('bPets');
    if (bPets) bPets.onclick = () => bus.emit('interact:trigger', 'pet_menu');

    const bBike = document.getElementById('bBike');
    if (bBike) bBike.onclick = () => bus.emit('player:bicycle:toggle');

    const bAch = document.getElementById('bAch');
    if (bAch) bAch.onclick = () => bus.emit('interact:trigger', 'advancements');

    const bEditor = document.getElementById('bEditor');
    if (bEditor) bEditor.onclick = () => bus.emit('interact:trigger', 'editor');

    const bHelp = document.getElementById('bHelp');
    if (bHelp) bHelp.onclick = () => bus.emit('interact:trigger', 'help');

    // 快捷键 P (萌宠互动) 与 B (单车骑行切换)
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.code === 'KeyP') {
        bus.emit('interact:trigger', 'pet_menu');
      } else if (e.code === 'KeyB') {
        bus.emit('player:bicycle:toggle');
      }
    });
  }

  bindChat() {
    const bChat = document.getElementById('bChat');
    const chatInput = document.getElementById('chatInput');
    const chatBox = document.getElementById('chatBox');
    if (!bChat || !chatInput || !chatBox) return;

    bChat.onclick = () => {
      chatInput.classList.toggle('active');
      if (chatInput.classList.contains('active')) chatBox.focus();
    };

    chatBox.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const val = chatBox.value.trim();
        if (val) this.handleChat(val);
        chatBox.value = '';
        chatInput.classList.remove('active');
      }
    };
  }

  handleChat(text) {
    const chat = document.getElementById('chat');
    const addMsg = (cls, msg) => {
      const line = document.createElement('div');
      line.className = `chat-line ${cls}`;
      line.textContent = msg;
      chat.appendChild(line);
      chat.scrollTop = chat.scrollHeight;
    };

    const activeMember = state.getActiveMember();
    addMsg('user', `<${activeMember.name}> ${text}`);

    if (text.startsWith('/')) {
      const parts = text.slice(1).split(' ');
      const cmd = parts[0].toLowerCase();
      if (cmd === 'help') {
        addMsg('sys', '指令帮助: /switch <dad|mom|daughter1|daughter2>, /bike, /pet [summon|dog|puppy|cat], /time set <day|night>, /roof, /tp <computer|chest|arcade|coffee>, /clear');
      } else if (cmd === 'bike') {
        bus.emit('player:bicycle:toggle');
      } else if (cmd === 'pet') {
        if (parts[1] === 'summon') {
          bus.emit('pet:summon', { petId: 'all' });
        } else {
          bus.emit('interact:trigger', 'pet_menu');
        }
      } else if (cmd === 'switch' && parts[1]) {
        state.setActiveMember(parts[1]);
        addMsg('sys', `已切换控制角色为: ${parts[1]}`);
      } else if (cmd === 'time') {
        const bDay = document.getElementById('bDay');
        if (bDay) bDay.click();
      } else if (cmd === 'roof') {
        const bRoof = document.getElementById('bRoof');
        if (bRoof) bRoof.click();
      } else if (cmd === 'tp' && parts[1]) {
        bus.emit('interact:trigger', parts[1]);
      } else if (cmd === 'clear') {
        chat.innerHTML = '';
      } else {
        addMsg('sys', `未知指令: /${cmd}，请输入 /help`);
      }
    } else {
      setTimeout(() => {
        addMsg('sys', `[系统] 欢迎来到温馨的四口方块之家！`);
        if (window.MCAudio) window.MCAudio.playOrb();
      }, 500);
    }
  }

  showTitleBanner(title, sub) {
    const banner = document.getElementById('title');
    if (!banner) return;
    banner.querySelector('.t').textContent = title;
    banner.querySelector('.s').textContent = sub;
    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 3200);
  }

  showToast(kicker, title) {
    const toasts = document.getElementById('toasts');
    if (!toasts) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="icon">🏆</div>
      <div>
        <div class="kicker">${kicker}</div>
        <div class="title">${title}</div>
      </div>
    `;
    toasts.appendChild(toast);
    if (window.MCAudio) window.MCAudio.playAchievement();
    setTimeout(() => toast.remove(), 4200);
  }
}
