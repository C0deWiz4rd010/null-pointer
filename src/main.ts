import './styles.css';
import { NullPointerApp } from './ui/NullPointerApp';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Missing #app root');
}

const app = new NullPointerApp(root);
app.mount();