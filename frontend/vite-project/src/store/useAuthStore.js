import {create} from 'zustand';
import {axiosInstance} from '../lib/axios';

const useAuthStore = create((set,get) => ({
  authUser:null,
  isCheckingAuth:true,
  checkAuth :async()=>{
    try{
      const res = await axiosInstance.get("/auth/check");
      set({authUser : res.data})
    }catch(err){
      console.log("error checking auth :",err);
      set({authUser:null})
    }finally{
      set({isCheckingAuth :false});
    }
  },

  signup : async (data)=>{
    set({isSigningUp:true});
    try{
      const res = await axiosInstance.post("/auth/signup",data);
      set({authUser:res.data});

      toast.success("Account created successfully");
      //toast
    }catch(error){
      toast.error(error.response.data.message  );
    }finally{
      set({isSigningUp:false});
    }
  }
}));


export default useAuthStore;