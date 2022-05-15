import type { NextPage } from "next";
import { useRouter } from "next/router";
import Button from "../components/Button";
import Title from "../components/Title";
import styles from "../styles/index.module.scss";

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <Title className={styles.title}>What are you looking for?</Title>
      <div className={styles.btnContainer}>
        <Button type="default">
          Give Phone Repairs
        </Button>
        <Button type="cta" onClick={() => {
          router.push("/book-repair");
        }}>
          Get Phone Repaired
        </Button>
      </div>
      <img src={"./curly-arrow.svg"} alt="arrow" width={250} height={250} />
    </div>
  );
};

export default Home;
