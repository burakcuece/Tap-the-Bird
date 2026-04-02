import React, { useEffect, useRef, useState } from 'react';
import { useInterval } from '../hooks/useInterval';
import { useGameSounds } from '../hooks/useGameSounds';
import { Background } from './Background';
import { Bird } from './Bird';
import { ParticleSystem } from './ParticleSystem';
import { Pipe as PipeComponent } from './Pipe';
import { Coin } from './Coin';
import { PowerUpItem } from './PowerUpItem';
import { PauseMenu } from './PauseMenu';
import { ScoreDisplay } from './ScoreDisplay';
import { ActivePowerUp, Particle, Pipe, PopupText, PowerUpType } from '../types/gameTypes';
import { QuestProgress } from '../types/questTypes';
import {
  getLeaderboard, addLeaderboardEntry, getSelectedSkinId, setSelectedSkinId,
  addCoins, getQuestProgress, incrementQuest,
} from '../utils/storage';
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

const POWER_UP_DURATION = 600; // ~10 seconds at 60fps
const SHRINK_SCALE = 0.5;
const MAGNET_RADIUS = 100;

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

  // Economy & Polish
  const [coinsGathered, setCoinsGathered] = useState(0);
  const [combo, setCombo] = useState(0);
  const [popups, setPopups] = useState<PopupText[]>([]);
  const [screenShake, setScreenShake] = useState(false);

  // Pause
  const [paused, setPaused] = useState(false);

  // Power-ups
  const [activePowerUp, setActivePowerUp] = useState<ActivePowerUp | null>(null);
  const [shieldBroken, setShieldBroken] = useState(false); // used to suppress 1 collision

  // Quests
  const [questProgress, setQuestProgress] = useState<QuestProgress[]>(getQuestProgress());
  const roundsPlayedRef = useRef(0);
  const powerUpsUsedRef = useRef(0);
  const maxComboThisRunRef = useRef(0);

  const { playJump, playScore, playGameOver, playCoin, playPerfect } = useGameSounds();
  const gameRef = useRef<HTMLDivElement>(null);

  const activeSkin = BIRD_SKINS.find(s => s.id === selectedSkinId) ?? BIRD_SKINS[0];
  const birdOpacity = invincibleFrames > 0 && Math.floor(invincibleFrames / 5) % 2 !== 0 ? 0.25 : 1;
  const shrinkScale = activePowerUp?.type === 'shrink' ? SHRINK_SCALE : 1;

  const handleSelectSkin = (id: string) => {
    setSelectedSkinId(id);
    setSelectedSkinIdState(id);
  };

  const birdPosRef = useRef(INITIAL_BIRD_POSITION);
  const particleIdRef = useRef(0);
  const scoreRef = useRef(0);
  const activePowerUpRef = useRef<ActivePowerUp | null>(null);
  const shieldBrokenRef = useRef(false);
  const pipesRef = useRef<Pipe[]>([]);
  const coinsGatheredRef = useRef(0);

  // Keep refs in sync
  useEffect(() => { activePowerUpRef.current = activePowerUp; }, [activePowerUp]);
  useEffect(() => { shieldBrokenRef.current = shieldBroken; }, [shieldBroken]);

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

  const spawnShieldBurst = (x: number, y: number): Particle[] =>
    Array.from({ length: 12 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      return {
        id: particleIdRef.current++,
        x: x + BIRD_WIDTH / 2,
        y: y + BIRD_HEIGHT / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: ['#38bdf8', '#7dd3fc', '#ffffff', '#bae6fd'][Math.floor(Math.random() * 4)],
        size: Math.random() * 4 + 2,
        type: 'explosion' as const,
      };
    });

  const generatePipe = (x: number): Pipe => {
    // ~15% chance to spawn a power-up instead of coin (only if no other power-up active)
    const roll = Math.random();
    const hasPowerUp = !activePowerUpRef.current && roll < 0.15;
    const powerUps: PowerUpType[] = ['magnet', 'shield', 'shrink'];
    return {
      x,
      height: Math.random() * (PIPE_CONFIG.MAX_HEIGHT - PIPE_CONFIG.MIN_HEIGHT) + PIPE_CONFIG.MIN_HEIGHT,
      passed: false,
      hasCoin: !hasPowerUp && roll < 0.60,
      powerUp: hasPowerUp ? powerUps[Math.floor(Math.random() * powerUps.length)] : undefined,
    };
  };

  const checkCollision = (birdPos: number, pipes: Pipe[]): boolean => {
    const scale = activePowerUpRef.current?.type === 'shrink' ? SHRINK_SCALE : 1;
    const shrinkOffset = ((1 - scale) * BIRD_WIDTH) / 2;

    const birdHitboxX = BIRD_X + HITBOX_OFFSET.X + shrinkOffset;
    const birdHitboxY = birdPos + HITBOX_OFFSET.Y + shrinkOffset;
    const birdHitboxWidth = (BIRD_WIDTH - HITBOX_OFFSET.X * 2) * scale;
    const birdHitboxHeight = (BIRD_HEIGHT - HITBOX_OFFSET.Y * 2) * scale;

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
      const first = generatePipe(PIPE_CONFIG.SPAWN_X);
      setPipes([first]);
      pipesRef.current = [first];
    }
  }, [gameStarted]);

  // Quest helpers (safe to call inside the game loop — use refs)
  const questUpdateQueue = useRef<Array<() => void>>([]);

  const queueQuestIncrement = (id: import('../types/questTypes').QuestId, amount = 1) => {
    questUpdateQueue.current.push(() => {
      const { quests } = incrementQuest(id, amount);
      setQuestProgress(quests);
    });
  };

  useInterval(
    () => {
      if (gameOver) return;

      // Flush deferred quest updates
      while (questUpdateQueue.current.length > 0) {
        questUpdateQueue.current.shift()?.();
      }

      const gravityMultiplier = !gameStarted ? 0.5 : 1;
      const newBirdVelocity = Math.min(birdVelocity + GRAVITY * gravityMultiplier, MAX_VELOCITY);
      const newBirdPosition = birdPosition + newBirdVelocity;
      setBirdVelocity(newBirdVelocity);
      setBirdPosition(newBirdPosition);
      birdPosRef.current = newBirdPosition;

      const currentSpeed = PIPE_SPEED + Math.floor(scoreRef.current / 5) * 0.3;
      setScrollOffset(prev => prev + currentSpeed);

      setPopups(prev =>
        prev.map(p => ({ ...p, y: p.y - 1, life: p.life - 1 })).filter(p => p.life > 0)
      );

      const addPopup = (text: string, color: string, x: number, y: number) => {
        setPopups(prev => [...prev, { id: particleIdRef.current++, text, color, x, y, life: 60 }]);
      };

      // Power-up countdown
      setActivePowerUp(prev => {
        if (!prev) return null;
        const next = { ...prev, framesLeft: prev.framesLeft - 1 };
        if (next.framesLeft <= 0) {
          activePowerUpRef.current = null;
          return null;
        }
        activePowerUpRef.current = next;
        return next;
      });

      const newPipes = pipes.map(pipe => {
        const newX = pipe.x - currentSpeed;

        // Magnet: pull coin/power-up x towards bird
        const isMagnetActive = activePowerUpRef.current?.type === 'magnet';

        if (!pipe.passed && newX + PIPE_WIDTH < BIRD_X) {
          let extraPoints = 0;

          const gapCenter = pipe.height + PIPE_GAP / 2;
          const birdCenter = newBirdPosition + BIRD_HEIGHT / 2;
          const dist = Math.abs(gapCenter - birdCenter);

          if (dist < 35) {
            extraPoints = 1;
            setCombo(c => {
              const next = c + 1;
              if (next > maxComboThisRunRef.current) maxComboThisRunRef.current = next;
              return next;
            });
            addPopup('Perfect!', '#c084fc', BIRD_X, newBirdPosition - 20);
            playPerfect();
          } else {
            setCombo(0);
            playScore();
          }

          if (pipe.hasCoin && dist < 60) {
            const earned = 1;
            coinsGatheredRef.current += earned;
            setCoinsGathered(c => c + earned);
            addPopup('+1', '#fbbf24', BIRD_X + 20, newBirdPosition);
            playCoin();
          }

          // Collect power-up when passing pipe gap
          if (pipe.powerUp && dist < 80) {
            const pu = pipe.powerUp;
            const newActive: ActivePowerUp = { type: pu, framesLeft: POWER_UP_DURATION };
            setActivePowerUp(newActive);
            activePowerUpRef.current = newActive;
            powerUpsUsedRef.current += 1;
            queueQuestIncrement('use_powerup');

            const labels: Record<PowerUpType, string> = { magnet: '🧲 Magnet!', shield: '🛡 Schild!', shrink: '🍄 Klein!' };
            const colors: Record<PowerUpType, string> = { magnet: '#a78bfa', shield: '#38bdf8', shrink: '#4ade80' };
            addPopup(labels[pu], colors[pu], BIRD_X - 10, newBirdPosition - 25);
          }

          const newScore = scoreRef.current + 1 + extraPoints;
          scoreRef.current = newScore;
          setScore(newScore);
          setScoreFlash(true);
          setTimeout(() => setScoreFlash(false), 300);

          return { ...pipe, x: newX, passed: true };
        }

        // Magnet attraction: if a coin is still in-gap and magnet active, nudge x toward bird
        if (!pipe.passed && pipe.hasCoin && isMagnetActive) {
          const coinX = pipe.x + PIPE_WIDTH / 2;
          const coinY = pipe.height + PIPE_GAP / 2;
          const dx = BIRD_X - coinX;
          const dy = newBirdPosition - coinY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < MAGNET_RADIUS) {
            return { ...pipe, x: newX + 1.5 }; // bias toward bird by slowing retreat
          }
        }

        return { ...pipe, x: newX };
      }).filter(pipe => pipe.x > -PIPE_WIDTH);

      if (newPipes.length < 3) {
        const lastPipe = newPipes[newPipes.length - 1];
        if (!lastPipe || lastPipe.x < PIPE_CONFIG.SPAWN_X - PIPE_CONFIG.SPAWN_DISTANCE) {
          newPipes.push(generatePipe(PIPE_CONFIG.SPAWN_X));
        }
      }

      setPipes(newPipes);
      pipesRef.current = newPipes;

      setParticles(prev =>
        prev
          .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.12, life: p.life - 0.035 }))
          .filter(p => p.life > 0)
      );

      if (invincibleFrames > 0) {
        setInvincibleFrames(prev => prev - 1);
        return;
      }

      const colliding =
        checkCollision(newBirdPosition, newPipes) ||
        newBirdPosition > 500 - GROUND_HEIGHT - BIRD_HEIGHT ||
        newBirdPosition < 0;

      if (colliding) {
        // Shield absorbs ONE collision
        if (activePowerUpRef.current?.type === 'shield' && !shieldBrokenRef.current) {
          setShieldBroken(true);
          shieldBrokenRef.current = true;
          setActivePowerUp(null);
          activePowerUpRef.current = null;
          setParticles(prev => [...prev, ...spawnShieldBurst(BIRD_X, newBirdPosition)]);
          setInvincibleFrames(60); // brief grace period after shield breaks
          addPopup('Schild gebrochen!', '#38bdf8', BIRD_X - 20, newBirdPosition - 30);
          return;
        }

        setParticles(prev => [...prev, ...spawnExplosion(BIRD_X, newBirdPosition)]);
        if (scoreRef.current > (leaderboard[0] ?? 0)) setIsNewHighScore(true);
        setLeaderboard(addLeaderboardEntry(scoreRef.current));
        if (coinsGatheredRef.current > 0) addCoins(coinsGatheredRef.current);

        // Quest: score_10
        if (scoreRef.current >= 10) queueQuestIncrement('score_10', 10);

        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 400);

        setGameOver(true);
        playGameOver();
      }
    },
    gameStarted && !gameOver && !paused ? 16 : null
  );

  const resetGame = () => {
    // Quest: play_5_rounds
    roundsPlayedRef.current += 1;
    queueQuestIncrement('play_5_rounds');

    scoreRef.current = 0;
    coinsGatheredRef.current = 0;
    maxComboThisRunRef.current = 0;

    setGameStarted(true);
    setGameOver(false);
    setBirdPosition(INITIAL_BIRD_POSITION);
    setBirdVelocity(INITIAL_BIRD_VELOCITY);
    const first = generatePipe(PIPE_CONFIG.SPAWN_X);
    setPipes([first]);
    pipesRef.current = [first];
    setScore(0);
    setCoinsGathered(0);
    setCombo(0);
    setPopups([]);
    setIsNewHighScore(false);
    setParticles([]);
    setInvincibleFrames(90);
    setActivePowerUp(null);
    activePowerUpRef.current = null;
    setShieldBroken(false);
    shieldBrokenRef.current = false;
  };

  const handleClick = () => {
    if (paused) return; // clicks do nothing while paused
    if (!gameStarted || gameOver) {
      resetGame();
    } else {
      setBirdVelocity(JUMP_FORCE);
      playJump();
      setParticles(prev => [...prev, ...spawnFeathers(BIRD_X, birdPosRef.current)]);
    }
  };

  // Quest: combo_3 — tracked after combo changes
  useEffect(() => {
    if (combo >= 3) {
      queueQuestIncrement('combo_3', combo);
    }
  }, [combo]);

  // Quest: collect_20_coins — tracked as coins accumulate
  useEffect(() => {
    if (coinsGathered > 0) {
      queueQuestIncrement('collect_20_coins', 1);
    }
  }, [coinsGathered]);

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
        <Bird
          position={birdPosition}
          velocity={birdVelocity}
          skin={activeSkin}
          opacity={birdOpacity}
          activePowerUp={activePowerUp}
          shrinkScale={shrinkScale}
        />
        <ParticleSystem particles={particles} />

        {pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            <PipeComponent x={pipe.x} height={pipe.height} />
            {pipe.hasCoin && !pipe.passed && (
              <Coin x={pipe.x + PIPE_WIDTH / 2 - 12} y={pipe.height + PIPE_GAP / 2 - 12} />
            )}
            {pipe.powerUp && !pipe.passed && (
              <PowerUpItem
                type={pipe.powerUp}
                x={pipe.x + PIPE_WIDTH / 2 - 14}
                y={pipe.height + PIPE_GAP / 2 - 14}
              />
            )}
          </React.Fragment>
        ))}

        {/* Active power-up timer bar */}
        {activePowerUp && (
          <div className="absolute bottom-[102px] left-3 right-3 pointer-events-none">
            <div className="h-1.5 rounded-full bg-white bg-opacity-20 overflow-hidden">
              <div
                className="h-full rounded-full transition-none"
                style={{
                  width: `${(activePowerUp.framesLeft / POWER_UP_DURATION) * 100}%`,
                  background: activePowerUp.type === 'shield' ? '#38bdf8'
                    : activePowerUp.type === 'magnet' ? '#a78bfa'
                    : '#4ade80',
                }}
              />
            </div>
          </div>
        )}

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

        {/* Pause button — only visible while playing */}
        {gameStarted && !gameOver && (
          <button
            className="absolute top-3 left-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black bg-opacity-40 text-white text-xs font-bold pointer-events-auto"
            onClick={e => { e.stopPropagation(); setPaused(p => !p); }}
          >
            {paused ? '▶' : '⏸'}
          </button>
        )}

        {/* Pause overlay */}
        {paused && (
          <PauseMenu
            onResume={() => setPaused(false)}
            onMainMenu={() => {
              setPaused(false);
              setGameStarted(false);
              setGameOver(false);
              setBirdPosition(INITIAL_BIRD_POSITION);
              setBirdVelocity(INITIAL_BIRD_VELOCITY);
              setPipes([]);
              setScore(0);
              scoreRef.current = 0;
              setParticles([]);
              setActivePowerUp(null);
              activePowerUpRef.current = null;
            }}
            selectedSkinId={selectedSkinId}
            onSelectSkin={handleSelectSkin}
            questProgress={questProgress}
            onQuestsUpdate={setQuestProgress}
          />
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
          questProgress={questProgress}
          onQuestsUpdate={setQuestProgress}
        />
      </div>
    </div>
  );
}
