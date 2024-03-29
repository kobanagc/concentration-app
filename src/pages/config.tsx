import { HeadComponent } from '@/components/HeadComponent';
import { useRouter } from 'next/router';
import styles from '@/styles/Config.module.css';
import { useState, useEffect } from 'react';

const Config = () => {
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [isJokerIncluded, setIsJokerIncluded] = useState<boolean>(false);
  const [numPairs, setNumPairs] = useState<number>(10);
  const [playerNames, setPlayerNames] = useState<string[]>(numPlayers ? Array(numPlayers).fill('') : []);
  const [isHardMode, setIsHardMode] = useState<boolean>(false);
  const [isPlayerShuffleModalOpen, setIsPlayerShuffleModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const numPairsOptions = [10, 20, 30]; // 50までは画像あり
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (darkModeQuery.matches) {
      setIsDarkMode(true);
    }

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };

    darkModeQuery.addEventListener('change', handleChange);

    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

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
    // 名前がスペースだけで構成されているかどうかを確認する
    const hasOnlySpacesName = playerNames.some(name => /^ *$/.test(name));
    if (hasOnlySpacesName) {
      alert('無効なプレイヤー名があります。');
      return;
    }
    if (numPlayers >= 2 ) {
      router.push('/game');
    } else {
      alert('プレイヤー数は2人以上を選択してください。');
      return;
    }
    // プレイ画面に遷移する処理を追加
    const formData = {
      isJokerIncluded,
      isHardMode,
      numPairs,
      playerNames,
      isPlayerOrderRandom: random
    };
    localStorage.setItem('gameData', JSON.stringify(formData));
  };

  const handleShuffleConfirmation = (shouldShuffle: boolean) => {
    setIsPlayerShuffleModalOpen(false);
    handleSubmit(undefined, shouldShuffle);
  };

  return (
    <>
      <HeadComponent title="Config" />
      <div className={styles.settings}>
        <h1 className={styles.title}>Config</h1>
        <form onSubmit={handleSubmit}>
          <label>
            <h2 className={styles.subtitle}>Number of Players</h2>
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
            <h2 className={styles.subtitle}>Joker</h2>
            <input
              type="checkbox"
              checked={isJokerIncluded}
              onChange={() => setIsJokerIncluded(!isJokerIncluded)}
              className={styles.checkbox}
            />
          </label>

          <label>
            <h2 className={styles.subtitle}>Number of Pairs</h2>
            <div className={styles.radios}>
              {numPairsOptions.map((npo, index) => (
                <div key={index}>
                  {npo}
                  <input
                    key={index}
                    type="radio"
                    name="numPairs"
                    value={npo}
                    defaultChecked={npo === 10}
                    onChange={(event) => setNumPairs(npo)}
                    className={styles.radio}
                  />
                </div>
              ))}
            </div>
          </label>

          <label>
          <h2 className={styles.subtitle}>Hard Mode</h2>
            <input
              type="checkbox"
              checked={isHardMode}
              onChange={() => setIsHardMode(!isHardMode)}
              className={styles.checkbox}
            />
          </label>

          <h2 className={styles.subtitle}>Player Names</h2>
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
            <div>
              <button onClick={() => handleShuffleConfirmation(true)}>はい</button>
              <button onClick={() => handleShuffleConfirmation(false)}>いいえ</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Config;
