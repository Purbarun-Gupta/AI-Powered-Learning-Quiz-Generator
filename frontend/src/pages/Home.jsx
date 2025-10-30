import { useState } from "react";

const Home = () => {
  const [file, setFile] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // --- Professional Palette and Constants ---
  const PRIMARY_BLUE = "#0056b3"; // Deeper, more sophisticated blue
  const ACCENT_GRAY = "#e9ecef"; // Very light, professional gray
  const TEXT_DARK = "#212529"; // Near-black text
  const BORDER_COLOR = "#ced4da"; // Subtle border gray
  const SUCCESS_COLOR = "#28a745"; // Standard professional green
  const DANGER_COLOR = "#dc3545"; // Standard professional red
  const SECONDARY_COLOR = "#6c757d"; // Muted gray for progress text

  // Base styling object for consistency
  const baseStyles = {
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    transition: "all 0.3s ease",
  };

  const containerStyle = {
    ...baseStyles,
    maxWidth: "900px",
    margin: "3rem auto",
    padding: "2rem",
    backgroundColor: "white",
    minHeight: "80vh",
    borderRadius: "10px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
    color: TEXT_DARK,
  };

  const buttonBaseStyle = {
    ...baseStyles,
    padding: "0.75rem 1.5rem",
    borderRadius: "6px",
    border: "1px solid transparent",
    fontWeight: "500",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    userSelect: "none",
  };

  const primaryButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: PRIMARY_BLUE,
    color: "white",
  };

  const primaryButtonHoverStyle = {
    backgroundColor: "#004085",
    transform: "translateY(-1px)",
    boxShadow: "0 5px 10px rgba(0,0,0,0.15)",
  };

  const fileInputWrapperStyle = {
    ...primaryButtonStyle,
    backgroundColor: "white",
    color: PRIMARY_BLUE,
    border: `2px solid ${PRIMARY_BLUE}`,
    position: "relative",
    overflow: "hidden",
    textAlign: "center",
    display: "inline-block",
    cursor: "pointer",
  };

  const fileInputStyle = {
    position: "absolute",
    left: 0,
    top: 0,
    opacity: 0,
    cursor: "pointer",
    height: "100%",
    width: "100%",
  };

  const optionButtonStyle = (opt) => {
    let backgroundColor = ACCENT_GRAY;
    let color = TEXT_DARK;
    let border = `1px solid ${BORDER_COLOR}`;
    let cursor = "pointer";
    let hoverStyle = { backgroundColor: BORDER_COLOR, transform: "translateX(2px)" };

    if (selectedOption === opt) {
      if (opt === quiz.questions[currentQuestion].answer) {
        backgroundColor = SUCCESS_COLOR;
        color = "white";
        border = `1px solid ${SUCCESS_COLOR}`;
        hoverStyle = {};
      } else {
        backgroundColor = DANGER_COLOR;
        color = "white";
        border = `1px solid ${DANGER_COLOR}`;
        hoverStyle = {};
      }
      cursor = "not-allowed";
    } else if (selectedOption) {
      cursor = "not-allowed";
      if (opt === quiz.questions[currentQuestion].answer) {
        border = `2px solid ${SUCCESS_COLOR}`;
        backgroundColor = SUCCESS_COLOR + '20';
        color = TEXT_DARK;
      }
      hoverStyle = {};
    }

    return {
      ...buttonBaseStyle,
      textAlign: "left",
      backgroundColor,
      color,
      border,
      cursor,
      margin: "0.5rem 0",
      boxShadow: "none",
      paddingLeft: "1.5rem",
      ":hover": hoverStyle,
    };
  };

  // --- Component Logic ---

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
      setScore((prevScore) => prevScore + 1);
    }

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

  const resetQuiz = () => {
    setQuiz(null);
    setFile(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedOption(null);
  };

  // --- Render ---

  return (
    <div style={containerStyle}>
      <h1 style={{ color: PRIMARY_BLUE, textAlign: "center", marginBottom: "3rem", fontSize: "2.5rem", fontWeight: "300" }}>
        Document Quiz Generator
      </h1>

      {/* --- Quiz Generation Form (Visible only when no quiz is loaded) --- */}
      {!quiz && (
        <form
          onSubmit={handlesubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
            padding: "3rem",
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: "8px",
            backgroundColor: ACCENT_GRAY,
          }}
        >
          <p style={{ fontSize: "1.2rem", fontWeight: "400", color: TEXT_DARK }}>
            Select a PDF file to instantly generate a multiple-choice quiz.
          </p>

          <div
            style={fileInputWrapperStyle}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = ACCENT_GRAY; e.currentTarget.style.color = "#004085"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = PRIMARY_BLUE; }}
          >
            {file ? `Selected: ${file.name}` : "Upload Document (PDF)"}
            <input
              type="file"
              id="myfile"
              name="myfile"
              accept=".pdf"
              onChange={handleChange}
              style={fileInputStyle}
            />
          </div>

          <button
            type="submit"
            style={primaryButtonStyle}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = primaryButtonHoverStyle.backgroundColor; e.currentTarget.style.transform = primaryButtonHoverStyle.transform; e.currentTarget.style.boxShadow = primaryButtonHoverStyle.boxShadow; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = primaryButtonStyle.backgroundColor; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = primaryButtonStyle.boxShadow; }}
            disabled={!file}
          >
            Generate Quiz
          </button>
        </form>
      )}

      {/* --- Quiz Card (Visible when quiz is loaded and not finished) --- */}
      {quiz && !showScore && (
        <div style={{ padding: "2rem", border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px" }}>
          <h2 style={{ color: PRIMARY_BLUE, fontSize: "1.8rem", borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: "0.5rem" }}>
            {quiz.title || "Generated Quiz"}
          </h2>
          <p style={{ color: SECONDARY_COLOR, marginBottom: "2rem", fontSize: "1rem" }}>
            Progress: Question {currentQuestion + 1} of {quiz.questions.length}
          </p>

          <h3 style={{ marginBottom: "2rem", fontSize: "1.5rem", lineHeight: "1.5" }}>
            {quiz.questions[currentQuestion].question}
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {quiz.questions[currentQuestion].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                style={optionButtonStyle(opt)}
                onMouseEnter={e => {
                  if (!selectedOption) {
                    e.currentTarget.style.backgroundColor = BORDER_COLOR;
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!selectedOption) {
                    e.currentTarget.style.backgroundColor = ACCENT_GRAY;
                    e.currentTarget.style.transform = 'none';
                  }
                }}
                disabled={!!selectedOption}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- Score Card (Visible when quiz is finished) --- */}
      {showScore && (
        <div style={{ padding: "3rem", textAlign: "center", border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", backgroundColor: ACCENT_GRAY }}>
          <h2 style={{ color: SUCCESS_COLOR, fontSize: "2.2rem", marginBottom: "1rem" }}>🎉 Quiz Complete!</h2>
          <p style={{ fontSize: "1.8rem", margin: "1.5rem 0", fontWeight: "600" }}>
            Final Score: <span style={{ color: PRIMARY_BLUE }}>{score}</span> out of {quiz.questions.length}
          </p>
          <button
            onClick={resetQuiz}
            style={primaryButtonStyle}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = primaryButtonHoverStyle.backgroundColor; e.currentTarget.style.transform = primaryButtonHoverStyle.transform; e.currentTarget.style.boxShadow = primaryButtonHoverStyle.boxShadow; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = primaryButtonStyle.backgroundColor; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = primaryButtonStyle.boxShadow; }}
          >
            Start New Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;