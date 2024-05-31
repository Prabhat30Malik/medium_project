import { Prisma ,PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import {sign,verify } from "hono/jwt"

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

userRouter.post("/signup",async(c)=>{
    const body=await c.req.json();
    const prisma =new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate());
        console.log("hi");
        const user=await prisma.user.create({
            data:{
                username:body.username,
                password:body.password
            },
        });
        const token= await sign({id:user.id},c.env.JWT_SECRET);
        return c.json({
            jwt:token
        });
});



userRouter.post('/signin',async(c)=>{
    const body=await c.req.json();
    const prisma =new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const user=await prisma.user.findUnique({
        where:{
            username:body.username,
            password:body.password
        }
    });
    if(!user)
        {
            c.status(403)
            return c.json({
                mssg:"user does not exist"
            })
        }
    const token=await sign({id:user.id},c.env.JWT_SECRET);
    return c.json({
        jwt:token
    });
});

