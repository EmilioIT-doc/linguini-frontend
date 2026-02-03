import Collage from "./home/Collage";
import Introduction from "./home/Introduction";

export default function Home() {
  return (
    <div>
      <section>
        <Collage/>
      </section>
      <section>
        <Introduction/>
      </section>
    </div>
  );
}
