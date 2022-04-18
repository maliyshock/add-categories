import MillerColumns from "./MillerColumns";
import { categoryTree } from "../category-tree";
import Layout from "./Layout";

function App() {
  return (
    <div className="app">
      <Layout>
        <MillerColumns data={categoryTree} />
      </Layout>
    </div>
  );
}

export default App;
