import MillerColumns from "./MillerColumns";
import { categoryTree } from "../category-tree"

function App() {
  return (
    <div className="app">
      <div className="app__column">
        <MillerColumns data={categoryTree}/>
      </div>

      <div className="app__column">

      </div>

      <div className="app__column">

      </div>
    </div>
  );
}

export default App;
