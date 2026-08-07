window.DCGEngine = class DCGEngine {
  constructor(adventure) {
    this.adventure = adventure;
    this.storyEl = document.getElementById('story');
    this.choicesEl = document.getElementById('choices');
    this.progressEl = document.getElementById('progress');
    this.eyebrowEl = document.getElementById('eyebrow');
    this.panelEl = document.getElementById('story-panel');
    this.pauseBtn = document.getElementById('pause-btn');
    this.shareBtn = document.getElementById('share-btn');
    this.attributionEl = document.getElementById('attribution');
    this.state = { nodeId: adventure.startNode || 'start', history: [], vars: {} };
    this.pauseBtn.addEventListener('click', () => this.pause());
    this.shareBtn.addEventListener('click', () => this.share());
    this.renderAttribution();
  }
  start() {
    const saved = window.DCGStorage.load(this.adventure.id);
    if (saved && saved.nodeId && saved.nodeId !== (this.adventure.startNode || 'start')) { this.renderResume(saved); return; }
    window.DCGAnalytics.track('adventure_start', { adventure: this.adventure.id, node: this.state.nodeId });
    this.renderNode(this.state.nodeId);
  }
  renderResume(saved) {
    const node = this.adventure.nodes[saved.nodeId];
    this.eyebrowEl.classList.add('visible');
    this.storyEl.innerHTML = `<p class="impact">Welcome back.</p><p>${this.adventure.resumeText || 'Your Adventure is right where you left it.'}</p><div class="explain">${saved.history.length} decision${saved.history.length === 1 ? '' : 's'} saved. Resume from your last situation.</div>`;
    this.choicesEl.innerHTML = '';
    this.addButton('Resume Adventure', node && node.resumeDetail ? node.resumeDetail : 'Continue your story.', () => { this.state = saved; window.DCGAnalytics.track('adventure_resume', { adventure: this.adventure.id, node: saved.nodeId }); this.renderNode(saved.nodeId); });
    this.addButton('Start over', 'Erase the saved path and begin again.', () => this.restart(), 'secondary');
    this.progressEl.textContent = 'Adventure paused';
    this.pauseBtn.hidden = true;
    this.shareBtn.hidden = false;
  }
  renderNode(id) {
    const node = this.adventure.nodes[id];
    if (!node) return;
    this.state.nodeId = id;
    window.DCGStorage.save(this.adventure.id, this.state);
    this.eyebrowEl.textContent = node.hideBrand ? '' : 'A DCG Adventure';
    this.eyebrowEl.classList.toggle('visible', !node.hideBrand);
    this.storyEl.innerHTML = node.text;
    this.choicesEl.innerHTML = '';
    (node.choices || []).forEach((choice) => this.addButton(choice.label, choice.detail || '', () => this.choose(choice), choice.restart ? 'restart' : ''));
    const decisions = this.state.history.length;
    this.progressEl.textContent = id === (this.adventure.startNode || 'start') ? '' : `Decision ${decisions}`;
    this.pauseBtn.hidden = decisions === 0 || Boolean(node.ending);
    this.shareBtn.hidden = decisions === 0;
    this.panelEl.classList.remove('story-enter');
    void this.panelEl.offsetWidth;
    this.panelEl.classList.add('story-enter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  addButton(label, detail, handler, extraClass = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `choice ${extraClass}`.trim();
    button.innerHTML = `<strong>${label}</strong>${detail ? `<span>${detail}</span>` : ''}`;
    button.addEventListener('click', handler);
    this.choicesEl.appendChild(button);
  }
  choose(choice) {
    if (choice.restart) { this.restart(); return; }
    this.state.history.push({ from: this.state.nodeId, choice: choice.label, to: choice.next });
    if (choice.set) Object.assign(this.state.vars, choice.set);
    window.DCGStorage.save(this.adventure.id, this.state);
    window.DCGAnalytics.track('decision', { adventure: this.adventure.id, node: this.state.nodeId, choice: choice.label });
    this.renderNode(choice.next);
  }
  pause() {
    window.DCGStorage.save(this.adventure.id, this.state);
    window.DCGAnalytics.track('adventure_pause', { adventure: this.adventure.id, node: this.state.nodeId });
    this.eyebrowEl.classList.add('visible');
    this.storyEl.innerHTML = `<p class="impact">Adventure saved.</p><p>You can close this page and come back later.</p><div class="explain">Your decisions stay on this device. No account required.</div>`;
    this.choicesEl.innerHTML = '';
    this.addButton('Resume now', 'Continue from the decision you paused on.', () => this.renderNode(this.state.nodeId));
    this.progressEl.textContent = 'Paused';
    this.pauseBtn.hidden = true;
    this.shareBtn.hidden = false;
  }
  async share() {
    const result = await window.DCGShare.share(this.adventure);
    window.DCGAnalytics.track('share', { adventure: this.adventure.id, node: this.state.nodeId, choice: result });
    const original = this.shareBtn.textContent;
    if (result === 'copied') this.shareBtn.textContent = 'Link copied';
    else if (result === 'shared') this.shareBtn.textContent = 'Shared';
    else if (result === 'unavailable') this.shareBtn.textContent = 'Copy the URL';
    setTimeout(() => { this.shareBtn.textContent = original; }, 1800);
  }
  restart() {
    window.DCGStorage.clear(this.adventure.id);
    this.state = { nodeId: this.adventure.startNode || 'start', history: [], vars: {} };
    window.DCGAnalytics.track('adventure_restart', { adventure: this.adventure.id, node: this.state.nodeId });
    this.renderNode(this.state.nodeId);
  }
  renderAttribution() {
    const creator = this.adventure.creator || 'Anthony Ferlazzo';
    const home = this.adventure.seriesHome || '#';
    this.attributionEl.innerHTML = `<a href="${home}">Driver Confidence Guide</a> · A DCG Adventure · Created by ${creator}`;
  }
};