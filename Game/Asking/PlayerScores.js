import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase'; 
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const PlayerScores = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'players'), (snapshot) => {
      const playersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(playersData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>คะแนนผู้เล่น</h1>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.name}: {player.score || 0} คะแนน
          </li>
        ))}
      </ul>
      <Link to={'/teacher/create/'}>
      <button>กลับ</button>
      </Link>
       


    </div>
  );
};

export default PlayerScores;