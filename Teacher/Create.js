import React from "react";
import { Link } from "react-router-dom";

const Create = () => {
  return (
    <div>
      <p>
        <Link to="/teacher/create/asking-game">
          <button>พิมตอบคำถาม</button>
        </Link>
      </p>
      <p>
        <Link to="/teacher/create/group-game">
          <button>ตอบคำถามแบบกลุ่ม</button>
        </Link>
      </p>
      <p>
        <Link to="/teacher/create/quiz-game">
          <button>ควิซ</button>
        </Link>
      </p>
      <p>
        <Link to="/teacher/index">
          <button>ย้อนกลับ</button>
        </Link>
      </p>
      <p>
        <Link to="/teacher/create/player-score">
          <button>score</button>
        </Link>
      </p>
    
    </div>
  );
};

export default Create;
