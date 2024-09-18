import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase'; 
import  
 { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';

const GamePinQuiz = () => {
  const location = useLocation();
  const pin = location.state?.pin; // อ่านค่า pin จาก navigation state
  const quizGame = location.state?.quizGame; 
  const [playerNames, setPlayerNames] = useState([]);
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);

  const quizGamesCollection = collection(db, 'quiz_games');
  useEffect(() => {
    
    const unsubscribe = onSnapshot(
      query(collection(db, 'players'), where('pin', '==', pin)),
      (snapshot) => {
        const names = snapshot.docs.map((doc) => doc.data().name);
        setPlayerNames(names);
      }
    );
    

    return () => unsubscribe(); // Cleanup listener เมื่อ component unmount
  }, [pin]);
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'quiz_games', pin), (doc) => {
      if (doc.exists()) {
        setGameStarted(doc.data().gameStarted);
      }
    });

    return () => unsubscribe();
  }, [pin]);
  const handleStartGame = async () => {
    if (gameStarted) { // ตรวจสอบว่าเกมเริ่มไปแล้วหรือยัง
      alert('เกมได้เริ่มไปแล้ว');
      return;
    }
    try {
      // อัปเดต field `gameStarted` เป็น true ในเอกสาร quiz game ที่ตรงกับ PIN
      const quizGameRef = doc(quizGamesCollection, pin);
      await updateDoc(quizGameRef, { gameStarted: true });

      // นำทางไปยังหน้าตัวเกม (หรือหน้าอื่นๆ ตามต้องการ) พร้อมส่ง PIN ไปด้วย
      navigate('/teacher/create/quiz-game/see-point', { state: { pin,quizGame } }); // หรือเส้นทางอื่นๆ ที่คุณต้องการ
    } catch (error) {
      console.error('Error starting game:', error);
      if (error.code === 'permission-denied') {
        alert('คุณไม่มีสิทธิ์ในการเริ่มเกม');
      } else if (error.code === 'not-found') {
        alert('ไม่พบเอกสารเกม');
      } else {
        alert('เกิดข้อผิดพลาดในการเริ่มเกม กรุณาลองอีกครั้ง');
        // หรือแสดงข้อความแจ้งเตือนที่เฉพาะเจาะจงมากขึ้นตาม error.code หรือ error.message
      }
    }
  };
  return (
    <div>
      <h1>Game PIN: {pin}</h1>
      <h2>ผู้เล่นที่เข้าร่วม:</h2>
      <ul>
        {playerNames.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
      {!gameStarted && <button onClick={handleStartGame}>เริ่ม</button>} 
      {/* TODO: เพิ่มปุ่มหรือ UI อื่นๆ ที่จำเป็นในหน้านี้ */}
    </div>
  );
}
export default GamePinQuiz