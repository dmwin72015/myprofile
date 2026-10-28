/**
 * ==============================================================================
 * EditorModal - Multi-Member Family Profile & Avatar Visual Customizer
 * ==============================================================================
 */

import { state } from '../core/State.js';
import { bus } from '../core/EventBus.js';

export class EditorModal {
  constructor() {
    this.overlay = document.getElementById('panelOverlay');
    this.panel = document.getElementById('panel');
    this.editingMemberId = state.activeMemberId || 'dad';

    this.init();
  }

  init() {
    bus.on('editor:open', (memberId = null) => {
      if (memberId) this.editingMemberId = memberId;
      this.openEditor();
    });
  }

  openEditor() {
    if (window.MCAudio) window.MCAudio.playChest();
    const family = state.config.family;
    const cur = family[this.editingMemberId] || family.dad;

    const html = `
      <h2>⚙️ 家庭成员资料与头像编辑器</h2>
      <div class="sub">支持在线上传替换任何成员的照片、姓名与简介 · 实时生效</div>

      <!-- 成员切换 Tab -->
      <div style="display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap;">
        ${Object.keys(family).map(id => {
          const m = family[id];
          const isAct = id === this.editingMemberId;
          return `<button class="btn sm ${isAct ? 'green' : ''}" data-edit-mid="${id}">${m.name}</button>`;
        }).join('')}
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="font-weight:700; font-size:13px;">成员姓名：</label>
          <input type="text" id="edName" value="${cur.name}" style="width:100%; padding:6px; font-family:inherit; margin-top:4px;" />
        </div>

        <div>
          <label style="font-weight:700; font-size:13px;">头衔与家庭角色：</label>
          <div style="display:flex; gap:8px; margin-top:4px;">
            <input type="text" id="edTitle" value="${cur.title}" placeholder="个性头衔" style="flex:2; padding:6px; font-family:inherit;" />
            <input type="text" id="edRole" value="${cur.role}" placeholder="家庭角色" style="flex:1; padding:6px; font-family:inherit;" />
          </div>
        </div>

        <div>
          <label style="font-weight:700; font-size:13px;">头像照片 (本地图片上传或网络 URL)：</label>
          <div style="display:flex; gap:12px; align-items:center; margin-top:6px;">
            <div style="width:58px; height:58px; background:#888; border:2px solid #000; display:flex; align-items:center; justify-content:center; overflow:hidden;">
              <img id="edAvatarPreview" src="${cur.photo}" style="width:100%; height:100%; object-fit:cover;" />
            </div>
            <div style="flex:1;">
              <input type="text" id="edPhotoUrl" value="${cur.photo}" placeholder="输入图片 URL" style="width:100%; padding:4px; font-size:12px; margin-bottom:4px;" />
              <input type="file" id="edPhotoFile" accept="image/*" style="font-size:11px;" />
            </div>
          </div>
        </div>

        <div>
          <label style="font-weight:700; font-size:13px;">代表格言 / 一句话签名：</label>
          <input type="text" id="edQuote" value="${cur.quote}" style="width:100%; padding:6px; font-family:inherit; margin-top:4px;" />
        </div>

        <div>
          <label style="font-weight:700; font-size:13px;">个人详细介绍 (段落间回车换行)：</label>
          <textarea id="edBio" rows="4" style="width:100%; padding:6px; font-family:inherit; margin-top:4px;">${cur.bio.join('\n\n')}</textarea>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <button class="btn sm" id="btnExportCode">📋 导出完整配置代码</button>
          <button class="btn green" id="btnSaveMember">✔ 保存并应用此成员</button>
        </div>
      </div>
    `;

    this.panel.innerHTML = `
      <div class="panel-header">
        <span>⚙️ 家庭成员资料编辑器</span>
        <button class="btn sm" id="btnCloseEditor">✖</button>
      </div>
      <div class="panel-body">${html}</div>
    `;

    this.overlay.classList.add('show');
    this.panel.querySelector('#btnCloseEditor').onclick = () => this.overlay.classList.remove('show');

    // 绑定成员切换
    this.panel.querySelectorAll('button[data-edit-mid]').forEach(btn => {
      btn.onclick = () => {
        this.editingMemberId = btn.dataset.editMid;
        this.openEditor();
      };
    });

    // 绑定文件上传预览
    const fileInput = this.panel.querySelector('#edPhotoFile');
    const urlInput = this.panel.querySelector('#edPhotoUrl');
    const preview = this.panel.querySelector('#edAvatarPreview');

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        urlInput.value = evt.target.result;
        preview.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    };

    urlInput.oninput = () => {
      preview.src = urlInput.value;
    };

    // 保存
    this.panel.querySelector('#btnSaveMember').onclick = () => {
      const updatedConfig = { ...state.config };
      updatedConfig.family[this.editingMemberId] = {
        ...updatedConfig.family[this.editingMemberId],
        name: this.panel.querySelector('#edName').value.trim() || cur.name,
        title: this.panel.querySelector('#edTitle').value.trim() || cur.title,
        role: this.panel.querySelector('#edRole').value.trim() || cur.role,
        photo: urlInput.value.trim() || cur.photo,
        quote: this.panel.querySelector('#edQuote').value.trim() || cur.quote,
        bio: this.panel.querySelector('#edBio').value.split('\n\n').filter(Boolean)
      };

      state.saveCustomConfig(updatedConfig);
      if (window.MCAudio) window.MCAudio.playLevelUp();
      this.overlay.classList.remove('show');
      bus.emit('toast:show', { kicker: '✔ 成员资料已更新', title: `${cur.name} 的形象与简介已成功保存！` });
    };

    // 导出代码
    this.panel.querySelector('#btnExportCode').onclick = () => {
      const code = `window.MINECRAFT_CONFIG = ${JSON.stringify(state.config, null, 2)};`;
      navigator.clipboard.writeText(code).then(() => {
        alert('已成功复制完整配置代码！可直接粘贴到 js/config.js 文件中永久生效。');
      });
    };
  }
}
