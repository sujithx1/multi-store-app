
import { Request, Response } from "express";
import z from "zod";
import { comparePassword } from "../../config/bycript";
import { createToken } from "../../config/jwt";
import { UserModel } from "../../models/user.model";


const  zodLoginSchema = z.object({
  email: z.email('invalid email'),
  password: z.string('password is required').min(6),
});


export const login = async (req:Request, res:Response) => {
  const body =await zodLoginSchema.safeParseAsync(req.body);
  if(!body.success){
    return res.status(400).json({error:body.error.issues[0].message})
  }




  const {email,password} = body.data

  const user = await UserModel.findOne({email})
  if(!user){
    return res.status(404).json({error:"user not found"})
  }

  const passwordMatch= await comparePassword(password,user.password)
  if(!passwordMatch){
    return res.status(401).json({error:"invalid password"})
  }
  const  token=createToken({userId:user._id.toString(),role:user.role})
  return res.status(200).json({token})



}