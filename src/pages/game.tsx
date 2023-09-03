import { useEffect, useState } from 'react';
import { HeadComponent } from '@/components/HeadComponent';
import Image from 'next/image';
import styles from '@/styles/Game.module.css';
import Link from 'next/link'

const Game = () => {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [pairs, setPairs] = useState<number>(0);
  const [isJokerIncluded, setIsJokerIncluded] = useState<boolean>(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [isMismatchModalOpen, setIsMismatchModalOpen] = useState<boolean>(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState<boolean>(false);
  const [playerScores, setPlayerScores] = useState<number[]>([]);
  const [scoreDisplay, setScoreDisplay] = useState<boolean>(true);
  const [cardIds, setCardIds] = useState<number[]>([]);
  const [numOfDuplicates, setNumOfDuplicates] = useState<number>(0);
  const [isPlayerOrderRandom, setIsPlayerOrderRandom] = useState<boolean>(false);
  const [isSkipButtonDisplayed, setIsSkipButtonDisplayed] = useState<boolean>(false);
  const [enlargedImageSrc, setEnlargedImageSrc] = useState<string>('');

  useEffect(() => {
    // ゲームデータをローカルストレージから取得
    const gameData = localStorage.getItem('gameData');
    if (gameData) {
      const { numPairs, isJokerIncluded, isHardMode, playerNames, isPlayerOrderRandom } = JSON.parse(gameData);
      setIsPlayerOrderRandom(isPlayerOrderRandom);
      setIsJokerIncluded(isJokerIncluded);
      setNumOfDuplicates(isHardMode ? 3 : 2);
      if (isPlayerOrderRandom) {
        setPlayerNames(shuffleArray(playerNames));
      } else {
        setPlayerNames(playerNames);
      }
      setPairs(numPairs);
    }
  }, []);

  useEffect(() => {
    // playerNamesが入った状態でplayerScoresを初期化
    setPlayerScores(Array(playerNames.length).fill(0));
  }, [playerNames]);

  // pairsが変更されたら、新たにシャッフルされたカードIDの配列を作成
  useEffect(() => {
    if (isJokerIncluded) {
      setCardIds(chooseJoker(shuffleArray(Array((pairs + 1) * numOfDuplicates).fill(0).map((_, index) => generateCardId(index)))));
    } else {
      setCardIds(shuffleArray(Array(pairs * numOfDuplicates).fill(0).map((_, index) => generateCardId(index))));
    }
  }, [pairs]);

  // 全てのカードがマッチしていればゲーム終了のモーダルを表示
  useEffect(() => {
    if (matchedCards.length === pairs * numOfDuplicates) {
      setIsEndModalOpen(true);
    }
  }, [matchedCards, pairs, numOfDuplicates]);

  // 初回ロード時、ゲーム終了のモーダルを閉じる（初期設定） ※この位置じゃないと最初からモーダルが表示されてしまう。
  useEffect(() => {
    setIsEndModalOpen(false);
  }, []);

  // カードIDを生成（1からpairsまでの連番）
  const generateCardId = (index: number): number => {
    if (isJokerIncluded) {
      return index % (pairs + 1) + 1;
    }
    return index % pairs + 1;
  };

  // カードIDに対応する画像パスを取得
  const getCardImagePath = (cardId: number): string => {
    return `/card${cardId}.png`;
  };

  // 配列をシャッフルする関数
  function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // ランダムにジョーカーを選出
  function chooseJoker(arr: number[]): number[] {
    // 配列のコピーを作成する
    const newArr = [...arr];
    // ランダムなインデックスを生成する
    const randomIndex = Math.floor(Math.random() * newArr.length);
    // そのインデックスの要素を削除する
    newArr.splice(randomIndex, 1);
    return newArr;
  }

  // カードを反転（選択）する処理
  const flipCard = (index: number) => {
    // すでにマッチしたカードを選択した場合は何もしない。
    if (matchedCards.includes(index)) {
      return;
    }
    // 既に2枚選択されている場合も何もしない。
    if (flippedCards.length === numOfDuplicates) {
      return;
    }
    // 同じカードを選んだ場合も何もしない。
    if (flippedCards.includes(index)) {
      return;
    }
    // 選択したカードを反転（選択）したカードのリストに追加
    setFlippedCards((prevCards) => [...prevCards, index]);

    // Hard_Modeで2枚目を選択した場合
    if (numOfDuplicates === 3 && flippedCards.length === 1) {
      const firstCardIndex = flippedCards[0];
      const firstCardId = cardIds[firstCardIndex];
      const currentCardId = cardIds[index];
      if (firstCardId !== currentCardId) {
        setIsSkipButtonDisplayed(true);
      }
    }

    // 2枚目（Hard_modeは3枚目）のカードを選択した場合
    if (flippedCards.length === numOfDuplicates - 1) {
      const firstCardIndex = flippedCards[0];
      const firstCardId = cardIds[firstCardIndex];
      const secondCardIndex = flippedCards[1];
      const secondCardId = cardIds[secondCardIndex];
      const currentCardId = cardIds[index];

      setIsSkipButtonDisplayed(false);

      if (numOfDuplicates === 2) {
        // 選んだ2枚のカードが一致していたら
        if (firstCardId === currentCardId) {
          setMatchedCards((prevCards) => [...prevCards, firstCardIndex, index]); // 一致したカードのリストに追加
          setFlippedCards([]); // 反転（選択）したカードのリストを空に

          // スコアを更新
          const newPlayerScores = [...playerScores];
          newPlayerScores[currentPlayerIndex]++;
          setPlayerScores(newPlayerScores);
        } else { // 一致していなければ
          setTimeout(() => {
            setIsMismatchModalOpen(true); // モーダルを表示する
          }, 100);
        }
      } else if (numOfDuplicates === 3) {
        // 選んだ3枚のカードが一致していたら
        if (firstCardId === currentCardId && secondCardId === currentCardId) {
          setMatchedCards((prevCards) => [...prevCards, firstCardIndex, secondCardIndex, index]); // 一致したカードのリストに追加
          setFlippedCards([]); // 反転（選択）したカードのリストを空に

          // スコアを更新
          const newPlayerScores = [...playerScores];
          newPlayerScores[currentPlayerIndex]++;
          setPlayerScores(newPlayerScores);
        } else { // 一致していなければ
          setTimeout(() => {
            setIsMismatchModalOpen(true); // モーダルを表示する
          }, 100);
        }
      }
    }
  };

  // 不一致のモーダルを閉じる処理（カードを戻し、次のプレイヤーへ）
  const closeMismatchModal = () => {
    setFlippedCards([]);
    setIsMismatchModalOpen(false);
    const nextPlayerIndex = (currentPlayerIndex + 1) % playerNames.length;
    setCurrentPlayerIndex(nextPlayerIndex);
    setIsSkipButtonDisplayed(false);
  };

  const skipMyTurn = () => {
    setFlippedCards([]);
    setCurrentPlayerIndex((currentPlayerIndex + 1) % playerNames.length);
    setIsSkipButtonDisplayed(false);
  }

   // スコア表示のテキストを取得
  const getScoreText = (score: number): string => {
    if (scoreDisplay === false) {
      return '???';
    }
    if (score === 0) {
      return '0 point';
    } else if (score === 1) {
      return `${score} point`;
    } else {
      return `${score} points`;
    }
  };

  const changeScoreDisplay = () => {
    setScoreDisplay((prevDisplay) => !prevDisplay);
  };

  const handleImageClick = (src: string) => {
    if (src !== '/mark_question.png' && isMismatchModalOpen === false && isEndModalOpen === false) {
      setEnlargedImageSrc(src);
    }
  };

  // ゲームをリセットする関数。
  // 新しいカードの並びを設定し、現在のプレイヤーを0番目にする。
  // また、flippedCards、matchedCardsを初期化し、スコアも全員0に戻す。
  // モーダルの表示も全て閉じる。
  const resetGame = () => {
    if (isJokerIncluded) {
      setCardIds(chooseJoker(shuffleArray(Array((pairs + 1) * numOfDuplicates).fill(0).map((_, index) => generateCardId(index)))));
    } else {
      setCardIds(shuffleArray(Array(pairs * numOfDuplicates).fill(0).map((_, index) => generateCardId(index))));
    }
    if (isPlayerOrderRandom) {
      setPlayerNames(shuffleArray(playerNames));
    }
    setCurrentPlayerIndex(0);
    setFlippedCards([]);
    setMatchedCards([]);
    setPlayerScores(Array(playerNames.length).fill(0));
    setIsMismatchModalOpen(false);
    setIsEndModalOpen(false);
  };

  return (
    <>
      <HeadComponent title="Game" />
      <div className={styles.game}>
        <div className={styles.currentPlayer}>
          <h2>Current Player:</h2>
          <p>{playerNames[currentPlayerIndex]}</p>
        </div>
        <div className={styles.playerNames}>
          <h2>Players:</h2>
          {playerNames.map((name, index) => (
            <p key={index}>
              {name} (Score: {getScoreText(playerScores[index])})
            </p>
          ))}
        </div>
        <div>
          <button onClick={changeScoreDisplay}>
            {scoreDisplay ? 'スコアを隠す' : 'スコアを表示'}
          </button>
          {isSkipButtonDisplayed && (
            <button onClick={skipMyTurn}>3枚目をSkipする</button>
          )}
        </div>
        {isMismatchModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <p>You missed...</p>
              <button onClick={closeMismatchModal}>カードを戻す</button>
            </div>
          </div>
        )}
        {isEndModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              {(() => {
                const maxScore = Math.max(...playerScores);
                const winners = playerNames.filter((_, index) => playerScores[index] === maxScore);

                if (winners.length === playerNames.length) {
                  return <h2>Draw...</h2>;
                }

                return <h2>Winner: {winners.join(", ")}</h2>;
              })()}
              <div>
                <button onClick={resetGame}>同じ設定で遊ぶ</button>
                <Link href="/config">
                  <button>設定を変更する</button>
                </Link>
              </div>
            </div>
          </div>
        )}
        <div className={styles.cardGrid}>
          {cardIds.map((cardId, index) => {
            const isFlipped = flippedCards.includes(index);
            const isMatched = matchedCards.includes(index);
            const imagePath = isFlipped || isMatched ? getCardImagePath(cardId) : '/mark_question.png';

            return (
              <div key={index} className={styles.card} onClick={() => flipCard(index)}>
                <Image
                  src={imagePath}
                  alt="Card"
                  className={isFlipped ? styles.flipped : ''}
                  width={100}
                  height={150}
                  onClick={() => handleImageClick(imagePath)}
                />
              </div>
            );
          })}
        </div>
        {enlargedImageSrc && (
          <div className={styles.enlargedCard}>
            <Image
              src={enlargedImageSrc}
              alt="Enlarged"
              width={300}
              height={300}
            />
            <button onClick={() => setEnlargedImageSrc('')}>Close</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Game;
