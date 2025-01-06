import World from "./containers/World";
import { SideBar, WorldFrame } from "./components";

function App() {
  return (
    <>
      <SideBar>test</SideBar>
      <WorldFrame>
        <World />
      </WorldFrame>
    </>
  );
}

export default App;
