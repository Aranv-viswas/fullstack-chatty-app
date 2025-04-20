import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create(
  persist(
    (set, get) => ({
      messagesByUser: {}, // per-user messages
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set({ users: res.data });
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          const existingMessages = get().messagesByUser;
          set({
            messagesByUser: {
              ...existingMessages,
              [userId]: res.data,
            },
          });
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser, messagesByUser } = get();
        try {
          const res = await axiosInstance.post(
            `/messages/send/${selectedUser._id}`,
            messageData
          );

          const userId = selectedUser._id;
          const userMessages = messagesByUser[userId] || [];

          set({
            messagesByUser: {
              ...messagesByUser,
              [userId]: [...userMessages, res.data],
            },
          });
        } catch (error) {
          toast.error(error.response.data.message);
        }
      },

      subscribeToMessages: () => {
        const { selectedUser } = get();
        const socket = useAuthStore.getState().socket;
        if (!selectedUser || !socket) return;

        socket.on("newMessage", (newMessage) => {
          const isMessageSentFromSelectedUser =
            newMessage.senderId === selectedUser._id;
          if (!isMessageSentFromSelectedUser) return;

          const messagesByUser = get().messagesByUser;
          const userMessages = messagesByUser[selectedUser._id] || [];

          set({
            messagesByUser: {
              ...messagesByUser,
              [selectedUser._id]: [...userMessages, newMessage],
            },
          });
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
      },

      setSelectedUser: (selectedUser) => set({ selectedUser }),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        messagesByUser: state.messagesByUser,
        selectedUser: state.selectedUser,
      }),
    }
  )
);
