window.DCGShare = (() => {
  async function share(adventure) {
    const url = adventure.canonicalUrl || window.location.href;
    const text = adventure.shareText || `${adventure.title} — a DCG Adventure`;
    if (navigator.share) {
      try { await navigator.share({ title: adventure.title, text, url }); return 'shared'; }
      catch (error) { if (error && error.name === 'AbortError') return 'cancelled'; }
    }
    try { await navigator.clipboard.writeText(url); return 'copied'; }
    catch (_) { return 'unavailable'; }
  }
  return { share };
})();