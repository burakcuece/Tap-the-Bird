import React, { useEffect, useRef, useState } from 'react';
import { useInterval } from '../hooks/useInterval';
import { useGameSounds } from '../hooks/useGameSounds';
import { Background } from './Background';
import { Bird } from './Bird';
import { ParticleSystem } from './ParticleSystem';
import { Pipe as PipeComponent } from './Pipe';
import { ScoreDisplay } from './ScoreDisplay';
import { Particle, Pipe } from '../types/gameTypes';
import { getLeaderboard, addLeaderboardEntry } from '../utils/storage';
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
  const { playJump, playScore, playGameOver } = useGameSounds();
  const gameRef = useRef<HTMLDivElement>(null);
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

      const newPipes = pipes.map(pipe => {
        const newX = pipe.x - currentSpeed;
        
        if (!pipe.passed && newX + PIPE_WIDTH < BIRD_X) {
          const newScore = score + 1;
          setScore(newScore);
          playScore();
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

      if (
        checkCollision(newBirdPosition, newPipes) ||
        newBirdPosition > 500 - GROUND_HEIGHT - BIRD_HEIGHT ||
        newBirdPosition < 0
      ) {
        setParticles(prev => [...prev, ...spawnExplosion(BIRD_X, newBirdPosition)]);
        if (score > (leaderboard[0] ?? 0)) setIsNewHighScore(true);
        setLeaderboard(addLeaderboardEntry(score));
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
    setIsNewHighScore(false);
    setParticles([]);
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
        className="relative w-[400px] h-[500px] rounded-lg shadow-2xl overflow-hidden cursor-pointer"
        onClick={handleClick}
        ref={gameRef}
      >
        <Background scrollOffset={scrollOffset} />
        <Bird position={birdPosition} velocity={birdVelocity} />
        <ParticleSystem particles={particles} />
        
        {pipes.map((pipe, index) => (
          <PipeComponent key={index} x={pipe.x} height={pipe.height} />
        ))}

        <ScoreDisplay
          score={score}
          leaderboard={leaderboard}
          isNewHighScore={isNewHighScore}
          gameOver={gameOver}
          gameStarted={gameStarted}
          scoreFlash={scoreFlash}
        />
      </div>
    </div>
  );
}