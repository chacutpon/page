import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";



const CreateQuizGame = () => {
  
  const [storyTH, setStoryTH] = useState("");
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [quizGames, setQuizGames] = useState([]); // เพิ่ม state สำหรับเก็บข้อมูล quiz games
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      answerOptions: [
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
      ],
    },
  ]);
  const quizGamesCollection = collection(db, "quiz_games");
  useEffect(() => {
    const unsubscribe = onSnapshot(quizGamesCollection, (snapshot) => {
      const quizGamesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuizGames(quizGamesData);
    });

    return () => unsubscribe();
  }, []);
 
  const handleQuizGameSelect = async (quizGame) => {
    const generatedPIN = generatePIN(); 
    setPin(generatedPIN);
  
    // สร้างข้อมูลเกมใหม่โดยใช้คำถามเดิม แต่ไม่รวมข้อมูลอื่นๆ เช่น gameStarted หรือ playerNames
    const newQuizGameData = {
      storyTH: quizGame.storyTH,
      questions: quizGame.questions,
      gameStarted: false, // เริ่มต้นเกมใหม่
      pin: generatedPIN, 
    };
  
    try {
      // ลบเอกสาร quiz game เดิม
      await deleteDoc(doc(quizGamesCollection, quizGame.id)); 
  
      // สร้างเอกสารใหม่ใน collection "quiz_games" พร้อมกับกำหนด ID เอง
      const newQuizGameRef = doc(quizGamesCollection, generatedPIN);
      await setDoc(newQuizGameRef, newQuizGameData);
  
      console.log("Quiz game updated with new PIN in Firestore!");
    } catch (error) {
      console.error("Error updating quiz game in Firestore:", error);
      // TODO: เพิ่มการจัดการข้อผิดพลาดที่เหมาะสม
    }
  
    navigate("/teacher/create/quiz-game/game-pin", {
      state: { pin: generatedPIN, quizGame: newQuizGameData },
    });
  };
  
  const handleStoryTHChange = (text) => {
    setStoryTH(text);
  };

  const handleQuestionTextChange = (questionIndex, text) => {
    const updatedQuestions = [...questions];
    //อันนี้คือบอกลำดับ[questionIndex] ของตัวนี้ questionText = ข้อความก็คือตัวนี้ text
    updatedQuestions[questionIndex].questionText = text;
    //เรียกใช้ฟังก์ชัน setQuestions เพื่ออัปเดต state questions ด้วยค่าใหม่จาก updatedQuestions
    setQuestions(updatedQuestions);
  };
   //เพื่อให้เห็นภาพ
   //    questionText: "", [questionIndex] ลำดับของตัวนี้
     //  answerOptions: [ answerOptions[answerIndex] ลำดับของตัวนี้
      // { answerText: "", isCorrect: false },answerOptions[answerIndex].answerText คือตัวนนี้
      // { answerText: "", isCorrect: false },
      // { answerText: "", isCorrect: false },
      // { answerText: "", isCorrect: false },
     // ],
  const handleQuestionOptionChange = (questionIndex, answerIndex, text) => {
    const updatedQuestions = [...questions];
    //อันนี้คือบอกลำดับ[questionIndex] ของตัวนี้ answerOptions ที่ตำแหน่ง [answerIndex]ของตัวนี้ answerText = ข้อความก็คือตัวนี้ text
    updatedQuestions[questionIndex].answerOptions[answerIndex].answerText = text;
    setQuestions(updatedQuestions);
  };

