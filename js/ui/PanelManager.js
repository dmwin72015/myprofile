/**
 * ==============================================================================
 * PanelManager - Minecraft GUI Modal Dialog Manager
 * ==============================================================================
 */

import { state } from '../core/State.js';
import { bus } from '../core/EventBus.js';
import { SnakeGame } from '../minigames/SnakeGame.js';

export class PanelManager {
  constructor() {
    this.overlay = document.getElementById('panelOverlay');
    this.panel = document.getElementById('panel');
    this.snakeGame = null;
    this.diaryIndex = 0;

    this.init();
  }

  init() {
    bus.on('interact:trigger', (targetKey) => {
      this.openTargetPanel(targetKey);
    });

    if (this.overlay) {
      this.overlay.onclick = (e) => {
        if (e.target === this.overlay) this.close();
      };
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  open(title, htmlContent, onMounted = null) {
    if (window.MCAudio) window.MCAudio.playChest();
    if (!this.panel || !this.overlay) return;

    this.panel.innerHTML = `
      <div class="panel-header">
        <span>${title}</span>
        <button class="btn sm" id="btnCloseModal">✖</button>
      </div>
      <div class="panel-body">
        ${htmlContent}
      </div>
    `;

    this.overlay.classList.add('show');
    this.panel.querySelector('#btnCloseModal').onclick = () => this.close();

    if (onMounted) onMounted(this.panel);
  }

  close() {
    if (this.overlay) this.overlay.classList.remove('show');
    if (this.snakeGame) {
      this.snakeGame.destroy();
      this.snakeGame = null;
    }
  }

  openTargetPanel(targetKey) {
    if (targetKey && targetKey.startsWith('family_')) {
      const memberId = targetKey.replace('family_', '');
      this.openFamilyDialogue(memberId);
      return;
    }

    switch (targetKey) {
      case 'bed_sleep':
        this.sleepInBed();
        break;
      case 'rubber_duck':
        this.openRubberDuck();
        break;
      case 'whiteboard':
        this.openWhiteboard();
        break;
      case 'fridge':
        this.openFridge();
        break;
      case 'diving_board':
        bus.emit('player:dive');
        break;
      case 'jukebox':
        this.toggleJukebox();
        break;
      case 'bicycle':
        this.rideBicycle();
        break;
      case 'swing':
        this.rideSwing();
        break;
      case 'flower_smell':
        this.smellFlowers();
        break;
      case 'sofa_rest':
        this.restOnSofa();
        break;
      case 'table_cake':
        if (window.MCAudio) window.MCAudio.playEat();
        state.hearts = 10;
        bus.emit('stats:update', { hearts: 10 });
        bus.emit('fx:hearts');
        bus.emit('toast:show', {
          kicker: '🎂 幸福家庭聚餐',
          title: '【品尝草莓蛋糕】尝了一大口妈妈亲手烘焙的草莓蛋糕！软糯香甜，爱心体力全部回满！'
        });
        break;
      case 'profile':
        this.openProfile();
        break;
      case 'computer':
        this.openComputer();
        break;
      case 'chest':
        this.openChest();
        break;
      case 'skills':
        this.openSkills();
        break;
      case 'arcade':
        this.openArcade();
        break;
      case 'coffee':
        this.openCoffee();
        break;
      case 'diary':
        this.openDiary();
        break;
      case 'advancements':
        this.openAdvancements();
        break;
      case 'mailbox':
        this.openMailbox();
        break;
      case 'family_photo':
        this.openFamilyPhoto();
        break;
      case 'toy_box':
        this.openToyBox();
        break;
      case 'pet_menu':
        this.openPetsHub();
        break;
      case 'pet_cat':
        this.openPetQuickMenu('cat');
        break;
      case 'pet_dog':
        this.openPetQuickMenu('dog');
        break;
      case 'pet_puppy':
        this.openPetQuickMenu('puppy');
        break;
      case 'dog_villa':
        bus.emit('toast:show', { kicker: '🏡 萌犬豪华木屋', title: '【杰斯 & 旺财的家】铺着软绵绵的红羊毛地毯，门前碗里摆满了香喷喷的狗粮与多汁大骨头！' });
        break;
      case 'garden_bench':
        bus.emit('toast:show', { kicker: '🪑 田园紫藤长椅', title: '【坐下小憩】坐在紫藤花架下的白色木椅上，微风拂面，馥郁的花香让人陶醉神清气爽！' });
        bus.emit('fx:hearts');
        break;
      case 'garden_fountain':
        bus.emit('toast:show', { kicker: '⛲ 庭院水景喷泉', title: '【叮咚泉水】清澈的泉水在石质水盆中欢快流淌，水珠在微风中泛出七彩虹光！' });
        break;
      case 'slide_play':
        if (window.MCAudio) window.MCAudio.playClick();
        bus.emit('toast:show', { kicker: '🌈 彩虹儿童滑滑梯', title: '【咻——！】从滑梯高处顺滑而下，草地上传来两姐妹清脆无忧的银铃般笑声！' });
        bus.emit('fx:hearts');
        break;
      case 'bbq_grill':
        if (window.MCAudio) window.MCAudio.playEat();
        state.hearts = Math.min(10, (state.hearts || 10) + 1);
        bus.emit('stats:update', { hearts: state.hearts });
        bus.emit('fx:hearts');
        bus.emit('toast:show', { kicker: '🥩 美式庭院烤肉架', title: '【滋滋作响的黑椒肉串】刚出炉的炭烤肉串外焦里嫩、肉香扑鼻，爱心体力 +1！' });
        break;
      case 'editor':
        bus.emit('editor:open');
        break;
      case 'help':
        this.openHelp();
        break;
    }
  }

  // 1. 🪪 家庭成员档案
  openProfile() {
    const member = state.getActiveMember();
    const family = state.config.family;
    const html = `
      <div class="sub">家庭成员档案 · FAMILY PROFILE</div>
      <div class="prof-layout">
        <div class="prof-frame">
          <img src="${member.photo}" alt="${member.name}" />
        </div>
        <div class="prof-info">
          <h2>${member.name} <span style="color:#7cdb04; font-size:18px;">Lv.99</span></h2>
          <div style="font-size:13px; color:#555; margin-bottom:8px;">${member.title} · ${member.role}</div>
          <div style="background:rgba(255,255,255,0.6); padding:8px; border-left:3px solid #7cdb04; font-style:italic; font-size:13px; margin-bottom:12px;">
            ${member.quote}
          </div>
          ${member.bio.map(b => `<p style="margin-bottom:8px; font-size:14px; text-indent:2em;">${b}</p>`).join('')}
        </div>
      </div>

      <div style="margin-top:16px; padding-top:12px; border-top:1px dashed #999;">
        <div style="font-weight:700; font-size:13px; margin-bottom:8px;">快速切换查看其他家人档案：</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          ${Object.keys(family).map(id => {
            const m = family[id];
            const isCur = id === member.id;
            return `<button class="btn sm ${isCur ? 'green' : ''}" data-mid="${id}">${m.name}</button>`;
          }).join('')}
        </div>
      </div>

      <div style="margin-top:16px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:12px; color:#666;">常驻位置: ${member.spawn.label}</span>
        <button class="btn green sm" id="btnEditProfile">⚙️ 修改此成员资料/头像</button>
      </div>
    `;

    this.open(`🪪 ${member.name} 的档案`, html, (panel) => {
      panel.querySelectorAll('button[data-mid]').forEach(btn => {
        btn.onclick = () => {
          state.setActiveMember(btn.dataset.mid);
          this.openProfile();
        };
      });
      panel.querySelector('#btnEditProfile').onclick = () => {
        this.close();
        bus.emit('editor:open', member.id);
      };
    });
  }

  // 2. 💻 爸爸的工作电脑
  openComputer() {
    const dad = state.config.family.dad;
    const html = `
      <h2>💻 爸爸的全栈红石工作台</h2>
      <div class="sub">~/workspace/crafter · zsh</div>
      <div style="background:#111318; border:2px solid #000; padding:12px; color:#55ff55; font-family:monospace; font-size:13px; height:180px; overflow-y:auto; line-height:1.6;">
        <div>$ whoami</div>
        <div style="color:#fff;">${dad.name} (${dad.title})</div>
        <div style="margin-top:6px;">$ family-status --all</div>
        <div style="color:#00ffff;">✔ 爸爸: 架构搭建中 | ✔ 妈妈: 咖啡煮沸中 | ✔ 姐妹俩: 游戏玩耍中</div>
        <div>$ git status</div>
        <div style="color:#ffff55;">On branch happy-family · Working tree clean!</div>
      </div>
      <div style="margin-top:14px; display:flex; gap:10px; justify-content:flex-end;">
        <a class="btn green sm" href="${state.config.contact.github}" target="_blank" rel="noopener">🐙 打开 GitHub 主页</a>
        <button class="btn sm" onclick="window.app.hud.selectHotbar(2)">📦 看看作品宝箱</button>
      </div>
    `;
    this.open('💻 爸爸的工作电脑', html);
  }

  // 3. 📦 作品宝箱
  openChest() {
    const renderCards = (filter = '全部') => {
      const list = filter === '全部' ? state.config.projects : state.config.projects.filter(p => p.tag === filter);
      return list.map(item => `
        <div class="proj-card">
          <div class="top">
            <span class="icon-box">${item.icon}</span>
            <div>
              <div class="name">${item.name}</div>
              <span class="chip" style="font-size:10px; padding:1px 6px;">${item.tag}</span>
            </div>
          </div>
          <div class="desc">${item.desc}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; font-size:11px; color:#666;">
            <span>${item.stats || ''}</span>
            <a class="btn green sm" href="${item.url}" target="_blank" rel="noopener">打开预览</a>
          </div>
        </div>
      `).join('');
    };

    const tags = ['全部', '全栈', '工具', '创意', '架构', 'AI', '游戏'];
    const html = `
      <h2>📦 精选作品宝箱</h2>
      <div class="sub">独立开发与开源项目展柜</div>
      <div class="chips" id="projChips">
        ${tags.map(t => `<span class="chip ${t === '全部' ? 'on' : ''}" data-tag="${t}">${t}</span>`).join('')}
      </div>
      <div class="proj-grid" id="projGrid">
        ${renderCards('全部')}
      </div>
    `;

    this.open('📦 精选作品宝箱', html, (panel) => {
      panel.querySelectorAll('#projChips .chip').forEach(chip => {
        chip.onclick = () => {
          if (window.MCAudio) window.MCAudio.playPop();
          panel.querySelectorAll('#projChips .chip').forEach(c => c.classList.remove('on'));
          chip.classList.add('on');
          panel.querySelector('#projGrid').innerHTML = renderCards(chip.dataset.tag);
        };
      });
    });
  }

  // 4. 📚 技能书架
  openSkills() {
    const html = `
      <h2>📚 附魔技能书架</h2>
      <div class="sub">全栈架构核心技术栈与附魔熟练度</div>
      <div style="margin-top:12px;">
        ${state.config.skills.map(s => `
          <div class="skill-row">
            <div class="skill-meta">
              <span>${s.icon} ${s.name}</span>
              <span style="color:#4a8024;">${s.level}%</span>
            </div>
            <div class="skill-track">
              <div class="skill-fill" style="width:${s.level}%;"></div>
            </div>
            <div style="font-size:12px; color:#555; margin-top:2px;">${s.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
    this.open('📚 附魔技能书架', html);
  }

  // 5. 🕹️ 街机工坊
  openArcade() {
    const html = `
      <h2>🕹️ 复古街机 · 贪吃蛇大作战</h2>
      <div class="sub">大女儿小悦悦常玩的高分小游戏 · 使用键盘方向键 ↑ ↓ ← → 控制</div>
      <div class="arcade-container">
        <div class="arcade-hud">
          <span>得分: <span id="snakeScore" style="color:#7cdb04;">0</span></span>
          <span>大女儿最高分: <span id="snakeBest" style="color:#ffd700;">260</span></span>
        </div>
        <canvas id="snakeCanvas" width="320" height="240"></canvas>
        <button class="btn green sm" id="btnRestartSnake">▶ 重新开始</button>
      </div>
    `;

    this.open('🕹️ 街机工坊', html, (panel) => {
      this.snakeGame = new SnakeGame(panel.querySelector('#snakeCanvas'), panel.querySelector('#snakeScore'), panel.querySelector('#btnRestartSnake'));
    });
  }

  // 6. ☕ 妈妈的咖啡吧
  openCoffee() {
    const html = `
      <h2>☕ 妈妈的花园咖啡休闲吧</h2>
      <div class="sub">生活美学与全家人的能量源泉</div>
      <div style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
        ${state.config.coffee.map(c => `
          <div style="background:#dedede; padding:12px; border:2px solid #fff; border-right-color:#555; border-bottom-color:#555; display:flex; gap:12px; align-items:center;">
            <div style="width:36px; height:36px; background:${c.color}; border:2px solid #000; border-radius:50%; flex-shrink:0;"></div>
            <div>
              <div style="font-weight:700; font-size:15px; color:#222;">${c.name}</div>
              <div style="font-size:12px; color:#555; margin-top:2px;">${c.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    this.open('☕ 妈妈的花园咖啡吧', html);
  }

  // 7. 📖 家族日记
  openDiary() {
    const diary = state.config.diary;
    const render = (idx) => {
      const p = diary[idx];
      return `
        <h2>📖 温馨家族日记</h2>
        <div class="sub">方块小屋的生活记忆与随笔</div>
        <div class="book-view">
          <h3 style="font-size:18px; color:#3f2711; margin-bottom:4px;">${p.title}</h3>
          <div style="font-size:11px; color:#8c735c; margin-bottom:12px;">记录时间：${p.date}</div>
          <p style="line-height:1.8; font-size:14px; text-indent:2em;">${p.content}</p>
        </div>
        <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center;">
          <button class="btn sm" id="btnPrevD" ${idx === 0 ? 'disabled style="opacity:0.5;"' : ''}>◀ 上一篇</button>
          <span style="font-size:12px; color:#666;">第 ${idx + 1} / ${diary.length} 篇</span>
          <button class="btn sm" id="btnNextD" ${idx === diary.length - 1 ? 'disabled style="opacity:0.5;"' : ''}>下一篇 ▶</button>
        </div>
      `;
    };

    this.open('📖 家族日记', render(this.diaryIndex), (panel) => {
      const bind = () => {
        const prev = panel.querySelector('#btnPrevD');
        const next = panel.querySelector('#btnNextD');
        if (prev) {
          prev.onclick = () => {
            if (this.diaryIndex > 0) {
              this.diaryIndex--;
              if (window.MCAudio) window.MCAudio.playPage();
              panel.querySelector('.panel-body').innerHTML = render(this.diaryIndex);
              bind();
            }
          };
        }
        if (next) {
          next.onclick = () => {
            if (this.diaryIndex < diary.length - 1) {
              this.diaryIndex++;
              if (window.MCAudio) window.MCAudio.playPage();
              panel.querySelector('.panel-body').innerHTML = render(this.diaryIndex);
              bind();
            }
          };
        }
      };
      bind();
    });
  }

  // 8. 🏆 冒险进度
  openAdvancements() {
    const list = state.config.advancements;
    const html = `
      <h2>🏆 幸福成长进度</h2>
      <div class="sub">家庭与事业的每一步坚实足迹</div>
      <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
        ${list.map(a => `
          <div style="display:flex; align-items:center; gap:12px; padding:10px; background:#dedede; border:2px solid #fff; border-right-color:#555; border-bottom-color:#555;">
            <div style="font-size:24px;">${a.unlocked ? '🏆' : '🔒'}</div>
            <div style="flex:1;">
              <div style="font-weight:700; color:#222;">${a.title}</div>
              <div style="font-size:12px; color:#555;">${a.desc}</div>
            </div>
            <span class="chip ${a.unlocked ? 'on' : ''}" style="font-size:11px;">${a.unlocked ? '已达成' : '未解锁'}</span>
          </div>
        `).join('')}
      </div>
    `;
    this.open('🏆 幸福成长进度', html);
  }

  // 9. ✉️ 末影信箱
  openMailbox() {
    const c = state.config.contact;
    const html = `
      <h2>✉️ 末影信箱 · 联系我们</h2>
      <div class="sub">随时欢迎技术交流、项目探讨或来方块小屋做客！</div>
      <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
        <a class="btn" href="mailto:${c.email}" target="_blank" style="justify-content:flex-start;">
          <span>📮 末影邮箱:</span> <span style="color:#ffff55;">${c.email}</span>
        </a>
        <a class="btn" href="${c.github}" target="_blank" style="justify-content:flex-start;">
          <span>💻 GitHub:</span> <span style="color:#55ffff;">${c.github}</span>
        </a>
        <a class="btn" href="${c.bilibili}" target="_blank" style="justify-content:flex-start;">
          <span>📺 Bilibili:</span> <span style="color:#ff88aa;">${c.bilibili}</span>
        </a>
        <a class="btn" href="${c.blog}" target="_blank" style="justify-content:flex-start;">
          <span>📖 博客主页:</span> <span style="color:#80ff20;">${c.blog}</span>
        </a>
      </div>
    `;
    this.open('✉️ 末影信箱', html);
  }

  // 10. 🖼️ 全家福相框
  openFamilyPhoto() {
    const family = state.config.family;
    const html = `
      <h2>🖼️ 四口之家全家福</h2>
      <div class="sub">方块小屋最珍贵的存在 · 爸爸、妈妈与两位天使女儿</div>
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-top:12px;">
        ${Object.keys(family).map(id => {
          const m = family[id];
          return `
            <div style="background:#fff; border:2px solid #000; padding:10px; text-align:center;">
              <img src="${m.photo}" style="width:64px; height:64px; object-fit:cover; image-rendering:pixelated; margin-bottom:6px;" />
              <div style="font-weight:700; font-size:14px; color:#222;">${m.name}</div>
              <div style="font-size:11px; color:#666;">${m.role}</div>
            </div>
          `;
        }).join('')}
      </div>
      <p style="margin-top:14px; font-style:italic; text-align:center; color:#555; font-size:13px;">
        “愿我们的世界永远充满阳光、欢笑与无限创造力。”
      </p>
    `;
    this.open('🖼️ 四口之家全家福', html);
  }

  // 11. 🧸 小女儿的玩具箱
  openToyBox() {
    const html = `
      <h2>🧸 小女儿的百宝玩具箱</h2>
      <div class="sub">小恬恬的小天地</div>
      <div style="font-size:14px; line-height:1.8;">
        <p>箱子里整整齐齐码放着：</p>
        <p>🧩 拼了一半的方块城堡乐高</p>
        <p>🐱 给小猫派森准备的毛线球与逗猫棒</p>
        <p>🎨 和姐姐一起画的水彩全家福</p>
        <p>⭐ 一颗闪闪发光的绿宝石幸运符！</p>
      </div>
    `;
    this.open('🧸 小女儿的玩具箱', html);
  }

  // 12. ❓ 漫游帮助说明
  openHelp() {
    const html = `
      <h2>❓ 漫游指南与快捷键</h2>
      <div class="sub">欢迎光临温馨的方块之家！</div>
      <div style="font-size:14px; line-height:1.8;">
        <p>👨‍👩‍👧‍👧 <b>成员切换：</b> 点击屏幕上方的家庭卡片或使用指令 <code>/switch &lt;dad|mom|daughter1|daughter2&gt;</code> 可立即切换控制对应角色！也可以直接点击场景里的家人进行对话互动！</p>
        <p>🎮 <b>移动控制：</b> 键盘按 <b>W A S D</b> 或 <b>方向键 ↑ ↓ ← →</b> 控制当前角色自由行走，已优化为严格视角相对朝向！</p>
        <p>🚲 <b>运动单车：</b> 点击前院路旁单车或按 <b>E</b> / <b>B</b> 键即可骑上单车！移速翻倍飞驰，骑行时按 <b>空格键</b> 叮铃鸣笛，再次按 <b>E</b> / <b>B</b> 键平稳停靠！</p>
        <p>🐾 <b>萌宠互动：</b> 杰斯（柴犬）、旺财（金毛幼犬）与皮森（橘猫）在庭院中巡视玩耍，按 <b>P</b> 键或点击右上角 <b>🐾</b> 即可呼唤跟随、抚摸互动、摇尾巴撒娇！</p>
        <p>🏊 <b>清凉泳池与跳水：</b> 走向后院泳池自动切入自由泳姿态，点击泳池跳水板可腾空翻腾 360 度入水！</p>
        <p>🖱️ <b>视角旋转：</b> 鼠标左键按住拖动可 360° 旋转全景，滚轮支持大范围高空远眺。</p>
        <p>🎯 <b>丰富互动：</b> 靠近物体按 <b>E</b> 键或直接点击：大床<b>入睡迎来晨光</b>、小黄鸭<b>调试 Bug</b>、冰箱<b>畅饮冷饮</b>、烤肉架<b>大快朵颐</b>、留声机<b>播放治愈 C418 钢琴曲</b>、秋千<b>悠闲荡漾</b>！</p>
        <p>🔢 <b>快捷热键：</b> 键盘按数字键 <b>1 - 9</b> 快速选中技能并查看详情。</p>
        <p>🛖 <b>屋顶透视：</b> 走入室内屋顶自动透明！也可按 <b>R</b> 键或点击右上角 <b>🏠</b> 按钮自由掀开屋顶！</p>
        <p>⚙️ <b>换装编辑：</b> 点击右上角 <b>⚙️</b> 或家庭档案底部的按钮，随时自由上传或更换四位家人的真实照片、姓名与简介！</p>
      </div>
    `;
    this.open('❓ 漫游指南', html);
  }

  // 13. 🛏️ 床 · 睡觉与迎来晨光
  sleepInBed() {
    const fadeEl = document.getElementById('fade');
    const fadeTxt = document.getElementById('fadeTxt');
    if (!fadeEl) return;

    if (window.MCAudio) window.MCAudio.playSleep();
    fadeEl.classList.add('active');
    if (fadeTxt) fadeTxt.textContent = 'Zzz... 正在美梦中...';

    bus.emit('banner:show', {
      title: '🛏️ 入眠时刻',
      sub: '躺在温暖的方块大床上，安稳入睡…'
    });

    setTimeout(() => {
      // 唤醒：如果在夜晚，切换到白昼
      if (state.isNight) {
        state.toggleDayNight(false);
      }
      // 恢复全部爱心体力
      state.hearts = 10;
      bus.emit('stats:update', { hearts: 10 });
      if (window.MCAudio) window.MCAudio.playLevelUp();
      if (fadeTxt) fadeTxt.textContent = '☀ 清晨阳光洒落！';
    }, 1300);

    setTimeout(() => {
      fadeEl.classList.remove('active');
      bus.emit('toast:show', {
        kicker: '☀ 美梦醒来！',
        title: '【精力充沛】在大床上睡了一觉！体力全满，迎来明媚清晨！'
      });
      bus.emit('fx:hearts');
    }, 2400);
  }

  // 14. 🦆 调试小黄鸭 (Rubber Duck Debugging)
  openRubberDuck() {
    if (window.MCAudio) window.MCAudio.playQuack();

    const duckQuotes = [
      "嘎嘎！给小黄鸭讲了一遍业务逻辑，突然发现第 42 行少传了一个参数！",
      "嘎嘎！‘先跑起来，再做重构’，写代码就像搭方块，稳扎稳打！",
      "嘎嘎！如果一个函数超过 50 行，或许该把它拆分成更小的模块啦！",
      "嘎嘎！别忘了打印 console.log 看看数据流，小黄鸭帮你盯紧！",
      "嘎嘎！深呼吸，喝口温水休息 5 分钟，Bug 会自己害怕跑掉的！",
      "嘎嘎！红石中继器需要调档，你的异步 async/await 有没有加上呢？",
      "嘎嘎！代码没有 Bug，那只是‘未文档化的特性’，自信点！"
    ];

    let quoteIndex = Math.floor(Math.random() * duckQuotes.length);

    const render = (idx) => `
      <div class="sub">RUBBER DUCK DEBUGGING · 程序员的灵感神器</div>
      <div class="duck-box">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="font-size:52px; filter:drop-shadow(2px 2px 0 #000); animation:zzzPulse 1s infinite alternate;">🦆</div>
          <div>
            <h3 style="font-size:18px; color:#222; margin-bottom:4px;">小黄鸭对你说：</h3>
            <div style="font-size:12px; color:#666;">“程序员最好的倾听者，任何疑难杂症讲给我听都会豁然开朗！”</div>
          </div>
        </div>
        <div class="duck-bubble" id="duckQuote">
          “${duckQuotes[idx]}”
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <span style="font-size:12px; color:#7cdb04; font-weight:700;">每次倾诉 +25 附魔经验值 ⭐</span>
          <button class="btn green sm" id="btnNextDuck">🦆 倾诉下一个 Bug</button>
        </div>
      </div>
    `;

    this.open('🦆 调试小黄鸭', render(quoteIndex), (panel) => {
      const btn = panel.querySelector('#btnNextDuck');
      if (btn) {
        btn.onclick = () => {
          if (window.MCAudio) {
            window.MCAudio.playQuack();
            window.MCAudio.playOrb();
          }
          quoteIndex = (quoteIndex + 1) % duckQuotes.length;
          const bubble = panel.querySelector('#duckQuote');
          if (bubble) {
            bubble.textContent = `“${duckQuotes[quoteIndex]}”`;
            bubble.style.animation = 'none';
            bubble.offsetHeight;
            bubble.style.animation = 'bouncePop 0.3s ease';
          }
          state.addXP(25);
        };
      }
    });
  }

  // 15. 📋 白板 · 全家 TODO
  openWhiteboard() {
    const defaultTodos = [
      { id: 1, text: "搭建方块新家与庭院花园", done: true },
      { id: 2, text: "爸爸重构渲染引擎，锁定 60 FPS", done: true },
      { id: 3, text: "妈妈研发新春特调玫瑰燕麦拿铁", done: false },
      { id: 4, text: "陪大女儿小悦悦挑战街机贪吃蛇 300 分", done: false },
      { id: 5, text: "给小女儿小恬恬搭好乐高小城堡", done: false },
      { id: 6, text: "全家一起去郊野公园放风筝野餐", done: false }
    ];

    let todos = [];
    try {
      const saved = localStorage.getItem('family_todos');
      todos = saved ? JSON.parse(saved) : defaultTodos;
    } catch (e) {
      todos = defaultTodos;
    }

    const render = () => `
      <div class="sub">FAMILY WHITEBOARD · 家庭心愿与备忘录</div>
      <div class="whiteboard-container">
        <div style="font-weight:700; font-size:14px; color:#2f3542; margin-bottom:8px;">
          📌 当前心愿清单 (${todos.filter(t => t.done).length} / ${todos.length} 已达成)：
        </div>
        <div class="todo-list" id="todoItems">
          ${todos.map(t => `
            <div class="todo-row ${t.done ? 'done' : ''}" data-id="${t.id}">
              <span style="font-size:16px;">${t.done ? '☑️' : '⬜'}</span>
              <span style="flex:1;">${t.text}</span>
              ${t.done ? '<span style="font-size:11px; color:#2ed573;">已完成</span>' : '<span style="font-size:11px; color:#ffa502;">进行中</span>'}
            </div>
          `).join('')}
        </div>
        <div class="todo-add-box">
          <input type="text" class="todo-input" id="newTodoInput" placeholder="写下一个新的家庭愿望或待办事项…" maxlength="40" />
          <button class="btn green sm" id="btnAddTodo">📌 贴上</button>
        </div>
      </div>
    `;

    this.open('📋 白板 · 全家 TODO', render(), (panel) => {
      const bindActions = () => {
        panel.querySelectorAll('.todo-row').forEach(row => {
          row.onclick = () => {
            const id = parseInt(row.dataset.id, 10);
            const item = todos.find(t => t.id === id);
            if (item) {
              item.done = !item.done;
              if (window.MCAudio) {
                if (item.done) window.MCAudio.playOrb();
                else window.MCAudio.playPop();
              }
              localStorage.setItem('family_todos', JSON.stringify(todos));
              panel.querySelector('.panel-body').innerHTML = render();
              bindActions();
            }
          };
        });

        const addBtn = panel.querySelector('#btnAddTodo');
        const input = panel.querySelector('#newTodoInput');
        if (addBtn && input) {
          const doAdd = () => {
            const val = input.value.trim();
            if (!val) return;
            todos.push({ id: Date.now(), text: val, done: false });
            localStorage.setItem('family_todos', JSON.stringify(todos));
            if (window.MCAudio) window.MCAudio.playPop();
            panel.querySelector('.panel-body').innerHTML = render();
            bindActions();
          };
          addBtn.onclick = doAdd;
          input.onkeydown = (e) => {
            if (e.key === 'Enter') doAdd();
          };
        }
      };
      bindActions();
    });
  }

  // 16. 🧊 厨房精酿冰箱
  openFridge() {
    const drinks = [
      {
        id: 'redstone',
        name: '冰镇红石气泡水',
        icon: '🥤',
        desc: '碳酸爆裂，强劲提神！爸爸写代码时的解乏首选。',
        buff: '恢复 2 颗爱心 ❤️❤️',
        hearts: 2,
        action: () => {
          bus.emit('toast:show', { kicker: '🥤 畅饮冰镇红石气泡水', title: '嗝~ 碳酸气泡在舌尖跳跃，疲惫瞬间扫空！' });
        }
      },
      {
        id: 'latte',
        name: '妈妈的冰燕麦拿铁',
        icon: '☕',
        desc: '深烘意式浓缩注入冰镇丝滑燕麦奶，温润醇厚。',
        buff: '恢复 3 颗爱心 ❤️❤️❤️',
        hearts: 3,
        action: () => {
          bus.emit('toast:show', { kicker: '☕ 品味燕麦拿铁', title: '浓郁咖啡香弥漫，感受妈妈特调的治愈温柔！' });
        }
      },
      {
        id: 'blueberry',
        name: '野生蓝莓气泡汁',
        icon: '🫐',
        desc: '大女儿最爱！新鲜手捣蓝莓果肉，酸甜爆汁。',
        buff: '恢复 2 颗心 + 移速提升 50% ⚡',
        hearts: 2,
        action: () => {
          bus.emit('player:speedboost', { speed: 9.6, duration: 10000 });
          bus.emit('toast:show', { kicker: '🫐 畅饮野生蓝莓汁', title: '酸甜爽口！获得【迅捷疾跑】移速加成 10 秒！' });
        }
      },
      {
        id: 'strawberry',
        name: '鲜榨草莓甜奶',
        icon: '🍓',
        desc: '小女儿最爱！农场鲜草莓慢熬成果酱冲泡，甜美粉嫩。',
        buff: '爱心体力全满 ❤️❤️❤️❤️❤️',
        hearts: 10,
        action: () => {
          bus.emit('fx:hearts');
          bus.emit('toast:show', { kicker: '🍓 畅饮草莓甜奶', title: '甜蜜到心里！体力全满，浑身充满力量！' });
        }
      }
    ];

    const html = `
      <div class="sub">CHILLED BEVERAGES · 厨房双开门保鲜冰箱</div>
      <div class="fridge-grid">
        ${drinks.map((d, i) => `
          <div class="drink-card">
            <div class="drink-icon">${d.icon}</div>
            <div class="drink-info">
              <div class="name">${d.name}</div>
              <div class="desc">${d.desc}</div>
              <div class="buff">${d.buff}</div>
            </div>
            <button class="btn green sm btn-drink" data-idx="${i}" style="margin-top:6px;">畅饮此款</button>
          </div>
        `).join('')}
      </div>
    `;

    this.open('🧊 厨房双开门冰箱', html, (panel) => {
      panel.querySelectorAll('.btn-drink').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.idx, 10);
          const d = drinks[idx];
          if (!d) return;
          if (window.MCAudio) window.MCAudio.playDrink();
          state.hearts = Math.min(10, state.hearts + d.hearts);
          bus.emit('stats:update', { hearts: state.hearts });
          d.action();
          this.close();
        };
      });
    });
  }

