<div align="center">

# 🐋 mobyP3 (v3.0 Pro Edition)
### *Web App de Download de Vídeos & Músicas de Alta Performance | Nintendo 2001 Hardware Edition*

![Publisher](https://img.shields.io/badge/Licensed_by-BRUH_LTDA-f68d1f?style=for-the-badge&logo=nintendo)
![Status](https://img.shields.io/badge/Status-100%25_Funcional-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

<br />

```text
 ╔═══════════════════════════════════════════════════════════════════════════╗
 ║  __  __  ____  ____  _  _  ____  ____                                   ║
 ║ (  \/  )(  _ \(  _ \( \/ )(  _ \____)                                   ║
 ║  )    (  ) _ ( ) _ ( \  /  )___/ _  _                                   ║
 ║ (_/\/\_)(____/(____/  \/  (__)  (_)(_)  NINTENDO.COM CIRCA 2001 CHASSIS ║
 ╚═══════════════════════════════════════════════════════════════════════════╝
```

<p align="center">
  <b>Baixe MP3 em 320kbps, Vídeos em 1080p / 4K (com som mesclado), Playlists inteiras e Recortes de áudio/vídeo.</b><br />
  <i>Sem vírus, anúncios ou pop-ups. Construído como um console de videogame dos anos 2000.</i>
</p>

[✨ Funcionalidades](#-funcionalidades-de-destaque) •
[🕹️ Design System](#️-design-system-nintendo-2001) •
[🚀 Como Executar](#-como-executar-o-projeto) •
[🛠️ Arquitetura](#%EF%B8%8F-arquitetura-do-sistema)

</div>

---

## ✨ Funcionalidades de Destaque

### 🎮 1. Modal de Previsualização & Player Integrado
- **Preview Rápido 360p:** Assista ao vídeo com som sincronizado no player embutido antes de iniciar o download.
- **Download Direto (Blob Fetch):** Baixa os arquivos como Blob no navegador sem redirecionar para páginas externas ou abrir abas da CDN do YouTube.

### 🎬 2. Motor de Mesclagem 4K HD (FFmpeg)
- Extrai resoluções de **360p até 4K (2160p Ultra HD)**.
- Mescla automaticamente faixas DASH de áudio e vídeo em resolução máxima usando **FFmpeg** no backend FastAPI.

### 🎶 3. Suporte a Playlists Completas (Batch Download)
- Reconhece links de playlists do YouTube e Soundcloud.
- Painel de seleção em lote com checkboxes para marcar faixas individuais ou baixar o álbum completo.

### ✂️ 4. Mini Editor & Recorte de Mídia (Audio/Video Trimming)
- Permite recortar trechos específicos de áudio ou vídeo (ex: 00:30 até 01:45) diretamente na modal de preview para criar ringtones ou samples.

### 🖼️ 5. Capas em Alta Resolução (4K) & Legendas (.srt / .vtt)
- Baixa a imagem da capa da mídia em máxima resolução (Thumbnails 4K).
- Exporta legendas sincronizadas em arquivos `.srt` e `.vtt`.

### 💾 6. Cartão de Memória Retrô (Memory Card PS1 / GameCube)
- Salva os últimos 15 links buscados no `localStorage` do navegador com atalhos de `[▶ RECARREGAR]`, `📋 Copiar` e `[FORMATAR CARD]`.

### 🔊 7. Sintetizador 8-Bit Native (Web Audio API)
- Efeitos sonoros de cliques mecânicos, arpejos de sucesso e bips 8-bit gerados sem arquivos `.mp3` pesados, com controle de Mute `[ 🔊 SFX: ON/OFF ]`.

---

## 🕹️ Design System Nintendo 2001

A interface do **mobyP3** foi construída simulando a carcaça de hardware do site oficial da **Nintendo.com do ano 2001**:

- 🎨 **Periwinkle Metallic (`#7a8aba`):** Corpo principal do chassi de metal escovado.
- 🖤 **Carbon Navy (`#21242e`):** Camada de comando superior com textura *halftone dot-matrix*.
- 🟠 **Signal Orange (`#f68d1f`):** Botões de CTA e ação de avanço.
- 🟡 **Amber (`#ecab37`):** Botões utilitários "Colar Link", badges de formato e chips de ferramentas.
- 📐 **Biséis & Chanfros 3D:** Bordas em alto-relevo (`bevel-chassis`) e caixas afundadas (`bevel-inset`).
- 🐋 **Mascote Moby Reativo:** Mascote com 4 estados animados (💤 Repouso, 🕶️ Escaneando, 🎧 Pronto, ❓ Erro).

---

## 🛠️ Arquitetura do Sistema

```text
┌───────────────────────────────────────┐      ┌────────────────────────────────────────┐
│     FRONTEND (Next.js / React + Vite) │      │      BACKEND (Python / FastAPI)        │
│  - Estética Nintendo 2001 Y2K         │ ───► │  - FastAPI + Uvicorn                   │
│  - Web Audio API (Sons 8-Bit)         │ HTTP │  - yt-dlp + FFmpeg                     │
│  - Storage Local (Memory Card 8MB)    │      │  - Cache de Metadados em Memória      │
└───────────────────────────────────────┘      └────────────────────────────────────────┘
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (v18+)
- **Python** (v3.11+)

---

### 1. Clonar o Repositório

```bash
git clone https://github.com/KauaViReis/mobyP3.git
cd mobyP3
```

---

### 2. Iniciar o Backend (FastAPI)

```bash
cd backend
python -m pip install -r requirements.txt
python main.py
```
> 🟢 O backend iniciará em `http://localhost:8000`

---

### 3. Iniciar o Frontend (React / Vite)

Em outra janela de terminal:

```bash
cd frontend
npm install
npm run dev
```
> 🌐 O frontend iniciará em `http://localhost:3000`

---

## 📂 Estrutura de Arquivos

```text
mobyP3/
├── backend/
│   ├── main.py              # API FastAPI com yt-dlp, FFmpeg, cache e proxy download
│   ├── Dockerfile           # Imagem Docker para implantação no Render / Koyeb
│   └── requirements.txt     # Dependências Python
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BootScreen.tsx           # Tela de abertura com barra LED
│   │   │   ├── MobyMascot.tsx           # Mascote reativo com 4 estados
│   │   │   ├── UrlInputGroup.tsx        # Input de URL + auto-detect de plataforma
│   │   │   ├── MediaPreviewCard.tsx     # Player de amostra de áudio
│   │   │   ├── DownloadColumn.tsx       # Colunas de download com bisel Inset
│   │   │   ├── ModalPreview.tsx         # Modal com Player + Recorte + Capas/Legendas
│   │   │   ├── PlaylistBatchPanel.tsx   # Painel de download em lote de playlists
│   │   │   ├── MemoryCardPanel.tsx      # Cartão de memória PS1/GameCube (15 slots)
│   │   │   ├── InstructionBookletModal.tsx # Manual de Instruções & Guia [ ! ]
│   │   │   └── RpgToast.tsx             # Notificações estilo RPG
│   │   ├── hooks/
│   │   │   └── useSFX.ts                # Sintetizador de sons 8-bit Web Audio API
│   │   ├── App.tsx                      # Chassi principal da aplicação
│   │   └── index.css                    # Tokens visuais Nintendo 2001
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 📜 Licença & Créditos

- **Publisher & Brand:** Licensed by **BRUH LTDA**
- **Copyright:** © 2001-2026 BRUH ENTERTAINMENT CO. ALL RIGHTS RESERVED.
- **Licença do Código:** [MIT License](LICENSE)

<div align="center">
  <sub>Desenvolvido com 💙 por Kauã Viana Reis. Viva a era de ouro da web Y2K! 🎮🐋</sub>
</div>
