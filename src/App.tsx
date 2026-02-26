import { TodoProvider } from './context/TodoContext';
import { Wheel } from './components/Wheel/Wheel';
import './App.css';

function App() {
  return (
    <TodoProvider>
      <div className="App">
        <Wheel />
      </div>
    </TodoProvider>
  );
}

export default App;