  // 17. 🎵 留声唱片机
  toggleJukebox() {
    if (!window.MCAudio) return;
    const isPlaying = window.MCAudio.toggleBgm();
    if (isPlaying) {
      window.MCAudio.playChest();
      bus.emit('fx:musicnote');
      bus.emit('toast:show', {
        kicker: '🎵 留声唱片机',
        title: '【正在播放】C418 - Living Mice (治愈钢琴旋律响起…)'
      });
      if (this.musicTimer) clearInterval(this.musicTimer);
      this.musicTimer = setInterval(() => {
        if (window.MCAudio && window.MCAudio.bgmEnabled) {
          bus.emit('fx:musicnote');
        } else {
          clearInterval(this.musicTimer);
        }
      }, 2600);
    } else {
      if (this.musicTimer) clearInterval(this.musicTimer);
      bus.emit('toast:show', {
        kicker: '🎵 留声唱片机',
        title: '唱片已取出，旋律归于平静。'
      });
    }
  }

  // 18. 🚲 庭院单车 (上车 / 下车沉浸式骑行交互)
  rideBicycle() {
    bus.emit('player:bicycle:toggle');
  }

  // 19. 🎠 庭院秋千
  rideSwing() {
    if (window.MCAudio) window.MCAudio.playSwing();
    bus.emit('fx:hearts');
    bus.emit('toast:show', {
      kicker: '🎠 庭院双人秋千',
      title: '荡起秋千，微风拂面！听着院子里花鸟的轻吟，心情大好！'
    });
  }

