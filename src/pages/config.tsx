import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/Config.module.css';
import { useState } from 'react';

const Config = () => {
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [includeJoker, setIncludeJoker] = useState<boolean>(false);
  const [numPairs, setNumPairs] = useState<number>(10);
  const [playerNames, setPlayerNames] = useState<string[]>(numPlayers ? Array(numPlayers).fill('') : []);
  const [isHardMode, setIsHardMode] = useState<boolean>(false);
  const [isPlayerShuffleModalOpen, setIsPlayerShuffleModalOpen] = useState<boolean>(false);
  const [isPlayerOrderRandom, setIsPlayerOrderRandom] = useState<boolean>(false);
  const router = useRouter();
  const numPairsOptions = [10, 20, 30, 40, 50];

  const handleNumPlayersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setNumPlayers(value);

    setPlayerNames((prevNames) => {
      if (value > prevNames.length) {
        const newNames = [...prevNames, ...Array(value - prevNames.length).fill('')];
        return newNames;
      } else {
        const newNames = prevNames.slice(0, value);
        return newNames;
      }
    });
  };

  const handlePlayerNameChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPlayerNames((prevNames) => {
      const newNames = [...prevNames];
      newNames[index] = value;
      return newNames;
    });
  };

  const handleSubmit = (event?: React.FormEvent, random?: boolean) => {
    event?.preventDefault();
    // プレイ画面に遷移する処理を追加
    const formData = {
      includeJoker,
      isHardMode,
      numPairs,
      playerNames,
      isPlayerOrderRandom: random
    };
    localStorage.setItem('gameData', JSON.stringify(formData));
    if (numPlayers >= 2 ) {
      router.push('/game');
    } else {
      alert('プレイヤー数は2人以上を選択してください。');
      return;
    }
  };

  return (
    <>
      <Head>
        <title>Config</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.settings}>
        <h1 className={styles.title}>Settings</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Number of Players:
            <input
              type="number"
              value={numPlayers}
              onChange={handleNumPlayersChange}
              min="2"
              max="10"
              className={styles.input}
            />
          </label>

          <label>
            Include Joker:
            <input
              type="checkbox"
              checked={includeJoker}
              onChange={() => setIncludeJoker(!includeJoker)}
              className={styles.checkbox}
            />
          </label>

          <label>
            Number of Pairs:
            {numPairsOptions.map((npo) => (
              <>
                <input
                  key={npo}
                  type="radio"
                  name="numPairs"
                  value={npo}
                  defaultChecked={npo === 10}
                  onChange={(event) => setNumPairs(npo)}
                  className={styles.input}
                />
                {npo}
              </>
            ))}
          </label>

          <label>
            Hard Mode:
            <input
              type="checkbox"
              checked={isHardMode}
              onChange={() => setIsHardMode(!isHardMode)}
              className={styles.checkbox}
            />
          </label>

          <h2 className={styles.subtitle}>Player Names:</h2>
          {playerNames.map((name, index) => (
            <label key={index} className={styles.label}>
              Player {index + 1}:
              <input
                type="text"
                value={name}
                onChange={(event) => handlePlayerNameChange(index, event)}
                required
                className={styles.input}
              />
            </label>
          ))}

          <button type="button" onClick={() => setIsPlayerShuffleModalOpen(true)} className={styles.button}>
            Start Game
          </button>
        </form>
      </div>
      {isPlayerShuffleModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p>順番をシャッフルしますか？</p>
            <button onClick={() => {
                setIsPlayerShuffleModalOpen(false);
                handleSubmit(undefined, true);
            }}>
              はい
            </button>
            <button onClick={() => {
                setIsPlayerShuffleModalOpen(false);
                handleSubmit(undefined, false);
            }}>
              いいえ
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Config;
