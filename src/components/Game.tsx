import React, { useEffect, useRef, useState } from 'react';
import { useInterval } from '../hooks/useInterval';
import { useGameSounds } from '../hooks/useGameSounds';
import { Background } from './Background';
import { Bird } from './Bird';
import { ParticleSystem } from './ParticleSystem';
import { Pipe as PipeComponent } from './Pipe';
import { Coin } from './Coin';
import { ScoreDisplay } from './ScoreDisplay';
import { Particle, Pipe, PopupText } from '../types/gameTypes';
import { getLeaderboard, addLeaderboardEntry, getSelectedSkinId, setSelectedSkinId, addCoins } from '../utils/storage';
import { BIRD_SKINS } from '../constants/skinConstants';
import {
  BIRD_HEIGHT,
  BIRD_WIDTH,
  BIRD_X,
  GRAVITY,
  JUMP_FORCE,
  PIPE_GAP,
  PIPE_SPEED,
  PIPE_WIDTH,
  PIPE_CONFIG,
  HITBOX_OFFSET,
  INITIAL_BIRD_POSITION,
  INITIAL_BIRD_VELOCITY,
  MAX_VELOCITY,
  GROUND_HEIGHT,
} from '../constants/gameConstants';

export default function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [birdPosition, setBirdPosition] = useState(INITIAL_BIRD_POSITION);
  const [birdVelocity, setBirdVelocity] = useState(INITIAL_BIRD_VELOCITY);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<number[]>(getLeaderboard());
  const [gameOver, setGameOver] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [invincibleFrames, setInvincibleFrames] = useState(0);
  const [selectedSkinId, setSelectedSkinIdState] = useState(getSelectedSkinId());
  
  // Economy & Polish states
  const [coinsGathered, setCoinsGathered] = useState(0);
  const [combo, setCombo] = useState(0);
  const [popups, setPopups] = useState<PopupText[]>([]);
  const [screenShake, setScreenShake] = useState(false);
  
  const { playJump, playScore, playGameOver, playCoin, playPerfect } = useGameSounds();
  const gameRef = useRef<HTMLDivElement>(null);

  const activeSkin = BIRD_SKINS.find(s => s.id === selectedSkinId) ?? BIRD_SKINS[0];
  const birdOpacity = invincibleFrames > 0 && Math.floor(invincibleFrames / 5) % 2 !== 0 ? 0.25 : 1;

  const handleSelectSkin = (id: string) => {
    setSelectedSkinId(id);
    setSelectedSkinIdState(id);
  };
  const birdPosRef = useRef(INITIAL_BIRD_POSITION);
  const particleIdRef = useRef(0);

  const spawnFeathers = (x: number, y: number): Particle[] =>
    Array.from({ length: 5 }, () => ({
      id: particleIdRef.current++,
      x: x + BIRD_WIDTH / 2,
      y: y + BIRD_HEIGHT / 2,
      vx: -(Math.random() * 2.5 + 0.5),
      vy: (Math.random() - 0.5) * 2,
      life: 1,
      color: ['#fbbf24', '#f97316', '#ffffff'][Math.floor(Math.random() * 3)],
      size: Math.random() * 3 + 3,
      type: 'feather' as const,
    }));

  const spawnExplosion = (x: number, y: number): Particle[] =>
    Array.from({ length: 14 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1.5;
      return {
        id: particleIdRef.current++,
        x: x + BIRD_WIDTH / 2,
        y: y + BIRD_HEIGHT / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: ['#fbbf24', '#f97316', '#ef4444', '#ffffff', '#fed7aa'][Math.floor(Math.random() * 5)],
        size: Math.random() * 5 + 3,
        type: 'explosion' as const,
      };
    });

  const generatePipe = (x: number): Pipe => ({
    x,
    height: Math.random() * (PIPE_CONFIG.MAX_HEIGHT - PIPE_CONFIG.MIN_HEIGHT) + PIPE_CONFIG.MIN_HEIGHT,
    passed: false,
    hasCoin: Math.random() > 0.4, // 60% chance to spawn a coin
  });

  const checkCollision = (birdPos: number, pipes: Pipe[]): boolean => {
    const birdHitboxX = BIRD_X + HITBOX_OFFSET.X;
    const birdHitboxY = birdPos + HITBOX_OFFSET.Y;
    const birdHitboxWidth = BIRD_WIDTH - (HITBOX_OFFSET.X * 2);
    const birdHitboxHeight = BIRD_HEIGHT - (HITBOX_OFFSET.Y * 2);

    return pipes.some(pipe => {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      if (birdHitboxX + birdHitboxWidth > pipeLeft && birdHitboxX < pipeRight) {
        const topPipeBottom = pipe.height;
        const bottomPipeTop = pipe.height + PIPE_GAP;
        
        return birdHitboxY < topPipeBottom || birdHitboxY + birdHitboxHeight > bottomPipeTop;
      }
      return false;
    });
  };

  useEffect(() => {
    if (gameStarted && pipes.length === 0) {
      setPipes([generatePipe(PIPE_CONFIG.SPAWN_X)]);
    }
  }, [gameStarted]);

  useInterval(
    () => {
      if (gameOver) return;

      // Apply gentler gravity at the start
      const gravityMultiplier = !gameStarted ? 0.5 : 1;
      const newBirdVelocity = Math.min(birdVelocity + (GRAVITY * gravityMultiplier), MAX_VELOCITY);
      const newBirdPosition = birdPosition + newBirdVelocity;
      
      setBirdVelocity(newBirdVelocity);
      setBirdPosition(newBirdPosition);
      birdPosRef.current = newBirdPosition;

      const currentSpeed = PIPE_SPEED + Math.floor(score / 5) * 0.3;
      setScrollOffset(prev => prev + currentSpeed);

      setPopups(prev => 
        prev.map(p => ({ ...p, y: p.y - 1, life: p.life - 1 })).filter(p => p.life > 0)
      );

      const addPopup = (text: string, color: string, x: number, y: number) => {
        setPopups(prev => [...prev, { id: particleIdRef.current++, text, color, x, y, life: 60 }]);
      };

      const newPipes = pipes.map(pipe => {
        const newX = pipe.x - currentSpeed;
        
        if (!pipe.passed && newX + PIPE_WIDTH < BIRD_X) {
          let extraPoints = 0;
          
          // Check for Perfect Hit / Coin
          const gapCenter = pipe.height + PIPE_GAP / 2;
          const birdCenter = newBirdPosition + BIRD_HEIGHT / 2;
          const dist = Math.abs(gapCenter - birdCenter);
          
          if (dist < 35) { // Perfect Hit!
            extraPoints = 1;
            setCombo(c => c + 1);
            addPopup('Perfect!', '#c084fc', BIRD_X, newBirdPosition - 20);
            playPerfect();
          } else {
            setCombo(0);
            playScore();
          }

          if (pipe.hasCoin && dist < 60) {
             setCoinsGathered(c => c + 1);
             addPopup('+1', '#fbbf24', BIRD_X + 20, newBirdPosition);
             playCoin();
          }

          const newScore = score + 1 + extraPoints;
          setScore(newScore);
          setScoreFlash(true);
          setTimeout(() => setScoreFlash(false), 300);

          return { ...pipe, x: newX, passed: true };
        }
        
        return { ...pipe, x: newX };
      }).filter(pipe => pipe.x > -PIPE_WIDTH);

      if (newPipes.length < 3) {
        const lastPipe = newPipes[newPipes.length - 1];
        if (lastPipe && lastPipe.x < PIPE_CONFIG.SPAWN_X - PIPE_CONFIG.SPAWN_DISTANCE) {
          newPipes.push(generatePipe(PIPE_CONFIG.SPAWN_X));
        }
      }

      setPipes(newPipes);

      setParticles(prev =>
        prev
          .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.12, life: p.life - 0.035 }))
          .filter(p => p.life > 0)
      );

      if (invincibleFrames > 0) {
        setInvincibleFrames(prev => prev - 1);
        return;
      }

      if (
        checkCollision(newBirdPosition, newPipes) ||
        newBirdPosition > 500 - GROUND_HEIGHT - BIRD_HEIGHT ||
        newBirdPosition < 0
      ) {
        setParticles(prev => [...prev, ...spawnExplosion(BIRD_X, newBirdPosition)]);
        if (score > (leaderboard[0] ?? 0)) setIsNewHighScore(true);
        setLeaderboard(addLeaderboardEntry(score));
        if (coinsGathered > 0) addCoins(coinsGathered);
        
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 400);

        setGameOver(true);
        playGameOver();
      }
    },
    gameStarted && !gameOver ? 16 : null
  );

  const resetGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setBirdPosition(INITIAL_BIRD_POSITION);
    setBirdVelocity(INITIAL_BIRD_VELOCITY);
    setPipes([generatePipe(PIPE_CONFIG.SPAWN_X)]);
    setScore(0);
    setCoinsGathered(0);
    setCombo(0);
    setPopups([]);
    setIsNewHighScore(false);
    setParticles([]);
    setInvincibleFrames(90);
  };

  const handleClick = () => {
    if (!gameStarted || gameOver) {
      resetGame();
    } else {
      setBirdVelocity(JUMP_FORCE);
      playJump();
      setParticles(prev => [...prev, ...spawnFeathers(BIRD_X, birdPosRef.current)]);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameStarted, gameOver]);

  return (
    <div className="flex items-center justify-center pt-8 pb-4">
      <div 
        className={`relative w-[400px] h-[500px] rounded-lg shadow-2xl overflow-hidden cursor-pointer ${screenShake ? 'animate-shake' : ''}`}
        onClick={handleClick}
        ref={gameRef}
      >
        <Background scrollOffset={scrollOffset} score={score} />
        <Bird position={birdPosition} velocity={birdVelocity} skin={activeSkin} opacity={birdOpacity} />
        <ParticleSystem particles={particles} />
        
        {pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            <PipeComponent x={pipe.x} height={pipe.height} />
            {pipe.hasCoin && !pipe.passed && (
              <Coin x={pipe.x + PIPE_WIDTH / 2 - 12} y={pipe.height + PIPE_GAP / 2 - 12} />
            )}
          </React.Fragment>
        ))}

        {popups.map(p => (
          <div
            key={p.id}
            className="absolute font-bold text-lg pointer-events-none transition-all duration-75 shadow-text"
            style={{ left: p.x, top: p.y, color: p.color, opacity: p.life / 60 }}
          >
            {p.text}
          </div>
        ))}

        {combo >= 2 && !gameOver && (
          <div className="absolute top-16 left-0 right-0 text-center pointer-events-none">
             <span className="text-xl font-bold text-orange-400 animate-pulse shadow-text">Combo x{combo}</span>
          </div>
        )}

        <ScoreDisplay
          score={score}
          leaderboard={leaderboard}
          isNewHighScore={isNewHighScore}
          gameOver={gameOver}
          gameStarted={gameStarted}
          scoreFlash={scoreFlash}
          selectedSkinId={selectedSkinId}
          onSelectSkin={handleSelectSkin}
          coinsGathered={coinsGathered}
          combo={combo}
        />
      </div>
    </div>
  );
}