import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase'; 
import { collection, onSnapshot, query, where, doc, updateDoc, getDocs, increment } from 'firebase/firestore';

const GamePlay = () => {
    const location = useLocation();
    const quizGame = location.state?.quizGame; 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);  
    const navigate = useNavigate()
    const [error, setError] = useState(null); // เพิ่ม state สำหรับจัดเก็บข้อผิดพลาด
    const playerName = location.state?.name;
    const [timeLeft, setTimeLeft] = useState(15); // เริ่มต้นที่ 15 วินาที
    const [timeInterval, setTimeInterval] = useState(null);
    const pin = location.state?.pin;
 

  useEffect(() => {
    // เริ่มจับเวลาเมื่อ component mount
    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => (prevTimeLeft > 0 ? prevTimeLeft - 1 : 0));
    }, 1000);
    setTimeInterval(interval);

    // เคลียร์ interval เมื่อ component unmount หรือ timeLeft เหลือ 0
    return () => clearInterval(interval);
  }, []);
    useEffect(() => {
      // ล้าง navigation history เมื่อ component mount
      window.history.replaceState(null, '', '/user/index/play-game'); // หรือเส้นทางอื่นๆ ที่คุณต้องการ
  
      // ล้าง navigation history อีกครั้งเมื่อเกมจบลง
      return () => {
        window.history.replaceState(null, '', '/user/index'); // หรือเส้นทางอื่นๆ ที่คุณต้องการ
      };
    }, [navigate]); // เพิ่ม navigate เป็น dependency เพื่อให้สามารถเข้าถึงฟังก์ชัน navigate ได้
    useEffect(() => {
      // เริ่มต้นสถานะเกมเมื่อ component mount
      if (quizGame) {
        // TODO: อาจเพิ่ม logic อื่นๆ เช่น การตั้งเวลา หรือ การสุ่มคำถาม
      }
    }, [quizGame]);
  
    const handleAnswerSelect = (answerIndex) => {
      setSelectedAnswer(answerIndex);
    };
  
    const handleNextQuestion = async () => {
       
        try {
          // ค้นหาเอกสารผู้เล่น
          const q = query(collection(db, 'players'), where('name', '==', playerName));
          const querySnapshot = await getDocs(q);
          if (!playerName) { // ตรวจสอบว่า playerName มีค่าหรือไม่
            console.error('playerName is undefined');
            setError('เกิดข้อผิดพลาด: ไม่พบชื่อผู้เล่น');
            return; // หยุดการทำงานของฟังก์ชันหาก playerName เป็น undefined
          }
        
      if (!querySnapshot.empty) {
     
        const playerDoc = querySnapshot.docs[0];
        // ตรวจสอบคำตอบและอัปเดตคะแนน
        if (selectedAnswer !== null && quizGame && quizGame.questions && currentQuestionIndex < quizGame.questions.length) {
          const currentQuestion = quizGame.questions[currentQuestionIndex];
          if (currentQuestion.answerOptions[selectedAnswer].isCorrect) {
            // คำนวณคะแนนตาม timeLeft
            let pointsToAdd = 0;
            if (timeLeft > 10) {
              pointsToAdd = 3;
            } else if (timeLeft > 5) {
              pointsToAdd = 2;
            } else if (timeLeft > 0) {
              pointsToAdd = 1;
            }

            // อัปเดตคะแนนใน state
            setScore(score + pointsToAdd); 
            await updateDoc(playerDoc.ref, { score: increment(pointsToAdd) }); 
          }
        }
          } else {
            console.error('ไม่พบผู้เล่น:', playerName);
            setError('เกิดข้อผิดพลาดในการอัปเดตคะแนน: ไม่พบผู้เล่น'); 
          }
        } catch (error) {
          console.error('Error updating player score:', error);
          if (error.code === 'permission-denied') {
            setError('คุณไม่มีสิทธิ์ในการอัปเดตคะแนน');
          } else if (error.code === 'not-found') {
            setError('ไม่พบเอกสารผู้เล่น');
          } else {
            setError('เกิดข้อผิดพลาดในการอัปเดตคะแนน');
          }
        }
        clearInterval(timeInterval);
  
      // ไปยังคำถามถัดไป หรือจบเกมถ้าเป็นคำถามสุดท้าย
      //currentQuestionIndex: เก็บดัชนีของคำถามปัจจุบันที่กำลังแสดงอยู่ เริ่มต้นที่ 0 (คำถามแรก)
        //quizGame.questions.length: คือจำนวนคำถามทั้งหมดในเกม
        //quizGame.questions.length - 1: คือดัชนีของคำถามสุดท้าย (เนื่องจาก array เริ่มจาก 0)
      if (currentQuestionIndex < quizGame.questions.length - 1) { 
        //setCurrentQuestionIndex(currentQuestionIndex + 1);
        //เพิ่มค่า currentQuestionIndex ขึ้น 1 เพื่อให้ component re-render และแสดงคำถามถัดไป
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        //รีเซ็ตค่า selectedAnswer เป็น null เพื่อให้ radio button ของตัวเลือกคำตอบในคำถามถัดไปไม่มีตัวใดถูกเลือกไว้ล่วงหน้า
        setSelectedAnswer(null); 
       // สมมติว่า quizGame.questions มี 5 คำถาม:
       // ตอนเริ่มเกม currentQuestionIndex จะเป็น 0
        //เมื่อผู้ใช้ตอบคำถามแรกและกดปุ่ม "ถัดไป" handleNextQuestion จะถูกเรียก
       // currentQuestionIndex (0) จะน้อยกว่า quizGame.questions.length - 1 (4) ดังนั้นเงื่อนไขจะเป็นจริง
       // currentQuestionIndex จะถูกเพิ่มเป็น 1 และ selectedAnswer จะถูกรีเซ็ตเป็น null
       // component จะ re-render และแสดงคำถามที่ 2
       // กระบวนการนี้จะดำเนินต่อไปจนกระทั่ง currentQuestionIndex เป็น 4 (คำถามสุดท้าย)
       // เมื่อผู้ใช้ตอบคำถามสุดท้ายและกดปุ่ม "ถัดไป" เงื่อนไข currentQuestionIndex < quizGame.questions.length - 1 จะเป็นเท็จ และโค้ดในบล็อก else จะถูกดำเนินการแทน (เช่น แสดงผลคะแนน)
       setTimeLeft(15); // รีเซ็ตเวลาสำหรับคำถามถัดไป
       setTimeInterval(setInterval(() => {
         setTimeLeft((prevTimeLeft) => (prevTimeLeft > 0 ? prevTimeLeft - 1 : 0));
       }, 1000));

      } else {
        setTimeout(() => {
          alert('กำลังกลับไปหน้าหลัก')
          navigate('/user/index'); 
        }, 1000); 
      }
    };
  
    if (!quizGame) {
      return <div>Loading...</div>; 
    }
  
    const currentQuestion = quizGame?.questions?.[currentQuestionIndex];
  
    return (
      // เครื่องหมาย ? ใช้แทน ifelse
      <div>
         <p>เวลาที่เหลือ: {timeLeft} วินาที</p>
        <h1>{quizGame?.storyTH}</h1>
        <h2>คำถามที่ {currentQuestionIndex + 1}</h2>
        <p>{currentQuestion?.questionText}</p>
        <ul>
          {currentQuestion?.answerOptions?.map((option, index) => (
            <li key={index}>
              <label>
                <input
                  type="radio"
                  checked={selectedAnswer === index}
                  onChange={() => handleAnswerSelect(index)}
                />
                {option.answerText}
              </label>
            </li>
          ))}
        </ul>
        <button onClick={handleNextQuestion}>ถัดไป</button>
  
        {error && <p style={{ color: 'red' }}>{error}</p>} {/* แสดงข้อผิดพลาดหากมี */}
      </div>
    );
}

export default GamePlay