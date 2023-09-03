import { HeadComponent } from '@/components/HeadComponent'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <HeadComponent title="Home" />
      <div className={styles.container}>
        <h1 className={styles.title}>Concentration Game</h1>
        <Link href="/config">
          <div className={styles.button}>Start</div>
        </Link>
      </div>
    </>
  )
}
