import User from './User';
import Setting from './Setting';
import styles from './index.module.scss';

export default function Header() {
  return (
    <div className={styles.header}>
      <Setting />
      <User />
    </div>
  );
}
