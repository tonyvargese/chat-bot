import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

// import React, { useState } from 'react';
// import axios from 'axios';
// import '../App.css'; // Optional for styling

// const Chatbot = () => {
//     const [userQuery, setUserQuery] = useState('');
//     const [response, setResponse] = useState([]);
//     const [error, setError] = useState('');

//     const handleQuery = () => {
//         console.log('Sending query:', userQuery);
//         axios.post('http://localhost:5000/query', { query: userQuery })
//             .then((res) => {
//                 console.log('Response:', res.data);
//                 setResponse(res.data);
//                 setError('');
//             })
//             .catch((err) => {
//                 console.error('Error:', err);
//                 setError('Error fetching data. Please try again.');
//                 setResponse([]);
//             });
//     };

//     return (
//         <div className="chatbot-container">
//             <h1>Chatbot</h1>
//             <textarea
//                 rows="4"
//                 cols="50"
//                 placeholder="Type your query here..."
//                 value={userQuery}
//                 onChange={(e) => setUserQuery(e.target.value)}
//             />
//             <br />
//             <button onClick={handleQuery}>Submit Query</button>
//             <br />
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             {response.length > 0 && (
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Requirement_id</th>
//                             <th>Process Area</th>
//                             <th>Requirement Description</th>
                            
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {response.map((req, index) => (
//                             <tr key={index}>
//                                 <td>{req.requirement_id}</td>
//                                 <td>{req.process_area}</td>
//                                 <td>{req.requirement_description}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// };

// export default Chatbot;
