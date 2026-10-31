const api = globalThis.browser || globalThis.chrome;
const store = api.storage.sync || api.storage.local;
const on = document.getElementById('on');
const sp = document.getElementById('sp');
const power = document.getElementById('power');
const effects = document.getElementById('effects');
const pause = document.getElementById('pause');
const status = document.getElementById('status');
let paused = false;

function updateControls(settings) {
  if (settings.on != null) on.checked = settings.on;
  if (settings.species) sp.value = settings.species;
  if (settings.power) power.value = settings.power;
  if (settings.reducedEffects != null) effects.value = settings.reducedEffects ? 'reduced' : 'full';
  if (settings.paused != null) paused = settings.paused;
  pause.textContent = paused ? 'Resume' : 'Pause';
  pause.disabled = !on.checked;
}

async function save(settings) {
  try {
    await store.set(settings);
    status.textContent = 'Saved.';
  } catch (error) {
    console.error('[Crawlers] settings could not be saved', error);
    status.textContent = 'Could not save settings.';
  }
}

store.get({ on: true, paused: false, species: 'random', power: 'random', reducedEffects: false })
  .then(updateControls)
  .catch(error => {
    console.error('[Crawlers] settings could not be loaded', error);
    status.textContent = 'Could not load settings.';
  });

on.onchange = () => {
  updateControls({ on: on.checked });
  save({ on: on.checked });
};
sp.onchange = () => save({ species: sp.value });
power.onchange = () => save({ power: power.value });
effects.onchange = () => save({ reducedEffects: effects.value === 'reduced' });
pause.onclick = () => {
  paused = !paused;
  updateControls({ paused });
  save({ paused });
};
document.getElementById('fix').onclick = () => save({ reset: Date.now() });

api.storage.onChanged.addListener(changes => {
  const updated = {};
  if (changes.on) updated.on = changes.on.newValue;
  if (changes.paused) updated.paused = changes.paused.newValue;
  if (changes.species) updated.species = changes.species.newValue;
  if (changes.power) updated.power = changes.power.newValue;
  if (changes.reducedEffects) updated.reducedEffects = changes.reducedEffects.newValue;
  updateControls(updated);
});
