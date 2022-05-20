import { motion } from "framer-motion";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Button from "../components/Button";
import Title from "../components/Title";
import styles from "../styles/index.module.scss";

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <motion.div
        initial={{
          y: -50,
        }}
        animate={{
          opacity: [0, 1],
          y: 0,
          transition: {
            type: "spring",
            duration: 0.4,
            mass: 1,
            stiffness: 100,
            damping: 5,
          },
        }}
      >
        <Title className={styles.title}>What are you looking for?</Title>
      </motion.div>
      <div className={styles.btnContainer}>
        <Button type="default">Give Phone Repairs</Button>
        <motion.div
          animate={{
            rotate: [0, -3, 3, 0],
            transition: {
              duration: 0.4,
              ease: "easeInOut",
              delay: 2,
            },
          }}
        >
          <Button
            type="cta"
            onClick={() => {
              router.push("/book-repair");
            }}
          >
            Get Phone Repaired
          </Button>
        </motion.div>
      </div>
      <img src={"./curly-arrow.svg"} alt="arrow" width={250} height={250} />
    </div>
  );
};

export default Home;
