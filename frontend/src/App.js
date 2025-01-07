import React, { useState, useRef } from "react";
import axios from "axios";
import "./app.css";
import image1 from "./img/IQVIA.png";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
    const [userQuery, setUserQuery] = useState("");
    const [response, setResponse] = useState([]);
    const [error, setError] = useState("");
    const [botMessage, setBotMessage] = useState("");
    const inputRef = useRef();

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const records = response.slice(firstIndex, lastIndex);
    const npage = Math.ceil(response.length / recordsPerPage);
    const numbers = [...Array(npage + 1).keys()].slice(1);

    const badWords = ["badword1", "badword2", "badword3"]; // Extend this list
    const welcomeWords = ["hi", "hello", "good morning", "good evening"];
    const farewellWords = ["bye", "goodbye", "see you later"];
    const thanksWords = ["thank you", "thanks"];

    // Handle query submission
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

        // API call for user query
        axios
            .post("http://localhost:8080/query", { query: userInput })
            .then((res) => {
                setResponse(res.data);
                setError("");
                setBotMessage(""); // Clear bot message
            })
            .catch((err) => {
                console.error("Error:", err);
                setError("Error fetching data. Please try again.");
                setResponse([]);
            });

        setUserQuery(""); // Clear input after sending query
    };

    return (
        <div className="App">
            <div className="wrapper">
                <div className="content">
                    <div className="header">
                        <div className="img">
                            <img src={image1} alt="" />
                        </div>

                        <div className="right">
                            <div className="name">ChatBot</div>
                            <div className="status">{error ? "Inactive" : "Active"}</div>
                        </div>
                    </div>
                    <hr className="line" />
                    <div className="main">
                        <div className="main_content">
                            <div className="messages">
                            
                                {error && <div className="error-message">{error}</div>}
                                <div className="table-container" >
                                {response.length > 0 && (
    <>
                                        <table >
                                            <thead>
                                                <tr>
                                                    <th>Requirement ID</th>
                                                    <th>Process Area</th>
                                                    <th>Requirement Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {records.map((req, index) => (
                                                    <tr key={index}>
                                                        <td>{req.requirement_id}</td>
                                                        <td>{req.process_area}</td>
                                                        <td>{req.requirement_description}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                        <nav>
                                            <ul className="pagination justify-content-center" style={{ fontSize: "12px", margin: "0", padding: "0" }}>
                                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`} style={{ margin: "0 2px" }}>
                                                    <button className="page-link" onClick={prePage} style={{ padding: "5px 10px" }}>
                                                        Prev
                                                    </button>
                                                </li>
                                                {numbers.map((n, i) => (
                                                    <li key={i} className={`page-item ${currentPage === n ? "active" : ""}`} style={{ margin: "0 2px" }}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => changeCPage(n)}
                                                            style={{ padding: "5px 10px" }}
                                                        >
                                                            {n}
                                                        </button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${currentPage === numbers.length ? "disabled" : ""}`} style={{ margin: "0 2px" }}>
                                                    <button className="page-link" onClick={nextPage} style={{ padding: "5px 10px" }}>
                                                        Next
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </>
                                )}


                                </div>
                                {botMessage && <div className="bot-message">{botMessage}</div>}
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

    function prePage() {
        if (currentPage !== 1) {
            setCurrentPage(currentPage - 1);
        }
    }

    function changeCPage(id) {
        setCurrentPage(id);
    }

    function nextPage() {
        if (currentPage !== numbers.length) {
            setCurrentPage(currentPage + 1);
        }
    }
}

export default App;
