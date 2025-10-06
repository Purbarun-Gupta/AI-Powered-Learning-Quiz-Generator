import { useState } from "react";

const Home = () => {
  const [file, setFile] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first.");
    const formData = new FormData();
    formData.append("myfile", file);

    try {
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);

      const result = await response.json();
      setQuiz(result.quiz);
      setCurrentQuestion(0);
      setScore(0);
      setShowScore(false);
      setSelectedOption(null);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleAnswer = (option) => {
    setSelectedOption(option);
    if (option === quiz.questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    // Move to next question after short delay
    setTimeout(() => {
      const next = currentQuestion + 1;
      if (next < quiz.questions.length) {
        setCurrentQuestion(next);
        setSelectedOption(null);
      } else {
        setShowScore(true);
      }
    }, 800);
  };

  return (
    <div className="container" style={{ padding: "2rem", fontFamily: "Arial" }}>
      {!quiz && (
        <form onSubmit={handlesubmit} style={{ marginBottom: "2rem" }}>
          <label htmlFor="myfile">Select a PDF file:</label>
          <input
            type="file"
            id="myfile"
            name="myfile"
            onChange={handleChange}
            style={{ margin: "0 1rem" }}
          />
          <button type="submit">Generate Quiz</button>
        </form>
      )}

      {quiz && !showScore && (
        <div
          className="quiz-card"
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <h2>{quiz.title}</h2>
          <p>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
          <h3>{quiz.questions[currentQuestion].question}</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginTop: "1rem",
            }}
          >
            {quiz.questions[currentQuestion].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "5px",
                  border: "1px solid #333",
                  backgroundColor:
                    selectedOption === opt
                      ? opt === quiz.questions[currentQuestion].answer
                        ? "lightgreen"
                        : "salmon"
                      : "white",
                  cursor: selectedOption ? "not-allowed" : "pointer",
                }}
                disabled={!!selectedOption}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {showScore && (
        <div className="score-card" style={{ textAlign: "center" }}>
          <h2>Quiz Completed!</h2>
          <p>
            You scored {score} out of {quiz.questions.length}
          </p>
          <button
            onClick={() => {
              setQuiz(null);
              setFile(null);
              setCurrentQuestion(0);
              setScore(0);
              setShowScore(false);
              setSelectedOption(null);
            }}
          >
            Take Another Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
