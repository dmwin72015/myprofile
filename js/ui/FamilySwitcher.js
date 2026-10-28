/**
 * ==============================================================================
 * FamilySwitcher - Family Member Selection Dock & Controller
 * ==============================================================================
 */

import { state } from '../core/State.js';
import { bus } from '../core/EventBus.js';

export class FamilySwitcher {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.init();
  }

  init() {
    this.render();

    bus.on('family:switch', (member) => {
      this.updateActiveBadge(member.id);
      if (window.MCAudio) window.MCAudio.playOrb();
      bus.emit('banner:show', {
        title: `当前控制：${member.name}`,
        sub: `${member.title} · 按 WASD 漫游`
      });
    });

    bus.on('config:updated', () => {
      this.render();
    });
  }

  render() {
    if (!this.container) return;
    const family = state.config.family;

    this.container.innerHTML = `
      <div class="family-dock-header">
        <span>👨‍👩‍👧‍👧 家庭成员切换</span>
        <span class="family-dock-hint">点击即可切换控制对应人物</span>
      </div>
      <div class="family-dock-members">
        ${Object.keys(family).map(id => {
          const m = family[id];
          const isActive = id === state.activeMemberId;
          return `
            <div class="family-member-card ${isActive ? 'active' : ''}" data-id="${id}" title="${m.name} (${m.role})">
              <div class="member-avatar-box">
                <img src="${m.photo}" alt="${m.name}" />
              </div>
              <div class="member-info-col">
                <div class="member-name">${m.name}</div>
                <div class="member-role">${m.role}</div>
              </div>
              <span class="active-badge">控制中</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.container.querySelectorAll('.family-member-card').forEach(card => {
      card.onclick = () => {
        const id = card.dataset.id;
        state.setActiveMember(id);
      };
    });
  }

  updateActiveBadge(activeId) {
    if (!this.container) return;
    this.container.querySelectorAll('.family-member-card').forEach(card => {
      card.classList.toggle('active', card.dataset.id === activeId);
    });
  }
}
