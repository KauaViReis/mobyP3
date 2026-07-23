import React, { useEffect, useRef, useState } from 'react';
import { X, Trophy, RotateCcw, Volume2, VolumeX, Gamepad2, Play } from 'lucide-react';

interface MobyArcadeGameProps {
  onClose: () => void;
  onUpdateHighScore?: (score: number) => void;
  playClick?: () => void;
}

export default function MobyArcadeGame({ onClose, onUpdateHighScore, playClick }: MobyArcadeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  // Game Ref variables to avoid stale closures inside requestAnimationFrame
  const gameStateRef = useRef({
    mobyY: 120,
    velocity: 0,
    gravity: 0.5,
    jumpPower: -8.5,
    score: 0,
    highScore: 0,
    gameOver: false,
    gameStarted: false,
    obstacles: [] as { x: number; y: number; width: number; height: number; passed: boolean; type: string }[],
    frameCount: 0
  });

  useEffect(() => {
    const savedHighScore = localStorage.getItem('mobyp3_arcade_highscore');
    if (savedHighScore) {
      const parsed = parseInt(savedHighScore, 10) || 0;
      setHighScore(parsed);
      gameStateRef.current.highScore = parsed;
    }
  }, []);

  const handleJump = () => {
    if (playClick) playClick();

    const state = gameStateRef.current;
    if (!state.gameStarted) {
      state.gameStarted = true;
      state.gameOver = false;
      state.score = 0;
      state.mobyY = 120;
      state.velocity = state.jumpPower;
      state.obstacles = [];
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      return;
    }

    if (state.gameOver) {
      // Restart game
      state.gameStarted = true;
      state.gameOver = false;
      state.score = 0;
      state.mobyY = 120;
      state.velocity = state.jumpPower;
      state.obstacles = [];
      setGameOver(false);
      setScore(0);
      return;
    }

    // Normal jump
    state.velocity = state.jumpPower;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = () => {
      const state = gameStateRef.current;

      // 1. CLEAR CANVAS & DRAW BACKGROUND (Y2K Carbon Grid)
      ctx.fillStyle = '#14161f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = '#21242e';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Ground Line
      ctx.fillStyle = '#f68d1f';
      ctx.fillRect(0, canvas.height - 15, canvas.width, 15);
      ctx.fillStyle = '#ecab37';
      ctx.fillRect(0, canvas.height - 15, canvas.width, 3);

      if (state.gameStarted && !state.gameOver) {
        state.frameCount++;

        // 2. UPDATE MOBY PHYSICS
        state.velocity += state.gravity;
        state.mobyY += state.velocity;

        // Ground Collision
        if (state.mobyY > canvas.height - 40) {
          state.mobyY = canvas.height - 40;
          state.gameOver = true;
          setGameOver(true);
        }

        // Ceiling Collision
        if (state.mobyY < 10) {
          state.mobyY = 10;
          state.velocity = 0;
        }

        // 3. SPAWN OBSTACLES
        if (state.frameCount % 80 === 0) {
          const obsTypes = ['💾 DISQUETE', '📼 FITA K7', '📻 RAD10'];
          const randomType = obsTypes[Math.floor(Math.random() * obsTypes.length)];
          const obstacleHeight = Math.floor(Math.random() * 50) + 30;
          const isTop = Math.random() > 0.5;

          state.obstacles.push({
            x: canvas.width,
            y: isTop ? 0 : canvas.height - 15 - obstacleHeight,
            width: 28,
            height: obstacleHeight,
            passed: false,
            type: randomType
          });
        }

        // 4. MOVE & CHECK COLLISION ON OBSTACLES
        for (let i = 0; i < state.obstacles.length; i++) {
          const obs = state.obstacles[i];
          obs.x -= 3.5;

          // Score check
          if (!obs.passed && obs.x + obs.width < 50) {
            obs.passed = true;
            state.score += 10;
            setScore(state.score);

            if (state.score > state.highScore) {
              state.highScore = state.score;
              setHighScore(state.score);
              localStorage.setItem('mobyp3_arcade_highscore', state.score.toString());
              onUpdateHighScore?.(state.score);
            }
          }

          // AABB Collision Detection (Moby box: x=50, y=mobyY, w=32, h=26)
          const mobyBox = { x: 50, y: state.mobyY, width: 32, height: 26 };
          if (
            mobyBox.x < obs.x + obs.width &&
            mobyBox.x + mobyBox.width > obs.x &&
            mobyBox.y < obs.y + obs.height &&
            mobyBox.y + mobyBox.height > obs.y
          ) {
            state.gameOver = true;
            setGameOver(true);
          }
        }

        // Clean offscreen obstacles
        state.obstacles = state.obstacles.filter((o) => o.x > -40);
      }

      // 5. DRAW OBSTACLES (8-Bit Retro Pillars)
      state.obstacles.forEach((obs) => {
        ctx.fillStyle = '#3d4f97';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeStyle = '#ecab37';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        // Retro Icon Text
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText(obs.type.slice(0, 2), obs.x + 4, obs.y + (obs.height / 2) + 3);
      });

      // 6. DRAW MOBY THE WHALE (8-bit style: 🐋)
      ctx.save();
      ctx.translate(50 + 16, state.mobyY + 13);
      const angle = Math.min(Math.max(state.velocity * 3, -25), 45);
      ctx.rotate((angle * Math.PI) / 180);

      // Pixel Art Moby Body
      ctx.fillStyle = '#4f72d4';
      ctx.fillRect(-16, -12, 32, 24);
      ctx.fillStyle = '#8ba1d4';
      ctx.fillRect(-12, 0, 24, 10);

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, -6, 5, 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(8, -4, 2, 2);

      // Tail
      ctx.fillStyle = '#3d4f97';
      ctx.fillRect(-22, -6, 8, 12);

      ctx.restore();

      // 7. HUD OVERLAY (Score / High Score)
      ctx.fillStyle = '#ecab37';
      ctx.font = '10px "Press Start 2P", monospace, sans-serif';
      ctx.fillText(`SCORE: ${state.score}`, 12, 22);
      ctx.fillText(`HIGH: ${state.highScore}`, canvas.width - 110, 22);

      // Idle Screen Message
      if (!state.gameStarted) {
        ctx.fillStyle = 'rgba(20, 22, 31, 0.85)';
        ctx.fillRect(20, 50, canvas.width - 40, 100);

        ctx.fillStyle = '#f68d1f';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MOBY ARCADE 8-BIT', canvas.width / 2, 80);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('TOQUE OU APERTE [ESPAÇO] PARA JOGAR', canvas.width / 2, 110);
        ctx.textAlign = 'left';
      }

      // Game Over Message
      if (state.gameOver) {
        ctx.fillStyle = 'rgba(20, 22, 31, 0.9)';
        ctx.fillRect(30, 45, canvas.width - 60, 110);

        ctx.fillStyle = '#e11d48';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER!', canvas.width / 2, 75);

        ctx.fillStyle = '#ecab37';
        ctx.font = '10px monospace';
        ctx.fillText(`PONTUAÇÃO: ${state.score}`, canvas.width / 2, 100);
        ctx.fillText('TOQUE PARA REINICIAR DA FICHA [ 🎮 ]', canvas.width / 2, 125);
        ctx.textAlign = 'left';
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 font-sans selection:bg-signal selection:text-white animate-fade-in">
      <div className="bg-periwinkle max-w-lg w-full rounded-md bevel-chassis shadow-2xl overflow-hidden flex flex-col">
        
        {/* Arcade Cabinet Top Bar */}
        <div className="bg-halftone text-surface p-3 flex items-center justify-between border-b-2 border-chrome-indigo">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-amber animate-pulse" />
            <span className="text-xs font-bold text-amber font-pixel uppercase tracking-wider">
              🎮 MOBY ARCADE 8-BIT // FICHA #01
            </span>
          </div>

          <button
            type="button"
            onClick={() => { playClick?.(); onClose(); }}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-3 py-1 rounded-sm bevel-card flex items-center gap-1 shadow-bevel-btn"
          >
            <X className="w-4 h-4" />
            <span>[ X ] SAIR</span>
          </button>
        </div>

        {/* Arcade Canvas Game Container */}
        <div 
          onClick={handleJump}
          className="p-3 bg-carbon cursor-pointer select-none relative flex items-center justify-center border-b-2 border-chrome-indigo"
        >
          <canvas
            ref={canvasRef}
            width={440}
            height={200}
            className="w-full max-w-[440px] h-[200px] rounded border-2 border-signal shadow-inner touch-none"
          />
        </div>

        {/* Arcade Bottom Controls Footer */}
        <div className="p-3 bg-surface flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-carbon">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber" />
            <span className="font-pixel text-[10px]">RECORDES GRAVADOS NO MEMORY CARD</span>
          </div>

          <button
            type="button"
            onClick={handleJump}
            className="min-h-[44px] bg-signal hover:bg-signal/90 active:translate-y-0.5 text-white px-4 py-2 rounded-sm bevel-card font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-bevel-btn"
          >
            <Play className="w-4 h-4" />
            <span>PULAR / AÇÃO [ESPAÇO]</span>
          </button>
        </div>

      </div>
    </div>
  );
}
