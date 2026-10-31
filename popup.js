const api = globalThis.browser || globalThis.chrome;
const store = api.storage.sync || api.storage.local;
const on = document.getElementById('on'), sp = document.getElementById('sp'), power = document.getElementById('power');
store.get({ on: true, species: 'random', power: 'random' }).then(v => { on.checked = v.on; sp.value = v.species; power.value = v.power || 'random'; }).catch(() => {});
on.onchange = () => store.set({ on: on.checked });
sp.onchange = () => store.set({ species: sp.value });
power.onchange = () => store.set({ power: power.value });
document.getElementById('fix').onclick = () => store.set({ reset: Date.now() });
