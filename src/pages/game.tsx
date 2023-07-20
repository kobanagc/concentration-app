import { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from '@/styles/Game.module.css';

const Game = () => {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [pairs, setPairs] = useState<number>(0);
  const [includeJoker, setIncludeJoker] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // ゲームデータをローカルストレージから取得
    const gameData = localStorage.getItem('gameData');
    if (gameData) {
      const { numPlayers, numPairs, includeJoker, playerNames, selectedImages } = JSON.parse(gameData);
      setPlayerNames(playerNames);
      setPairs(numPairs);
      setIncludeJoker(includeJoker);
      setSelectedImages(selectedImages.map((file: File) => URL.createObjectURL(file)));
    }
  }, []);

  const generateCardId = (index: number): number => {
    // カードIDを生成するロジック（例：1からpairsまでの連番）
    return index % pairs + 1;
  };

  const getCardImagePath = (cardId: number): string => {
    const cardNumber = includeJoker ? cardId + 1 : cardId;
    return `/card${cardNumber}.png`;
  };

  const flipCard = (index: number) => {
    if (matchedCards.includes(index)) {
      return;
    }

    if (flippedCards.length === 2) {
      return;
    }

    if (flippedCards.includes(index)) {
      return;
    }

    setFlippedCards((prevCards) => [...prevCards, index]);

    if (flippedCards.length === 1) {
      const firstCardIndex = flippedCards[0];
      const firstCardId = generateCardId(firstCardIndex);
      const currentCardId = generateCardId(index);

      if (firstCardId === currentCardId) {
        setMatchedCards((prevCards) => [...prevCards, firstCardIndex, index]);
        setFlippedCards([]);
        // スコアを更新
        const newPlayerScores = [...playerScores];
        newPlayerScores[currentPlayerIndex]++;
        setPlayerScores(newPlayerScores);
      } else {
        setFlippedCards([]);
        setIsModalOpen(true); // モーダルを表示する
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    const nextPlayerIndex = (currentPlayerIndex + 1) % playerNames.length;
    setCurrentPlayerIndex(nextPlayerIndex);
  };

  const [playerScores, setPlayerScores] = useState<number[]>(Array(playerNames.length).fill(0));

  const getScoreText = (score: number): string => {
    if (score === 0) {
      return '0 pair';
    } else if (score === 1) {
      return `${score} pair`;
    } else {
      return `${score} pairs`;
    }
  };

  return (
    <>
      <Head>
        <title>Game</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.game}>
        <h1>Game Screen</h1>
        <div className={styles.currentPlayer}>
          <h2>Current Player:</h2>
          <p>{playerNames[currentPlayerIndex]}</p>
        </div>
        <div className={styles.playerNames}>
          <h2>Player Names:</h2>
          {playerNames.map((name, index) => (
            <p key={index}>
              Player {index + 1}: {name} (Score: {getScoreText(playerScores[index])})
            </p>
          ))}
        </div>
        {isModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <p>カードが違います。カードを戻します。</p>
              <button onClick={closeModal}>カードを戻す</button>
            </div>
          </div>
        )}
        <div className={styles.cardGrid}>
          {Array(pairs * 2)
            .fill(0)
            .map((_, index) => {
              const isFlipped = flippedCards.includes(index);
              const isMatched = matchedCards.includes(index);
              const cardId = generateCardId(index);
              const imagePath = isFlipped || isMatched ? getCardImagePath(cardId) : '/mark_question.png';

              return (
                <div key={index} className={styles.card} onClick={() => flipCard(index)}>
                  <img src={imagePath} alt="Card" className={isFlipped ? styles.flipped : ''} />
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default Game;
