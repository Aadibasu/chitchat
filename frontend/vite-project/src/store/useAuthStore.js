import { create } from 'zustand';
import {axiosInstance} from '../lib/axios';
import toast from 'react-hot-toast';

import { io } from "socket.io-client";

const useAuthStore = create((set,get) => ({
  authUser: null,
  socket: null, // will hold socket.io client instance
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      // establish socket connection if we already have a user
      if (res.data) {
        get().connectSocket();
      }
    } catch (err) {
      console.log("error checking auth :", err);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
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
      const msg = error?.response?.data?.message || error.message || "Signup failed";
      toast.error(msg);
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

      // fire up socket after successfully logging in
      get().connectSocket();
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Login failed";
      toast.error(msg);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      const msg = error?.response?.data?.message || error.message || "Update profile failed";
      toast.error(msg);
    }
  },

  // ------------------------------------------------------------------
  // socket helpers
  // ------------------------------------------------------------------
  connectSocket: () => {
    // avoid reconnecting
    if (get().socket) return;
    const url = import.meta.env.MODE === "development" ? "http://localhost:3000" : window.location.origin;
    const socket = io(url, {
      withCredentials: true,
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("socket connected", socket.id);
      // let server know which user joined (for direct messaging)
      const { authUser } = get();
      if (authUser) {
        socket.emit("join", authUser._id);
      }
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

}));


export default useAuthStore;

