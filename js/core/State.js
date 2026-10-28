/**
 * ==============================================================================
 * State - Reactive Application State
 * ==============================================================================
 */

import { bus } from './EventBus.js';

class State {
  constructor() {
    this.config = this.loadInitialConfig();
    this.activeMemberId = this.config.activeMemberId || 'dad';
    this.isNight = false;
    this.showRoof = true;
    this.hearts = 10;
    this.xp = 0;
    this.activePanel = null;
    this.sfxEnabled = localStorage.getItem('mc_sfx') !== 'false';
  }

  loadInitialConfig() {
    const saved = localStorage.getItem('mc_family_custom_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...window.MINECRAFT_CONFIG, ...parsed };
      } catch (e) {
        console.warn('Failed to parse saved family config', e);
      }
    }
    return JSON.parse(JSON.stringify(window.MINECRAFT_CONFIG));
  }

  saveCustomConfig(newConfig) {
    this.config = newConfig;
    localStorage.setItem('mc_family_custom_data', JSON.stringify(newConfig));
    bus.emit('config:updated', this.config);
  }

  getActiveMember() {
    return this.config.family[this.activeMemberId] || this.config.family.dad;
  }

  setActiveMember(memberId) {
    if (!this.config.family[memberId] || this.activeMemberId === memberId) return;
    this.activeMemberId = memberId;
    bus.emit('family:switch', this.getActiveMember());
  }

  toggleDayNight(forced) {
    this.isNight = typeof forced === 'boolean' ? forced : !this.isNight;
    bus.emit('world:daynight', this.isNight);
    return this.isNight;
  }

  addXP(amount = 25) {
    this.xp += amount;
    bus.emit('stats:xp', { xp: this.xp });
  }

  toggleRoof() {
    this.showRoof = !this.showRoof;
    bus.emit('world:roof', this.showRoof);
    return this.showRoof;
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    localStorage.setItem('mc_sfx', this.sfxEnabled);
    bus.emit('audio:sfx_toggle', this.sfxEnabled);
    return this.sfxEnabled;
  }
}

export const state = new State();
