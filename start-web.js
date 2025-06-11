// Web版として起動するためのシンプルなサーバー
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// 静的ファイルの配信（ビルド済みweb-ui）
app.use(express.static(path.join(__dirname, 'packages/web-ui/dist')));

// APIエンドポイント（バックエンドサービスと連携）
app.use(express.json());

// モックAPIエンドポイント
app.get('/api/tasks', (req, res) => {
  res.json([
    { id: '1', title: 'Sample Task 1', completed: false },
    { id: '2', title: 'Sample Task 2', completed: true }
  ]);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA対応（React Router用）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'packages/web-ui/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Secretary Agent Web App running at http://localhost:${PORT}`);
  console.log('📱 Open your browser to view the application');
});