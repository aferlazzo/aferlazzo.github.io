(() => {
  const params = new URLSearchParams(window.location.search);
  const adventureId = params.get('adventure') || 'the-rock';
  const adventure = window.DCG_ADVENTURES && window.DCG_ADVENTURES[adventureId];
  if (!adventure) {
    document.getElementById('story').innerHTML = '<p class="impact">Adventure not found.</p><p>This story may still be in development.</p>';
    return;
  }
  document.title = `${adventure.title} — A DCG Adventure`;
  const engine = new window.DCGEngine(adventure);
  engine.start();
})();