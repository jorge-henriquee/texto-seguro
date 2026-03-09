
// when using `"withGlobalTauri": true`, you may use
const { getCurrentWindow } = window.__TAURI__.window;

const appWindow = getCurrentWindow();

document
  .getElementById('btn_minimizar_window')
  ?.addEventListener('click', () => appWindow.minimize());
document
  .getElementById('btn_max_window')
  ?.addEventListener('click', () => appWindow.toggleMaximize());
document
  .getElementById('btn_close_window')
  ?.addEventListener('click', () => appWindow.close());