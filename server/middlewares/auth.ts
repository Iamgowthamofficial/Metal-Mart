import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";


export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try{

        const {userId} = await req.auth();

        if(!userId){
            return res.status(401).json({error: "Unauthorized"})
        }
        let user = await User.findOne({clerkId: userId});
        req.user = user;
        next();
    }
    catch(error){
        console.error('Error verifying webhook:', error)
        return res.status(400).send('Error verifying webhook')

    }
    
};

export const authorize = (...roles: string[])=>{
return (req:Request, res:Response, next:NextFunction)=>{
    if(!roles.includes(req.user.role)){
        return res.status(403).json({error: "Forbidden"})
    }
    next();
}
}