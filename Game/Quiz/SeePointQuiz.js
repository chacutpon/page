import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../../../firebase'; 
import { collection, onSnapshot, query,   
 where } from 'firebase/firestore';

const SeePointQuiz = () => {

    const location = useLocation();
    const pin = location.state?.pin;
    const [players, setPlayers] = useState([]);
  
    useEffect(() => {
      const unsubscribe = onSnapshot(
        query(collection(db, 'players'), where('pin', '==', pin)),
        (snapshot) => {
          const playersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPlayers(playersData);
        }
      );
  
      return () => unsubscribe();
    }, [pin]);
  return (
    <div>
      <h1>Dashboard ครู</h1>
      <p>Game PIN: {pin}</p>
      <h2>คะแนนผู้เล่น:</h2>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.name}: {player.score || 0} คะแนน
          </li>
        ))}
      </ul>
      <Link to={'/teacher/create/quiz-game'}>
        <button>กลับ</button>
      </Link>
    </div>
  )
}

export default SeePointQuiz