window.DCGAnalytics = (() => {
  function track(eventName, details = {}) {
    const payload = {
      event: eventName,
      adventure: details.adventure || null,
      node: details.node || null,
      choice: details.choice || null,
      timestamp: new Date().toISOString()
    };
    console.debug('[DCG event]', payload);
  }
  return { track };
})();