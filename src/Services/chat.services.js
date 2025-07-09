import axios from "axios";

const apiInstance = axios.create({
    baseURL:  "http://localhost:9001",   
    // baseURL:  "http://localhost:9001",   
  });

export const userChatRegister = async () => {
  const data = await apiInstance.post('/user/register');
  return data;
}

export const joinChat = async (userId, joinReferId) => {
    const res = await apiInstance.post('/user/joinchat', userId, joinReferId);
    return res;
};

export const getChatRoom = async (chatRoomId) => {
  const data = await apiInstance.get(`/user/getchatroom/${chatRoomId}`);
  return data;
};

//send message in post
export const sendMessageToChatRoom  = async (chatData, chatRoomId) => {
  const data = await apiInstance.post(`/user/sendMessage/${chatRoomId}`,chatData);
  return data;
};

//send message in get
export const getSendMessageChatRoom  = async (chatRoomId) => {
  const data = await apiInstance.get(`/user/sendMessage/${chatRoomId}`);
  return data;
};