  // 20. 🌺 妈妈的花圃
  smellFlowers() {
    if (window.MCAudio) window.MCAudio.playOrb();
    bus.emit('toast:show', {
      kicker: '🌺 妈妈的花圃',
      title: '轻嗅花香：茉莉与玫瑰的芳香沁人心脾，疲惫一扫而空，幸福度 +100！'
    });
  }

  // 21. 🛋️ 客厅小沙发
  restOnSofa() {
    if (window.MCAudio) window.MCAudio.playPop();
    bus.emit('toast:show', {
      kicker: '🛋️ 客厅小沙发',
      title: '倚在软软的沙发上歇息片刻，静静享受属于家的静谧时光。'
    });
  }

  // 22. 👨‍👩‍👧‍👧 家人面对面对话
  openFamilyDialogue(memberId) {
    const targetMember = state.config.family[memberId];
    if (!targetMember) return;
    const activeMember = state.getActiveMember();
    const isSelf = memberId === activeMember.id;

    if (window.MCAudio) window.MCAudio.playPop();

    let dialogQuote = targetMember.quote;
    if (memberId === 'mom') {
      dialogQuote = isSelf ? "咖啡壶正咕嘟咕嘟冒着香气，今天院子里的花也开得很娇艳呢！" : "老公/宝贝，写代码或者玩耍累了就来露台喝杯燕麦拿铁吧，妈妈一直在这里陪着你们~";
    } else if (memberId === 'daughter1') {
      dialogQuote = isSelf ? "耶！我正准备挑战街机贪吃蛇 300 分大关呢！" : "爸爸！妈妈！你看我画的方块小城堡漂亮吗？周末带我和妹妹去放风筝好不好！";
    } else if (memberId === 'daughter2') {
      dialogQuote = isSelf ? "派森猫猫，快来和我一起玩逗猫棒呀！" : "爸爸/姐姐抱抱！今天派森猫猫蹭了我的小手手，杰斯狗狗也在草坪打滚呢，嘻嘻！";
    } else if (memberId === 'dad') {
      dialogQuote = isSelf ? "方块小屋的红石电路运转良好，帧率稳稳锁在 60 FPS！" : "老婆、宝贝们！今天也是幸福美满的一天，有任何想去的地方爸爸随时带你们出发！";
    }

    const html = `
      <div class="sub">FAMILY INTERACTION · 面对面对话</div>
      <div class="talk-card">
        <img src="${targetMember.photo}" alt="${targetMember.name}" class="talk-avatar-img" />
        <div class="talk-content">
          <div class="talk-name">
            <span>${targetMember.name}</span>
            <span style="font-size:12px; font-weight:normal; color:#666;">(${targetMember.role})</span>
          </div>
          <div class="talk-quote">
            “${dialogQuote}”
          </div>
          <div class="talk-buttons">
            ${!isSelf ? `<button class="btn green sm" id="btnSwitchToThis">▶ 切换控制【${targetMember.name}】</button>` : `<button class="btn green sm" id="btnEditThis">⚙️ 更换装扮与资料</button>`}
            <button class="btn sm" id="btnGiveHug">💖 给一个温暖拥抱</button>
            <button class="btn sm" id="btnViewProfile">🪪 查看详细档案</button>
          </div>
        </div>
      </div>
    `;

    this.open(`💬 与【${targetMember.name}】的对话`, html, (panel) => {
      const switchBtn = panel.querySelector('#btnSwitchToThis');
      if (switchBtn) {
        switchBtn.onclick = () => {
          this.close();
          state.setActiveMember(memberId);
        };
      }
      const editBtn = panel.querySelector('#btnEditThis');
      if (editBtn) {
        editBtn.onclick = () => {
          this.close();
          bus.emit('editor:open', memberId);
        };
      }
      const hugBtn = panel.querySelector('#btnGiveHug');
      if (hugBtn) {
        hugBtn.onclick = () => {
          if (window.MCAudio) window.MCAudio.playHeart();
          bus.emit('fx:hearts');
          bus.emit('toast:show', {
            kicker: '💖 温暖的拥抱',
            title: `与【${targetMember.name}】紧紧相拥！感受到了满满的爱与温暖！`
          });
        };
      }
      const profBtn = panel.querySelector('#btnViewProfile');
      if (profBtn) {
        profBtn.onclick = () => {
          this.close();
          this.openProfile();
        };
      }
    });
  }

