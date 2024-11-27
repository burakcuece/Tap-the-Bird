import React, { useEffect, useRef, useState } from 'react';
import { useInterval } from '../hooks/useInterval';
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
} from '../constants/gameConstants';

export default function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [birdPosition, setBirdPosition] = useState(250);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(getStoredHighScore());
  const [gameOver, setGameOver] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);

  const generatePipe = (x: number): Pipe => ({
    x,
    height: Math.random() * (PIPE_CONFIG.MAX_HEIGHT - PIPE_CONFIG.MIN_HEIGHT) + PIPE_CONFIG.MIN_HEIGHT,
    passed: false,
  });

  const checkCollision = (birdPos: number, pipes: Pipe[]): boolean => {
    return pipes.some(pipe => {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      if (BIRD_X + BIRD_WIDTH > pipeLeft && BIRD_X < pipeRight) {
        const topPipeBottom = pipe.height;
        const bottomPipeTop = pipe.height + PIPE_GAP;
        
        return birdPos < topPipeBottom || birdPos + BIRD_HEIGHT > bottomPipeTop;
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

      const newBirdVelocity = birdVelocity + GRAVITY;
      const newBirdPosition = birdPosition + newBirdVelocity;
      setBirdVelocity(newBirdVelocity);
      setBirdPosition(newBirdPosition);

      const newPipes = pipes.map(pipe => {
        const newX = pipe.x - PIPE_SPEED;
        
        if (!pipe.passed && newX + PIPE_WIDTH < BIRD_X) {
          const newScore = score + 1;
          setScore(newScore);
          
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
        newBirdPosition > 500 - BIRD_HEIGHT ||
        newBirdPosition < 0
      ) {
        setGameOver(true);
      }
    },
    gameStarted && !gameOver ? 16 : null
  );

  const resetGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setBirdPosition(250);
    setBirdVelocity(0);
    setPipes([generatePipe(PIPE_CONFIG.SPAWN_X)]);
    setScore(0);
    setIsNewHighScore(false);
  };

  const handleClick = () => {
    if (!gameStarted || gameOver) {
      resetGame();
    } else {
      setBirdVelocity(JUMP_FORCE);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center">
      <div 
        className="relative w-[400px] h-[500px] bg-blue-300 rounded-lg shadow-2xl overflow-hidden cursor-pointer" 
        onClick={handleClick}
        ref={gameRef}
      >
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
          onRestart={resetGame}
        />
      </div>
    </div>
  );
}