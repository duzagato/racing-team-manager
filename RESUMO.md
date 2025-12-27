# Resumo do Projeto (500 caracteres)

Jogo de gerenciamento F1 em Electron com arquitetura segura: Main Process (lógica/simulação) separado do Renderer (UI) via contextBridge. SQLite com padrão Repository/DAO. Sistema de saves isolados em userData/saves com template.db no ASAR. Parâmetros de equilíbrio em tabela settings do banco. Vite para bundling/HMR. SCSS para estilo. Código do Main Process pode ser ofuscado com javascript-obfuscator no build. Segurança: sandbox, sem nodeIntegration, contextIsolation ativado.
