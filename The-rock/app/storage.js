window.DCGStorage = (() => {
  const prefix = 'dcg-adventure:';
  function key(id) { return `${prefix}${id}`; }
  function load(id) { try { const raw = localStorage.getItem(key(id)); return raw ? JSON.parse(raw) : null; } catch (_) { return null; } }
  function save(id, state) { try { localStorage.setItem(key(id), JSON.stringify({ ...state, savedAt: new Date().toISOString() })); return true; } catch (_) { return false; } }
  function clear(id) { try { localStorage.removeItem(key(id)); } catch (_) {} }
  return { load, save, clear };
})();