  // ==========================================
  // 🐾 萌宠互动与召唤面板系统
  // ==========================================
  openPetQuickMenu(petId) {
    const PET_PROFILES = {
      dog: {
        id: 'dog',
        name: '柴犬 · 杰斯 (JS)',
        role: '忠诚庭院护卫犬',
        avatar: '🐶',
        badge: '汪汪队队长',
        desc: '活泼忠诚的柴犬，一直在庭院、狗窝与大门间巡逻守护。最喜欢吃风干牛肉粒和被摸大脑袋！',
        treat: '🥩 奖励多汁风干牛肉粒'
      },
      puppy: {
        id: 'puppy',
        name: '金毛幼犬 · 旺财 (Puppy)',
        role: '好奇顽皮小淘气',
        avatar: '🐾',
        badge: '全家团宠宝宝',
        desc: '精力充沛的小金毛幼犬，喜欢在草坪上推着红球跑、翻肚皮打滚撒娇。一开心小短尾巴就摇成螺旋桨！',
        treat: '🦴 奖励高钙磨牙骨头'
      },
      cat: {
        id: 'cat',
        name: '橘猫 · 派森 (Python)',
        role: '优雅软萌大橘',
        avatar: '🐱',
        badge: '猫界架构师',
        desc: '优雅惬意的橘猫，喜欢在壁炉地毯上揣手手打呼噜，偶尔敏捷地跳上猫爬架俯瞰整个小院。',
        treat: '🐟 奖励鲜美冻干金枪鱼'
      }
    };

    const p = PET_PROFILES[petId] || PET_PROFILES.dog;
    const html = `
      <div style="text-align: center; margin-bottom: 14px;">
        <div style="font-size: 50px; line-height: 1.1; margin-bottom: 6px;">${p.avatar}</div>
        <div style="font-size: 19px; font-weight: bold; color: #2c3e50;">${p.name}</div>
        <div style="font-size: 12px; color: #7f8c8d; margin-top: 2px;">
          ${p.role} · <span style="background: #eccc68; color: #2f3542; padding: 1px 6px; border-radius: 3px; font-weight: bold;">${p.badge}</span>
        </div>
        <div style="font-size: 12px; color: #555; background: #f8f9fa; border: 1px dashed #ced6e0; padding: 8px 12px; border-radius: 4px; margin-top: 10px; line-height: 1.5;">
          ${p.desc}
        </div>
      </div>

      <div style="font-size: 13px; font-weight: bold; color: #2f3542; margin-bottom: 8px;">🎮 选择你想与它进行的互动：</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
        <button class="btn big" id="quickPetCaress" style="background: #27ae60; color: #fff; font-size: 14px; font-weight: bold; padding: 10px 4px;">
          ✋ 温柔抚摸
        </button>
        <button class="btn big" id="quickPetWag" style="background: #f39c12; color: #fff; font-size: 14px; font-weight: bold; padding: 10px 4px;">
          🐕 逗它摇尾巴
        </button>
        <button class="btn big" id="quickPetSummon" style="background: #2980b9; color: #fff; font-size: 14px; font-weight: bold; padding: 10px 4px;">
          📢 召唤跟随散步
        </button>
        <button class="btn big" id="quickPetFeed" style="background: #e74c3c; color: #fff; font-size: 14px; font-weight: bold; padding: 10px 4px;">
          ${p.treat}
        </button>
      </div>

      <div style="text-align: center; border-top: 1px dashed #ccc; padding-top: 10px;">
        <button class="btn sm" id="quickOpenFullHub" style="background: #8e44ad; color: #fff;">
          🐾 打开萌宠呼唤中心 · 查看所有宠物
        </button>
      </div>
    `;

    this.open(`🐾 萌宠互动 · ${p.name.split(' · ')[0]}`, html, (panel) => {
      panel.querySelector('#quickPetCaress').onclick = () => {
        bus.emit('pet:caress', { petId });
        this.close();
      };
      panel.querySelector('#quickPetWag').onclick = () => {
        bus.emit('pet:wag', { petId });
        this.close();
      };
      panel.querySelector('#quickPetSummon').onclick = () => {
        bus.emit('pet:summon', { petId });
        this.close();
      };
      panel.querySelector('#quickPetFeed').onclick = () => {
        bus.emit('pet:feed', { petId });
        this.close();
      };
      panel.querySelector('#quickOpenFullHub').onclick = () => {
        this.openPetsHub(petId);
      };
    });
  }

