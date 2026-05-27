// ============================================================
// 预加载脚本 (Preload Script)
// ============================================================
// 作用：在 Electron 主进程和渲染进程之间建立安全桥梁。
//
// 背景：
// - Electron 主进程 (main.js) 拥有 Node.js 完整权限，可操控系统。
// - 渲染进程 (index.html) 是沙箱化的浏览器环境，
//   出于安全考虑，contextIsolation: true、nodeIntegration: false，
//   渲染进程无法直接访问 Node.js API 或 Electron 内部模块。
// - 预加载脚本运行在一个"中间世界"，有权访问部分 Electron API，
//   通过 contextBridge 将有限的、可控的 API 暴露给渲染进程。
//
// 流程：
//   渲染进程调用 window.electronAPI.xxx()
//     → preload 收到，通过 ipcRenderer.invoke 发送 IPC 消息给主进程
//       → 主进程 ipcMain.handle 处理请求，执行系统级操作
//         → 结果返回给 preload → 返回给渲染进程
// ============================================================

const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld(apiKey, api)
// - apiKey: 注入到渲染进程 window 对象上的属性名
// - api: 暴露的方法集合，每个方法返回一个 Promise
// 渲染进程通过 window.electronAPI 调用这些方法
contextBridge.exposeInMainWorld('electronAPI', {

  // 发送桌面通知
  // opts: { title: string, body: string }
  // 调用 main.js 中 ipcMain.handle('show-notification', ...) 的处理函数
  showNotification: (opts) => ipcRenderer.invoke('show-notification', opts),

  // 切换窗口置顶
  // flag: true 置顶 / false 取消置顶
  // 调用 main.js 中 ipcMain.handle('set-always-on-top', ...) 的处理函数
  setAlwaysOnTop: (flag) => ipcRenderer.invoke('set-always-on-top', flag)
});
