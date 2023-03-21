import styles from './index.module.less';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div>
        <div className={styles.title}>404</div>
        <div className={styles.desc}>NOT FOUND</div>
      </div>
    </div>
  );
}
