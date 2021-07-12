import { atom } from "recoil";
import { IUser } from "../common/interface/user.interface";


export const userState = atom<IUser | null> ({
    key:"user",
    default: null
})