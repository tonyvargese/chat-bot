import React, { useState, useRef } from "react";
import axios from "axios";
import "./index.css";
import image from "./img/bot_image.jpg";

function App() {
    const [userQuery, setUserQuery] = useState("");
    const [response, setResponse] = useState([]);
    const [error, setError] = useState("");
    const [botMessage, setBotMessage] = useState("");
    const inputRef = useRef();

    const badWords = ["badword1", "badword2", "badword3"]; // Extend this list
    const welcomeWords = ["hi", "hello", "good morning", "good evening"];
    const farewellWords = ["bye", "goodbye", "see you later"];
    const thanksWords = ["thank you", "thanks"];

    const handleQuery = () => {
        const userInput = userQuery.toLowerCase();

        // Check for bad words
        if (badWords.some((word) => userInput.includes(word))) {
            setBotMessage("Please avoid using offensive language.");
            setUserQuery("");
            return;
        }

        // Handle predefined responses
        if (welcomeWords.some((word) => userInput.includes(word))) {
            setBotMessage("Hello! How can I assist you today?");
            setUserQuery("");
            return;
        } else if (farewellWords.some((word) => userInput.includes(word))) {
            setBotMessage("Goodbye! Have a great day!");
            setUserQuery("");
            return;
        } else if (thanksWords.some((word) => userInput.includes(word))) {
            setBotMessage("You're welcome!");
            setUserQuery("");
            return;
        }

        // Fetch API response for specific queries.
        axios
            .post("http://localhost:5000/query", { query: userQuery })
            .then((res) => {
                setResponse(res.data);
                
                setError("");
                setUserQuery("");
            })
            .catch((err) => {
                console.error("Error:", err);
                setError("Error fetching data. Please try again.");
                setResponse([]);
            });
    };

    return (
        <div className="App">
            <div className="wrapper">
                <div className="content">
                    <div className="header">
                        <div className="img">
                            <img src={image} alt="" />
                        </div>
                    
                    
                        <div className="right">
                            <div className="name">ChatBot</div>
                            <div className="status">{error ? "Inactive" : "Active"}</div>
                        </div>
                    </div>
                    <hr  className="line"/>
                    <div className="main">
                        <div className="main_content">
                            <div className="messages">
                                {botMessage && <div className="bot-message">{botMessage}</div>}
                                {error && <div className="error-message">{error}</div>}
                                {response.length > 0 && (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Requirement ID</th>
                                                <th>Process Area</th>
                                                <th>Requirement Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {response.map((req, index) => (
                                                <tr key={index}>
                                                    <td>{req.requirement_id}</td>
                                                    <td>{req.process_area}</td>
                                                    <td>{req.requirement_description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bottom">
                        <div className="btm">
                            <div className="input">
                                <textarea
                                    rows="2"
                                    id="input"
                                    placeholder="Enter your query"
                                    ref={inputRef}
                                    value={userQuery}
                                    onChange={(e) => setUserQuery(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="btn">
                                <button onClick={handleQuery}>
                                    <i className="fas fa-paper-plane"></i>Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
