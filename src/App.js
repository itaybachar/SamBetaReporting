import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

import TaskList from './components/task-list.component.js'

function App() {
  return (
    <Router>
      <div className='container'>
        <br />
        <Route path='/' exact component={TaskList} />
      </div>
    </Router>
  );
}

export default App;
