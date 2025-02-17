import { Hono } from 'hono'
import { userRouter } from './user';
import { blogRouter } from './blog';

export const app = new Hono<{
  Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
  }
}>();

app.route('/api/v1/user', userRouter)
app.route('/api/v1/book', blogRouter)

export default app