  openPetsHub(selectedId = 'dog') {
    const PET_PROFILES = {
      dog: {
        id: 'dog',
        name: '柴犬 · 杰斯 (JS)',
        role: '忠诚庭院护卫犬',
        avatar: '🐶',
        badge: '汪汪队队长',
        desc: '活泼忠诚的柴犬，一直在庭院、狗窝与大门间巡逻守护。最喜欢吃风干牛肉粒和被摸大脑袋！',
        treat: '🥩 奖励多汁风干牛肉粒'
      },
      puppy: {
        id: 'puppy',
        name: '金毛幼犬 · 旺财 (Puppy)',
        role: '好奇顽皮小淘气',
        avatar: '🐾',
        badge: '全家团宠宝宝',
        desc: '精力充沛的小金毛幼犬，喜欢在草坪上推着红球跑、翻肚皮打滚撒娇。一开心小短尾巴就摇成螺旋桨！',
        treat: '🦴 奖励高钙磨牙骨头'
      },
      cat: {
        id: 'cat',
        name: '橘猫 · 派森 (Python)',
        role: '优雅软萌大橘',
        avatar: '🐱',
        badge: '猫界架构师',
        desc: '优雅惬意的橘猫，喜欢在壁炉地毯上揣手手打呼噜，偶尔敏捷地跳上猫爬架俯瞰整个小院。',
        treat: '🐟 奖励鲜美冻干金枪鱼'
      }
    };

    let currentId = selectedId;

    const render = () => {
      const p = PET_PROFILES[currentId];
      const html = `
        <div style="margin-bottom: 12px;">
          <!-- 切换标签卡 -->
          <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 14px;">
            ${Object.values(PET_PROFILES).map(item => `
              <button class="btn ${item.id === currentId ? 'on' : ''} tab-pet-btn" data-id="${item.id}" style="padding: 8px 14px; font-size: 13px; font-weight: bold;">
                ${item.avatar} ${item.name.split(' · ')[0]}
              </button>
            `).join('')}
          </div>

          <!-- 选中宠物卡片展示 -->
          <div style="background: #f1f2f6; border: 2px solid #ced6e0; padding: 14px; border-radius: 6px; display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
            <div style="font-size: 52px; line-height: 1; flex-shrink: 0;">${p.avatar}</div>
            <div style="flex: 1;">
              <div style="font-size: 17px; font-weight: bold; color: #2f3542;">
                ${p.name}
                <span style="font-size: 11px; background: #eccc68; color: #2f3542; padding: 2px 6px; border-radius: 3px; margin-left: 6px;">${p.badge}</span>
              </div>
              <div style="font-size: 12px; color: #747d8c; margin-top: 2px;">${p.role}</div>
              <div style="font-size: 12px; color: #57606f; margin-top: 6px; line-height: 1.4;">${p.desc}</div>
            </div>
          </div>

          <!-- 针对此宠物的 4 项互动动作 -->
          <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #2f3542;">🎮 与【${p.name.split(' · ')[0]}】互动：</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
            <button class="btn big" id="hubBtnCaress" style="background: #27ae60; color: #fff; font-size: 14px; font-weight: bold;">
              ✋ 温柔抚摸摸头
            </button>
            <button class="btn big" id="hubBtnWag" style="background: #f39c12; color: #fff; font-size: 14px; font-weight: bold;">
              🐕 逗它极速摇尾
            </button>
            <button class="btn big" id="hubBtnSummon" style="background: #2980b9; color: #fff; font-size: 14px; font-weight: bold;">
              📢 召唤小家伙到身边
            </button>
            <button class="btn big" id="hubBtnFeed" style="background: #e74c3c; color: #fff; font-size: 14px; font-weight: bold;">
              ${p.treat}
            </button>
          </div>

          <!-- 全员一键集合大按钮 -->
          <div style="border-top: 2px dashed #dcdde1; padding-top: 14px; text-align: center;">
            <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 8px;">📢 想要所有小家伙同时飞奔过来吗？</div>
            <button class="btn big" id="hubBtnSummonAll" style="background: linear-gradient(135deg, #8e44ad, #6c5ce7); color: #fff; font-size: 15px; width: 100%; font-weight: bold; padding: 12px; box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);">
              🔔 吹响萌宠呼唤哨 · 全员集合到身边！
            </button>
          </div>
        </div>
      `;

      this.open('🐾 萌宠互动与呼唤中心 · Pet Companion Center', html, (panel) => {
        panel.querySelectorAll('.tab-pet-btn').forEach(btn => {
          btn.onclick = () => {
            currentId = btn.dataset.id;
            render();
          };
        });

        panel.querySelector('#hubBtnCaress').onclick = () => {
          bus.emit('pet:caress', { petId: currentId });
          this.close();
        };
        panel.querySelector('#hubBtnWag').onclick = () => {
          bus.emit('pet:wag', { petId: currentId });
          this.close();
        };
        panel.querySelector('#hubBtnSummon').onclick = () => {
          bus.emit('pet:summon', { petId: currentId });
          this.close();
        };
        panel.querySelector('#hubBtnFeed').onclick = () => {
          bus.emit('pet:feed', { petId: currentId });
          this.close();
        };
        panel.querySelector('#hubBtnSummonAll').onclick = () => {
          bus.emit('pet:summon', { petId: 'all' });
          this.close();
        };
      });
    };

    render();
  }
}
