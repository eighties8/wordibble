import Game from "@/components/Game";

function HomePage() {
  return <Game />;
}

HomePage.title = undefined;  // header shows just "Wordibble"
HomePage.narrow = false;     // game uses wider container

export default HomePage;
