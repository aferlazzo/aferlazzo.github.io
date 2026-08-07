(() => {
  const params = new URLSearchParams(window.location.search);
  const adventureId = params.get('adventure') || 'the-rock';
  const safeId = /^[a-z0-9-]+$/.test(adventureId) ? adventureId : 'the-rock';
  const script = document.createElement('script');
  script.src = `adventures/${safeId}.js`;
  script.onload = () => {
    const adventure = window.DCG_ADVENTURES && window.DCG_ADVENTURES[safeId];
    if (!adventure) return showMissing();
    document.title = `${adventure.title} — A DCG Adventure`;
    new window.DCGEngine(adventure).start();
  };
  script.onerror = showMissing;
  document.head.appendChild(script);
  function showMissing() {
    document.getElementById('story').innerHTML = '<p class="impact">Adventure not found.</p><p>This story may still be in development.</p>';
    document.getElementById('share-btn').hidden = true;
    document.getElementById('pause-btn').hidden = true;
  }
})();