//สมมตืผู้ใช้เลือกตัวเลือกคำตอบที่ 3 (ดัชนี 2) ของคำถามแรก (ดัชนี 0) เป็นคำตอบที่ถูกต้อง ดังนั้น:
//questionIndex = 0
//answerIndex = 2
//โค้ด updatedQuestions[questionIndex].answerOptions.forEach((option, idx) => (option.isCorrect = idx === answerIndex)); จะทำการวนลูปผ่านทุกตัวเลือกคำตอบในคำถามแรก และตั้งค่า isCorrect ดังนี้:
//ตัวเลือกแรก: idx = 0, 0 !== 2 ดังนั้น isCorrect = false
//ตัวเลือกที่สอง: idx = 1, 1 !== 2 ดังนั้น isCorrect = false
//ตัวเลือกที่สาม: idx = 2, 2 === 2 ดังนั้น isCorrect = true
//ตัวเลือกที่สี่: idx = 3, 3 !== 2 ดังนั้น isCorrect = false


  const handleCorrectAnswerChange = (questionIndex, answerIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answerOptions.forEach(
      (option, idx) => (option.isCorrect = idx === answerIndex)
    );
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    //เช็คเพื่อให้กรอกข้อมูลทุกอันก่อนไม่งั้นกด Add ไม่ได้
    if (
      !storyTH ||
      questions.some(
        (question) =>
          !question.questionText ||
          !question.answerOptions.some((option) => option.isCorrect)
      )
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return; // หยุดการทำงานของฟังก์ชัน หากข้อมูลไม่ครบ
    }
    //ถ้ากรอกครบแล้วใช้...questionsเพื่อกอปคำถามก่อนหน้าแล้วสร้างตัวใหม่ต่อไป
    setQuestions([
      ...questions,
      {
        questionText: "",
        answerOptions: [
          { answerText: "", isCorrect: false },
          { answerText: "", isCorrect: false },
          { answerText: "", isCorrect: false },
          { answerText: "", isCorrect: false },
        ],
      },
    ]);
  };
  const generatePIN = () => {
    const pinLength = 6;
    let pin = "";
    for (let i = 0; i < pinLength; i++) {
      pin += Math.floor(Math.random() * 10);
    }
    return pin;
  };
  
  const generatedPIN = generatePIN();
  
  const handleSubmit = async () => {
    
    setPin(generatedPIN);
    //เช็คเพื่อให้กรอกข้อมูลทุกอันก่อนไม่งั้นกด Submitไม่ได้
    if (
      !storyTH ||
      questions.some(
        (question) =>
          !question.questionText ||
          !question.answerOptions.some((option) => option.isCorrect)
      )
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return; // หยุดการทำงานของฟังก์ชัน หากข้อมูลไม่ครบ
    }

    const formData = { // ย้ายการประกาศ formData มาไว้ตรงนี้
      storyTH,
      questions,
      gameStarted: false,
    };

    navigate("/teacher/create/quiz-game/game-pin", {
      state: { pin: generatedPIN, quizGame: { ...formData } }, 
    });

    try {
      // สร้างเอกสารใหม่ใน collection "quiz_games" พร้อมกับกำหนด ID เอง
      const newQuizGameRef = doc(quizGamesCollection, generatedPIN);
      await setDoc(newQuizGameRef, formData);

      // บันทึก PIN ลงในเอกสารเดียวกัน
      await setDoc(newQuizGameRef, { pin: generatedPIN }, { merge: true }); 

      console.log("Quiz game added to Firestore with PIN!");

      // Clear the form after submission (if desired)
      setStoryTH("");
      setQuestions([
        {
          questionText: "",
          answerOptions: [
            { answerText: "", isCorrect: false },
            { answerText: "", isCorrect: false },
            { answerText: "", isCorrect: false  },
            { answerText: "", isCorrect:  false },
          ],
        },
      ]);
    } catch (error) {
      console.error("Error adding quiz game to Firestore:", error);
      if (error.code === "permission-denied") {
        alert("คุณไม่มีสิทธิ์ในการสร้างเกมใหม่");
      } else {
        alert("เกิดข้อผิดพลาดในการสร้างเกม กรุณาลองอีกครั้ง");
      }
    }
  };

  const handleDeleteQuizGame = async (quizGameId) => {
    try {
      // ลบเอกสาร quiz game จาก Firestore
      await deleteDoc(doc(quizGamesCollection, quizGameId));
      console.log("Quiz game deleted from Firestore!");
    } catch (error) {
      console.error("Error deleting quiz game from Firestore:", error);
      // TODO: เพิ่มการจัดการข้อผิดพลาดที่เหมาะสม
    }
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <div>
        <div>
          <label>Story (Thai):</label>
          <textarea
            value={storyTH}
            onChange={(e) => handleStoryTHChange(e.target.value)}
          />
        </div>
        {questions.map((question, questionIndex) => (
          <div key={questionIndex}>
            <h2>Question {questionIndex + 1}</h2>
            <input
              type="text"
              placeholder="Enter question text"
              value={question.questionText}
              onChange={(e) =>
                handleQuestionTextChange(questionIndex, e.target.value)
              }
            />
            <ul>
              {question.answerOptions.map((answerOption, answerIndex) => (
                <li key={answerIndex}>
                  <input
                    type="text"
                    placeholder={`Enter answer option ${answerIndex + 1}`}
                    value={answerOption.answerText}
                    onChange={(e) =>
                      handleQuestionOptionChange(
                        questionIndex,
                        answerIndex,
                        e.target.value
                      )
                    }
                  />
                  <label>
                    <input
                      type="radio"
                      checked={answerOption.isCorrect}
                      onChange={() =>
                        handleCorrectAnswerChange(questionIndex, answerIndex)
                      }
                    />
                    Correct
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
       
        <button onClick={handleAddQuestion}>Add Question</button>
        <button onClick={handleSubmit}>Submit</button>
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          เลือกแบบทดสอบที่มีอยู่
        </Typography>
        <List>
          {quizGames.map((quizGame) => (
            <ListItem 
              key={quizGame.id} 
              disablePadding
              secondaryAction={ // เพิ่มปุ่มลบ
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuizGame(quizGame.id)}>
                  ลบ
                </IconButton>
              }
            >
              <ListItemButton onClick={() => handleQuizGameSelect(quizGame)}>
                <ListItemText primary={quizGame.storyTH} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
       <Link to={'/teacher/create'}>
          <button>กลับ</button>
       </Link>
      </div>
    </Box>
  );
};

export default CreateQuizGame;
