import { PrismaClient } from "@prisma/client/extension";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
export const blogRouter=new Hono<{
    Bindings:{
    DATABASE_URL:string
    JWT_SECRET:string
    },
    Variables:{
        userId:string
    }
}>();

blogRouter.use('/*',async(c,next)=>{
    const jwt=c.req.header('Authorization')||"";
    if(!jwt)
        {
            c.status(403)
            return c.json({
                mssg:"unauthorized"
            })
        }
    const token=await verify(jwt,c.env.JWT_SECRET);
    if(!token)
        {
            c.status(403)
            return c.json({
                mssg:"unauthorized"
            })
        }
        if(typeof token.id==='string')
            {
                c.set("userId",token.id)
                await next();
            }
})

blogRouter.post('/create', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const post = await prisma.post.create({
		data: {
			title: body.title,
			content: body.content,
			authorId: userId
		}
	});
	return c.json({
		id: post.id
	});
})
blogRouter.put('/update', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	prisma.post.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content
		}
	});

	return c.text('updated post');
});
blogRouter.get('/bulk', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const posts = await prisma.post.find({});

	return c.json(posts);
})

blogRouter.get('/:id', async (c) => {
	const id = c.req.param('id');
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const post = await prisma.post.findUnique({
		where: {
			id
		}
	});

	return c.json(post);
});
