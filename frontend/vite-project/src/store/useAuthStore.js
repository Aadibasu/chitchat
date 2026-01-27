import {create} from 'zustand';
import {axiosInstance} from '../lib/axios';
import toast from 'react-hot-toast';

const useAuthStore = create((set,get) => ({
  authUser:null,
  isCheckingAuth:true,
  isSigningUp:false,
  isLoggingIn:false,

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
  },

 login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      toast.success("Logged in successfully");

      if (get().connectSocket) {
        get().connectSocket();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      if (get().disconnectSocket) {
        get().disconnectSocket();
      }
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

}));


export default useAuthStore;