import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { db } from "../../../firebase"; // Adjust the path as needed
import { collection, addDoc, onSnapshot } from "firebase/firestore";

const CreateAskingGame = () => {
  const [storyEN, setStoryEN] = useState("");
  const [storyTH, setStoryTH] = useState("");
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      correctAnswer: "", // เปลี่ยนจาก answerOptions เป็น correctAnswer
    },
  ]);
  const quizGamesCollection = collection(db, "_games");

  useEffect(() => {
    const unsubscribe = onSnapshot(quizGamesCollection, (snapshot) => {
        // If you need to display existing quiz games, you can process the snapshot here
        console.log("Current quiz games:", snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
}, []);

  const handleStoryENChange = (text) => {
    setStoryEN(text);
  };

  const handleStoryTHChange = (text) => {
    setStoryTH(text);
  };

  const handleQuestionTextChange = (questionIndex, text) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].questionText = text;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange  
 = (questionIndex, text) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctAnswer = text;
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        correctAnswer: "",
      },
    ]);
  };
  const handleSubmit = async () => {
    const formData = {
        storyEN,
        storyTH,
        questions,
    };

    try {
        await addDoc(quizGamesCollection, formData);
        console.log("Quiz game added to Firestore!");

        // Clear the form after submission (if desired)
        setStoryEN("");
        setStoryTH("");
        setQuestions([
            {
                questionText: "",
                correctAnswer: "",
            },
        ]);
    } catch (error) {
        console.error("Error adding quiz game to Firestore: ", error);
        // Consider adding some user-friendly error handling here
    }
};
return (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
          สร้างเกมตอบคำถาม
      </Typography>

      <TextField
          label="Story (English)"
          multiline
          rows={4}
          value={storyEN}
          onChange={(e) => handleStoryENChange(e.target.value)}
          fullWidth
          margin="normal"
      />

      <TextField
          label="Story (Thai)"
          multiline
          rows={4}
          value={storyTH}
          onChange={(e) => handleStoryTHChange(e.target.value)}
          fullWidth
          margin="normal"
      />

      {questions.map((question, questionIndex) => (
          <Box key={questionIndex} sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                  คำถาม {questionIndex + 1}
              </Typography>
              <TextField
                  label="ข้อความคำถาม"
                  value={question.questionText}
                  onChange={(e) => handleQuestionTextChange(questionIndex, e.target.value)}
                  fullWidth
                  margin="normal"
              />
              <TextField
                  label="คำตอบที่ถูกต้อง"
                  value={question.correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(questionIndex, e.target.value)}
                  fullWidth
                  margin="normal"
              />
          </Box>
      ))}

      <Button variant="contained" color="primary" onClick={handleAddQuestion}>
          เพิ่มคำถาม
      </Button>
      <Button variant="contained" color="success" onClick={handleSubmit} sx={{ mt: 2 }}>
          ส่ง
      </Button>
      <Link to={'/teacher/create'}>
          <Button variant="contained" sx={{ mt: 2 }}>ย้อนกลับ</Button>
      </Link>
  </Box>
);
};

export default CreateAskingGame;