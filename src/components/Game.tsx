import React, { useEffect, useRef, useState } from 'react';
import { useInterval } from '../hooks/useInterval';
import { useGameSounds } from '../hooks/useGameSounds';
import { Background } from './Background';
import { Bird } from './Bird';
import { Pipe as PipeComponent } from './Pipe';
import { ScoreDisplay } from './ScoreDisplay';
import { Pipe } from '../types/gameTypes';
import { getStoredHighScore, setStoredHighScore } from '../utils/storage';
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
  const [highScore, setHighScore] = useState(getStoredHighScore());
  const [gameOver, setGameOver] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const { playJump, playScore, playGameOver } = useGameSounds();
  const gameRef = useRef<HTMLDivElement>(null);

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

          if (newScore > highScore) {
            setHighScore(newScore);
            setStoredHighScore(newScore);
            setIsNewHighScore(true);
          }
          
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

      if (
        checkCollision(newBirdPosition, newPipes) ||
        newBirdPosition > 500 - GROUND_HEIGHT - BIRD_HEIGHT ||
        newBirdPosition < 0
      ) {
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
  };

  const handleClick = () => {
    if (!gameStarted || gameOver) {
      resetGame();
    } else {
      setBirdVelocity(JUMP_FORCE);
      playJump();
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
        
        {pipes.map((pipe, index) => (
          <PipeComponent key={index} x={pipe.x} height={pipe.height} />
        ))}

        <ScoreDisplay
          score={score}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          gameOver={gameOver}
          gameStarted={gameStarted}
          scoreFlash={scoreFlash}
          onRestart={resetGame}
        />
      </div>
    </div>
  );
}